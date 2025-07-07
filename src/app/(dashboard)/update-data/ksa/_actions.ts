/* eslint-disable @typescript-eslint/no-explicit-any */
// Lokasi File: src/app/(dashboard)/update-data/ksa/_actions.ts
"use server";

import { createSupabaseServerClientWithUserContext } from "@/lib/supabase-server";
import { supabaseServer } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import * as xlsx from 'xlsx';

// Tipe untuk respons action
interface ActionResult {
  success: boolean;
  message: string;
  importedCount?: number;
  errorDetails?: string;
}

// Helper untuk mapping kode kabupaten
const KABUPATEN_MAP: { [key: string]: string } = {
    "6101": "Sambas", "6102": "Bengkayang", "6103": "Landak", "6104": "Mempawah",
    "6105": "Sanggau", "6106": "Ketapang", "6107": "Sintang", "6108": "Kapuas Hulu",
    "6109": "Sekadau", "6110": "Melawi", "6111": "Kayong Utara", "6112": "Kubu Raya",
    "6171": "Pontianak", "6172": "Singkawang"
};

export async function uploadKsaAction(formData: FormData): Promise<ActionResult> {
  const cookieStore = await cookies();
  const supabaseUserContext = await createSupabaseServerClientWithUserContext(cookieStore);

  const { data: { user } } = await supabaseUserContext.auth.getUser();
  if (user?.user_metadata?.role !== "super_admin") {
    return { success: false, message: "Akses ditolak." };
  }
  const username = user.user_metadata?.username || user.email || 'tidak_diketahui';

  const files = formData.getAll("files") as File[];
  if (!files || files.length === 0) {
    return { success: false, message: "Tidak ada file yang dipilih." };
  }

  const allRowsToInsert: any[] = [];
  const uniqueDeletionScopesSet = new Set<string>();
  const uploadedAt = new Date().toISOString();
  let skippedRowCount = 0;

  try {
    for (const file of files) {
      const buffer = await file.arrayBuffer();
      const workbook = xlsx.read(buffer, { type: "buffer", cellDates: true });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(sheet) as any[];

      // --- LOGIKA OPSI 3 DIMULAI ---
      // Variabel untuk menyimpan tanggal fallback per file. Direset untuk setiap file baru.
      let fallbackTahun: number | null = null;
      let fallbackBulan: number | null = null;

      for (const record of jsonData) {
        const idSegmenValue = record['id segmen'];
        const tanggalValue = record.tanggal;

        if (!idSegmenValue) {
           console.warn(`Melewatkan baris karena 'id segmen' kosong:`, record);
           skippedRowCount++;
           continue;
        }

        let tahun: number | null = null;
        let bulan: number | null = null;
        let tanggalISO: string | null = null;
        
        // Coba proses tanggal dari baris saat ini
        if (tanggalValue) {
            const parsedDate = new Date(tanggalValue);
            if (!isNaN(parsedDate.getTime())) {
                tahun = parsedDate.getFullYear();
                bulan = parsedDate.getMonth() + 1; 
                tanggalISO = parsedDate.toISOString();

                // Jika fallback belum ada, simpan dari baris valid pertama ini
                if (fallbackTahun === null) {
                    fallbackTahun = tahun;
                    fallbackBulan = bulan;
                }
            }
        }
        
        // Jika baris ini tidak punya tanggal, gunakan fallback (jika sudah ditemukan)
        if (tahun === null && bulan === null) {
            tahun = fallbackTahun;
            bulan = fallbackBulan;
        }

        // Safeguard Akhir: Jangan proses baris jika tahun/bulan tetap null 
        // (terjadi jika seluruh file tidak punya tanggal valid sama sekali)
        if (tahun === null || bulan === null) {
            console.warn(`Melewatkan baris karena tidak ada informasi Tahun/Bulan yang bisa digunakan (baik dari baris maupun fallback):`, record);
            skippedRowCount++;
            continue;
        }
        // --- LOGIKA OPSI 3 BERAKHIR ---
        
        const idSegmenStr = idSegmenValue.toString();
        const kode_kab = idSegmenStr.substring(0, 4);
        const kode_kec = idSegmenStr.substring(4, 7);
        const kabupaten = KABUPATEN_MAP[kode_kab] || "Kabupaten Tidak Dikenal";

        const scopeKey = `${tahun}-${bulan}-${kode_kab}`;
        uniqueDeletionScopesSet.add(scopeKey);
        
        const newRow = {
          id_segmen: idSegmenValue,
          subsegmen: record.subsegmen,
          nama: record.nama,
          n: record.n,
          amatan: record.amatan,
          status: record.status,
          evaluasi: record.evaluasi,
          tanggal: tanggalISO, // Bisa null jika baris ini pakai fallback
          flag_kode_12: record['flag kode 12'],
          note: record.note,
          kode_kab: kode_kab,
          kode_kec: kode_kec,
          kabupaten: kabupaten,
          bulan: bulan,
          tahun: tahun,
          uploaded_at: uploadedAt,
          uploaded_by_username: username,
        };
        allRowsToInsert.push(newRow);
      }
    }
    
    if (allRowsToInsert.length === 0) {
        return { success: false, message: "Tidak ada baris data yang valid untuk diimpor." };
    }

    const deletion_scopes = Array.from(uniqueDeletionScopesSet).map(key => {
        const [tahun, bulan, kode_kab] = key.split('-');
        return { tahun: parseInt(tahun), bulan: parseInt(bulan), kode_kab };
    });

    const { error: rpcError } = await supabaseServer.rpc('process_ksa_amatan_upload', {
        deletion_scopes: deletion_scopes,
        insert_data: allRowsToInsert
    });

    if (rpcError) {
      console.error("KSA Upload RPC Error:", rpcError);
      return { success: false, message: "Gagal memproses data KSA di database.", errorDetails: rpcError.message };
    }


    
    const [refreshChartResult, refreshKondisiResult] = await Promise.all([
      supabaseServer.rpc('refresh_chart_amatan_summary'), // <--- Panggil fungsi baru yang spesifik
      supabaseServer.rpc('refresh_kondisi_panen')         // <--- Panggil fungsi baru yang spesifik
  ]);

    if (refreshChartResult.error) {
        console.error("Gagal me-refresh materialized view 'chart_amatan_summary':", refreshChartResult.error);
    }

    if (refreshKondisiResult.error) {
        console.error("Gagal me-refresh materialized view 'kondisi_panen':", refreshKondisiResult.error);
    }

    revalidatePath("/update-data/ksa");
    revalidatePath("/monitoring/ksa");

    let successMessage = `Berhasil memproses ${files.length} file dan menyimpan ${allRowsToInsert.length} baris data KSA.`;
    if (skippedRowCount > 0) {
        successMessage += ` Ada ${skippedRowCount} baris yang dilewati karena data tidak lengkap.`;
    }

    return { success: true, message: successMessage };

  } catch (error: any) {
    console.error("Upload KSA Action Error:", error);
    return { success: false, message: "Terjadi kesalahan saat mem-parsing file Excel.", errorDetails: error.toString() };
  }
}

// =================================================================
// === FUNGSI UNTUK KSA JAGUNG ===================================
// =================================================================
export async function uploadKsaJagungAction(formData: FormData): Promise<ActionResult> {
  const cookieStore = await cookies();
  const supabaseUserContext = await createSupabaseServerClientWithUserContext(cookieStore);

  const { data: { user } } = await supabaseUserContext.auth.getUser();
  if (user?.user_metadata?.role !== "super_admin") {
    return { success: false, message: "Akses ditolak." };
  }
  const username = user.user_metadata?.username || user.email || 'tidak_diketahui';

  const files = formData.getAll("files") as File[];
  if (!files || files.length === 0) {
    return { success: false, message: "Tidak ada file yang dipilih." };
  }

  const allRowsToInsert: any[] = [];
  const uniqueDeletionScopesSet = new Set<string>();
  const uploadedAt = new Date().toISOString();
  let skippedRowCount = 0;

  try {
    for (const file of files) {
      const buffer = await file.arrayBuffer();
      const workbook = xlsx.read(buffer, { type: "buffer", cellDates: true });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(sheet) as any[];

      let fallbackTahun: number | null = null;
      let fallbackBulan: number | null = null;

      for (const record of jsonData) {
        // Header KSA Jagung: ID; ID Segmen; Subsegmen; PCS; N; Amatan; Status; Evaluasi; Tanggal; Kode 98
        // CATATAN: Kolom N-1, N-2, N-3 (jika ada di template) akan diabaikan dalam processing
        // ✅ PERBAIKI: Coba berbagai variasi nama kolom untuk KSA Jagung
        const idSegmenValue = record['ID Segmen'] || record['Id Segmen'] || record['id segmen'] || record['ID SEGMEN'];
        const tanggalValue = record['Tanggal'] || record.tanggal || record.TANGGAL;

        if (!idSegmenValue) {
           console.warn(`⚠️ Melewatkan baris KSA Jagung karena 'ID Segmen' kosong. Available keys:`, Object.keys(record));
           console.warn(`⚠️ Record content:`, record);
           skippedRowCount++;
           continue;
        }

        let tahun: number | null = null;
        let bulan: number | null = null;
        let tanggalISO: string | null = null;
        
        // ✅ PERBAIKI: Parsing tanggal yang lebih robust untuk KSA Jagung (format aneh seperti "2025-6-24 14:2")
        if (tanggalValue) {
            let parsedDate: Date;

            if (typeof tanggalValue === 'string' && tanggalValue.includes('-')) {
                // Handle format string dengan berbagai variasi seperti "2025-6-24 14:2" atau "2024-12-15"
                const parts = tanggalValue.trim().split(' '); 
                const dateParts = parts[0].split('-');
                
                if (dateParts.length >= 3) {
                    const y = dateParts[0];
                    const m = dateParts[1].padStart(2, '0');
                    const d = dateParts[2].padStart(2, '0');
                    
                    let timeStr = '00:00:00';
                    if (parts.length > 1 && parts[1]) {
                        // Handle format waktu yang tidak lengkap seperti "14:2" -> "14:02:00"
                        const timeParts = parts[1].split(':');
                        const hour = (timeParts[0] || '00').padStart(2, '0');
                        const minute = (timeParts[1] || '00').padStart(2, '0');
                        const second = (timeParts[2] || '00').padStart(2, '0');
                        timeStr = `${hour}:${minute}:${second}`;
                    }
                    
                    const isoString = `${y}-${m}-${d}T${timeStr}`;
                    parsedDate = new Date(isoString);
                } else {
                    parsedDate = new Date(tanggalValue);
                }
            } else if (typeof tanggalValue === 'number') {
                // Handle Excel serial date number
                parsedDate = new Date((tanggalValue - 25569) * 86400 * 1000);
            } else {
                parsedDate = new Date(tanggalValue);
            }

            if (!isNaN(parsedDate.getTime())) {
                tahun = parsedDate.getFullYear();
                bulan = parsedDate.getMonth() + 1; 
                tanggalISO = parsedDate.toISOString();

                if (fallbackTahun === null) {
                    fallbackTahun = tahun;
                    fallbackBulan = bulan;
                }
            } else {
                console.warn(`⚠️ Tanggal KSA Jagung tidak valid:`, tanggalValue, typeof tanggalValue);
            }
        }
        
        if (tahun === null && bulan === null) {
            tahun = fallbackTahun;
            bulan = fallbackBulan;
        }

        if (tahun === null || bulan === null) {
            console.warn(`Melewatkan baris KSA Jagung karena tidak ada informasi Tahun/Bulan yang bisa digunakan (baik dari baris maupun fallback):`, record);
            skippedRowCount++;
            continue;
        }
        
        const idSegmenStr = idSegmenValue.toString();
        const kode_kab = idSegmenStr.substring(0, 4);
        const kode_kec = idSegmenStr.substring(4, 7);
        const kabupaten = KABUPATEN_MAP[kode_kab] || "Kabupaten Tidak Dikenal";

        const scopeKey = `${tahun}-${bulan}-${kode_kab}`;
        uniqueDeletionScopesSet.add(scopeKey);
        
        // ✅ PERBAIKI: Parsing kolom N dengan cleaning logic yang lebih robust untuk KSA Jagung
        let finalNValue: number | null = null;
        const rawNValue = record['N'] || record.N;

        if (rawNValue !== null && rawNValue !== undefined && rawNValue !== '') {
            let cleanedNValueStr = String(rawNValue).trim();
            
            // Hapus titik di akhir jika ada (seperti "9.14." -> "9.14")
            if (cleanedNValueStr.endsWith('.')) {
                cleanedNValueStr = cleanedNValueStr.slice(0, -1);
            }
            
            // Coba parse sebagai float
            const parsedN = parseFloat(cleanedNValueStr);
            if (!isNaN(parsedN)) {
                finalNValue = parsedN;
            } else {
                console.warn(`⚠️ DEBUG KSA JAGUNG: Cannot parse N value: "${rawNValue}" -> "${cleanedNValueStr}"`);
            }
        }

        const newRow = {
          id_segmen: idSegmenValue,
          subsegmen: record['Subsegmen'] || record.Subsegmen,
          nama: record['PCS'] || record.PCS, // PCS di KSA Jagung = nama di KSA Padi
          n: finalNValue,                        // Hanya kolom N yang diperlukan
          amatan: record['Amatan'] || record.Amatan,
          status: record['Status'] || record.Status,
          evaluasi: record['Evaluasi'] || record.Evaluasi,
          tanggal: tanggalISO,
          flag_kode_98: record['Kode 98'] || record['kode 98'], // Kode 98 di KSA Jagung = flag kode 12 di KSA Padi
          note: null, // KSA Jagung tidak ada kolom note
          kode_kab: kode_kab,
          kode_kec: kode_kec,
          kabupaten: kabupaten,
          bulan: bulan,
          tahun: tahun,
          uploaded_at: uploadedAt,
          uploaded_by_username: username,
        };
        allRowsToInsert.push(newRow);
      }
    }
    
    if (allRowsToInsert.length === 0) {
        return { 
            success: false, 
            message: `Tidak ditemukan data 'Tanggal' atau 'ID Segmen' yang valid di dalam file KSA Jagung. Pastikan header Excel menggunakan nama kolom yang benar: 'ID Segmen' dan 'Tanggal' (sesuai template). File yang dilewati: ${skippedRowCount} baris.` 
        };
    }

    const deletion_scopes = Array.from(uniqueDeletionScopesSet).map(key => {
        const [tahun, bulan, kode_kab] = key.split('-');
        return { tahun: parseInt(tahun), bulan: parseInt(bulan), kode_kab };
    });

    const { error: rpcError } = await supabaseServer.rpc('process_ksa_jagung_upload', {
        deletion_scopes: deletion_scopes,
        insert_data: allRowsToInsert
    });

    if (rpcError) {
      console.error("KSA Jagung Upload RPC Error:", rpcError);
      return { success: false, message: "Gagal memproses data KSA Jagung di database.", errorDetails: rpcError.message };
    }


    
    const [refreshChartResult, refreshKondisiResult] = await Promise.all([
      supabaseServer.rpc('refresh_chart_amatan_summary'),
      supabaseServer.rpc('refresh_kondisi_panen')
    ]);

    if (refreshChartResult.error) {
        console.error("Gagal me-refresh materialized view 'chart_amatan_summary':", refreshChartResult.error);
    }

    if (refreshKondisiResult.error) {
        console.error("Gagal me-refresh materialized view 'kondisi_panen':", refreshKondisiResult.error);
    }

    revalidatePath("/update-data/ksa");
    revalidatePath("/monitoring/ksa");

    let successMessage = `Berhasil memproses ${files.length} file dan menyimpan ${allRowsToInsert.length} baris data KSA Jagung.`;
    if (skippedRowCount > 0) {
        successMessage += ` Ada ${skippedRowCount} baris yang dilewati karena data tidak lengkap.`;
    }

    return { success: true, message: successMessage };

  } catch (error: any) {
    console.error("Upload KSA Jagung Action Error:", error);
    return { success: false, message: "Terjadi kesalahan saat mem-parsing file Excel KSA Jagung.", errorDetails: error.toString() };
  }
}