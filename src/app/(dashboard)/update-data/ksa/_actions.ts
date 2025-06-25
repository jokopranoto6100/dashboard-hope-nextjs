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

    console.log("Data KSA berhasil diunggah. Memulai refresh materialized views...");
    
    const [refreshChartResult, refreshKondisiResult] = await Promise.all([
      supabaseServer.rpc('refresh_chart_amatan_summary'), // <--- Panggil fungsi baru yang spesifik
      supabaseServer.rpc('refresh_kondisi_panen')         // <--- Panggil fungsi baru yang spesifik
  ]);

    if (refreshChartResult.error) {
        console.error("Gagal me-refresh materialized view 'chart_amatan_summary':", refreshChartResult.error);
    } else {
        console.log("'chart_amatan_summary' berhasil di-refresh.");
    }

    if (refreshKondisiResult.error) {
        console.error("Gagal me-refresh materialized view 'kondisi_panen':", refreshKondisiResult.error);
    } else {
        console.log("'kondisi_panen' berhasil di-refresh.");
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