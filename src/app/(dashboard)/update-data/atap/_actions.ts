/* eslint-disable @typescript-eslint/no-explicit-any */
// Lokasi File: src/app/(dashboard)/update-data/atap/_actions.ts
"use server";

import { createSupabaseServerClientWithUserContext, supabaseServer } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import * as xlsx from 'xlsx';

// Tipe untuk data yang valid
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
    triggersAggregation: true, // Menandakan tipe data ini memicu agregasi
  },
  tahunan_kab: {
    targetTable: 'data_atap_tahunan_kab',
    onConflict: 'tahun,kode_kab,id_indikator',
    identifierColumns: ['tahun', 'kode_kab'],
    triggersAggregation: false,
  },
  bulanan_prov: {
    targetTable: 'data_atap_bulanan_prov',
    onConflict: 'tahun,bulan,kode_prov,id_indikator',
    identifierColumns: ['tahun', 'bulan', 'kode_prov'],
    triggersAggregation: false, // Kita putuskan hanya data paling detail yang memicu
  },
  tahunan_prov: {
    targetTable: 'data_atap_tahunan_prov',
    onConflict: 'tahun,kode_prov,id_indikator',
    identifierColumns: ['tahun', 'kode_prov'],
    triggersAggregation: false,
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
    const { data: masterIndicators, error: indicatorError } = await supabaseServer
      .from('master_indikator_atap')
      .select('id, nama_resmi');
    if (indicatorError) throw indicatorError;
    const indicatorMap = new Map(masterIndicators.map(i => [i.nama_resmi.toLowerCase().trim(), i.id]));

    const buffer = await file.arrayBuffer();
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const wideData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]) as any[];
    if (wideData.length === 0) return { success: false, message: "File Excel tidak berisi data." };

    const uniqueDataMap = new Map<string, any>();
    const uploadedAt = new Date().toISOString();
    
    for (const wideRow of wideData) {
      const identifierValues: { [key: string]: any } = {};
      config.identifierColumns.forEach(col => {
        identifierValues[col] = wideRow[col];
      });

      for (const header in wideRow) {
        if (!config.identifierColumns.includes(header)) {
          const indicatorName = header.trim().toLowerCase();
          if (indicatorMap.has(indicatorName)) {
            const id_indikator = indicatorMap.get(indicatorName);
            const nilai = wideRow[header];
            
            if (nilai !== null && nilai !== undefined && nilai !== '') {
                let uniqueKey = `${id_indikator}`;
                config.identifierColumns.forEach(col => {
                    uniqueKey += `-${identifierValues[col]}`;
                });
                
                const longRow = {
                    ...identifierValues,
                    id_indikator: id_indikator,
                    nilai: nilai,
                    uploaded_at: uploadedAt,
                    uploaded_by_username: username,
                };
                uniqueDataMap.set(uniqueKey, longRow);
            }
          }
        }
      }
    }

    const longDataToUpsert = Array.from(uniqueDataMap.values());
    if (longDataToUpsert.length === 0) {
      return { success: false, message: "Tidak ada data indikator valid yang cocok untuk diimpor." };
    }

    const { error: upsertError } = await supabaseServer
      .from(config.targetTable)
      .upsert(longDataToUpsert, { onConflict: config.onConflict });

    if (upsertError) {
      console.error("ATAP Upsert Error:", upsertError);
      return { success: false, message: "Gagal menyimpan data ke database.", errorDetails: upsertError.message };
    }
    
    // --- AWAL PATCH AGREGRASI ---
    let aggregationMessage = "";
    // Hanya picu agregasi jika data yang diimpor adalah data bulanan
    if (dataType === 'bulanan_kab' || dataType === 'bulanan_prov') {
        const uniqueYears = Array.from(new Set(longDataToUpsert.map(row => row.tahun)));
        
        for (const year of uniqueYears) {
            const { error: aggregateError } = await supabaseServer.rpc('recalculate_atap_aggregates', {
                p_tahun: year
            });
            if (aggregateError) {
                console.error(`Agregasi otomatis untuk tahun ${year} gagal:`, aggregateError);
                // Kita bisa memilih untuk tidak menghentikan proses, tapi mencatatnya
            }
        }
        aggregationMessage = " Agregasi otomatis ke level data yang lebih tinggi juga telah dijalankan.";
    }
    // --- AKHIR PATCH AGREGRASI ---
    
    revalidatePath("/update-data/atap");
    revalidatePath("/produksi-statistik"); // Revalidasi halaman statistik juga

    return { success: true, message: `Berhasil memproses dan menyimpan ${longDataToUpsert.length} titik data.` + aggregationMessage };

  } catch (error: any) {
    console.error("Upload ATAP Action Error:", error);
    return { success: false, message: "Terjadi kesalahan saat memproses file.", errorDetails: error.toString() };
  }
}