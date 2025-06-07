/* eslint-disable @typescript-eslint/no-explicit-any */
// Lokasi File: src/app/(dashboard)/update-data/atap/_actions.ts
"use server";

import { createSupabaseServerClientWithUserContext, supabaseServer } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import * as xlsx from 'xlsx';

// Tipe data yang valid
type DataType = 'bulanan_kab' | 'tahunan_kab' | 'bulanan_prov' | 'tahunan_prov';

// Tipe untuk respons action
interface ActionResult {
  success: boolean;
  message: string;
  errorDetails?: string;
}

// Objek Konfigurasi untuk setiap tipe data
const ATAP_IMPORT_CONFIG = {
  bulanan_kab: {
    targetTable: 'data_atap_bulanan_kab',
    onConflict: 'tahun,bulan,kode_kab,id_indikator',
    identifierColumns: ['tahun', 'bulan', 'kode_kab'],
  },
  tahunan_kab: {
    targetTable: 'data_atap_tahunan_kab',
    onConflict: 'tahun,kode_kab,id_indikator',
    identifierColumns: ['tahun', 'kode_kab'],
  },
  bulanan_prov: {
    targetTable: 'data_atap_bulanan_prov',
    onConflict: 'tahun,bulan,kode_prov,id_indikator',
    identifierColumns: ['tahun', 'bulan', 'kode_prov'],
  },
  tahunan_prov: {
    targetTable: 'data_atap_tahunan_prov',
    onConflict: 'tahun,kode_prov,id_indikator',
    identifierColumns: ['tahun', 'kode_prov'],
  }
};

export async function uploadAtapDataAction(formData: FormData): Promise<ActionResult> {
  const cookieStore = await cookies();
  const supabaseUserContext = await createSupabaseServerClientWithUserContext(cookieStore);

  const { data: { user } } = await supabaseUserContext.auth.getUser();
  if (user?.user_metadata?.role !== "super_admin") {
    return { success: false, message: "Akses ditolak." };
  }
  const username = user.user_metadata?.username || user.email || 'tidak_diketahui';

  const file = formData.get("file") as File | null;
  const dataType = formData.get("dataType") as DataType | null;

  if (!file) return { success: false, message: "File tidak ditemukan." };
  if (!dataType || !ATAP_IMPORT_CONFIG[dataType]) {
    return { success: false, message: "Tipe data impor tidak valid." };
  }

  const config = ATAP_IMPORT_CONFIG[dataType];

  try {
    // 1. Ambil semua indikator yang sah dari database untuk pencocokan
    const { data: masterIndicators, error: indicatorError } = await supabaseServer
      .from('master_indikator_atap')
      .select('id, nama_resmi');
    if (indicatorError) throw indicatorError;
    const indicatorMap = new Map(masterIndicators.map(i => [i.nama_resmi, i.id]));

    // 2. Baca dan Parse File Excel
    const buffer = await file.arrayBuffer();
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const wideData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]) as any[];
    if (wideData.length === 0) return { success: false, message: "File Excel tidak berisi data." };

    // 3. Proses Transformasi (Unpivot) dari Wide ke Long format
    const longDataToUpsert: any[] = [];
    const uploadedAt = new Date().toISOString();
    
    for (const wideRow of wideData) {
      // Ambil nilai dari kolom identifier (misal: tahun, bulan, kode_kab)
      const identifierValues: { [key: string]: any } = {};
      config.identifierColumns.forEach(col => {
        identifierValues[col] = wideRow[col];
      });

      // Lakukan unpivot untuk setiap kolom indikator
      for (const header in wideRow) {
        // Cek apakah header adalah kolom indikator (bukan kolom identifier)
        if (!config.identifierColumns.includes(header)) {
          // Cek apakah header ini ada di master indikator kita
          if (indicatorMap.has(header)) {
            const id_indikator = indicatorMap.get(header);
            const nilai = wideRow[header];
            
            // Hanya proses jika nilainya ada
            if (nilai !== null && nilai !== undefined && nilai !== '') {
                const longRow = {
                    ...identifierValues,
                    id_indikator: id_indikator,
                    nilai: nilai,
                    uploaded_at: uploadedAt,
                    uploaded_by_username: username,
                };
                longDataToUpsert.push(longRow);
            }
          }
        }
      }
    }

    if (longDataToUpsert.length === 0) {
      return { success: false, message: "Tidak ada data indikator valid yang cocok untuk diimpor." };
    }

    // 4. Lakukan Bulk Upsert
    const { error: upsertError } = await supabaseServer
      .from(config.targetTable)
      .upsert(longDataToUpsert, { onConflict: config.onConflict });

    if (upsertError) {
      console.error("ATAP Upsert Error:", upsertError);
      return { success: false, message: "Gagal menyimpan data ke database.", errorDetails: upsertError.message };
    }
    
    // 5. Revalidasi
    revalidatePath("/update-data/atap");

    return { success: true, message: `Berhasil memproses file dan menyimpan/memperbarui ${longDataToUpsert.length} titik data.` };

  } catch (error: unknown) {
    console.error("Upload ATAP Action Error:", error);
    const errorMessage = error instanceof Error ? error.toString() : "Unknown error";
    return { success: false, message: "Terjadi kesalahan saat memproses file.", errorDetails: errorMessage };
  }
}