// Lokasi File: src/app/(dashboard)/update-data/ksa/_actions.ts
"use server";

import { createSupabaseServerClientWithUserContext } from "@/lib/supabase-server"; // Asumsi path ini benar
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

  let allRowsToInsert: any[] = [];
  const uniqueDeletionScopesSet = new Set<string>();
  const uploadedAt = new Date().toISOString();
  let skippedRowCount = 0;

  try {
    for (const file of files) {
      const buffer = await file.arrayBuffer();
      const workbook = xlsx.read(buffer, { type: "buffer", cellDates: true });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName]; // <-- TAMBAHKAN BARIS INI
      const jsonData = xlsx.utils.sheet_to_json(sheet) as any[];

      for (const record of jsonData) {
        // --- AWAL PATCH ---

        // 1. Validasi kolom sumber menggunakan bracket notation untuk handle spasi
        const idSegmenValue = record['id segmen']; // Membaca properti 'id segmen'
        const tanggalValue = record.tanggal;

        if (!tanggalValue || !idSegmenValue) {
           console.warn(`Melewatkan baris karena 'tanggal' atau 'id segmen' kosong:`, record);
           skippedRowCount++;
           continue;
        }

        // 2. Ekstrak Tahun dan Bulan
        const tanggal = new Date(tanggalValue);
        if (isNaN(tanggal.getTime())) {
            console.warn(`Melewatkan baris karena format 'tanggal' tidak valid:`, tanggalValue);
            skippedRowCount++;
            continue;
        }
        const tahun = tanggal.getFullYear();
        const bulan = tanggal.getMonth() + 1; 

        // 3. Ekstrak Kode Wilayah dari 'id segmen'
        const idSegmenStr = idSegmenValue.toString();
        const kode_kab = idSegmenStr.substring(0, 4);
        const kode_kec = idSegmenStr.substring(4, 7);

        // 4. Mapping nama kabupaten
        const kabupaten = KABUPATEN_MAP[kode_kab] || "Kabupaten Tidak Dikenal";
        
        // --- AKHIR PATCH ---

        const scopeKey = `${tahun}-${bulan}-${kode_kab}`;
        uniqueDeletionScopesSet.add(scopeKey);
        
        // Siapkan baris lengkap untuk di-insert
        const newRow = {
          // Menggunakan bracket notation untuk header dengan spasi atau karakter aneh
          id_segmen: idSegmenValue,
          subsegmen: record.subsegmen,
          nama: record.nama,
          n: record['n-1'] || record.n, // Menangani jika header 'n-1' atau 'n'
          amatan: record.amatan,
          status: record.status,
          evaluasi: record.evaluasi,
          tanggal: tanggal.toISOString(),
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
    
    // ... (sisa kode untuk memanggil RPC dan return respons tetap sama)
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

    // --- AWAL PERUBAHAN ---
    // 2. Refresh Materialized Views setelah data berhasil diunggah
    // Kita jalankan secara konkuren untuk efisiensi
    console.log("Data KSA berhasil diunggah. Memulai refresh materialized views...");
    
    const [refreshChartResult, refreshKondisiResult] = await Promise.all([
        supabaseServer.rpc('refresh_materialized_view', { view_name: 'chart_amatan_summary' }),
        supabaseServer.rpc('refresh_materialized_view', { view_name: 'kondisi_panen' })
    ]);

    if (refreshChartResult.error) {
        console.error("Gagal me-refresh materialized view 'chart_amatan_summary':", refreshChartResult.error);
        // Anda bisa memilih untuk mengembalikan error atau hanya mencatatnya
        // return { success: false, message: "Data berhasil diunggah, namun gagal me-refresh chart_amatan_summary.", errorDetails: refreshChartResult.error.message };
    } else {
        console.log("'chart_amatan_summary' berhasil di-refresh.");
    }

    if (refreshKondisiResult.error) {
        console.error("Gagal me-refresh materialized view 'kondisi_panen':", refreshKondisiResult.error);
        // return { success: false, message: "Data berhasil diunggah, namun gagal me-refresh kondisi_panen.", errorDetails: refreshKondisiResult.error.message };
    } else {
        console.log("'kondisi_panen' berhasil di-refresh.");
    }
    // --- AKHIR PERUBAHAN ---

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