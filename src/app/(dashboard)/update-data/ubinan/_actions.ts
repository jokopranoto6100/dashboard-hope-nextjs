/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
// Lokasi File: src/app/(dashboard)/update-data/ubinan/_actions.ts
"use server";

import { createSupabaseServerClientWithUserContext, supabaseServer } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { parse } from "csv-parse/sync";
import * as xlsx from 'xlsx';

// ===================================================================================
// TIPE DATA & INTERFACE BERSAMA
// ===================================================================================
interface ActionResult {
  success: boolean;
  message: string;
  importedCount?: number;
  errorDetails?: string;
}

type AnalysisResult = {
  matchedHeaders: { dbCol: string; csvHeader: string }[];
  unmappedDbCols: string[];
  unexpectedCsvHeaders: string[];
};


// ===================================================================================
// BAGIAN 1: LOGIKA UNTUK UPLOAD UBINAN RAW (DENGAN HEADER MAPPING)
// ===================================================================================

// --- KONSTANTA & HELPER UNTUK UBINAN RAW ---

const REQUIRED_UBINAN_RAW_COLS = [
  'subround', 'prov', 'kab', 'kec', 'des/seg', 'bs/sseg', 'r111', 'url', 
  'status', 'validasi', 'date_modified', 'komoditas', 'bulan_panen', 'r101', 
  'r102', 'r103', 'r104', 'r110_palawija', 'r111a_label', 'r111a_lain', 
  'r111a_value', 'r112', 'r112a_label', 'r112a_value', 'r113', 'r201_palawija', 
  'r303a', 'r303b', 'r304_accuracy', 'r304_latitude', 'r304_longitude', 
  'r401a', 'r401b', 'r501_label', 'r501_value', 'r501a', 'r501b', 'r502a', 
  'r502b', 'r601_label', 'r601_value', 'r602_label', 'r602_value', 'r603', 
  'r604', 'r605_label', 'r605_value', 'r606a_label', 'r606a_value', 
  'r606b_label', 'r606b_value', 'r607_label', 'r607_value', 'r608', 
  'r609_label', 'r609_value', 'r610_1', 'r610_2', 'r610_3', 'r610_4', 
  'r610_5', 'r610_6', 'r610_7', 'r611_label', 'r611_value', 'r701', 'r702', 
  'r801a_label', 'r801a_value', 'r801b_label', 'r801b_lain', 'r801b_value', 
  'r801c_label', 'r801c_value', 'r801d_label', 'r801d_value', 'r801e_label', 
  'r801e_value', 'r802a_label', 'r802a_value', 'r802b_label', 'r802b_lain', 
  'r802b_value', 'r802c_label', 'r802c_value', 'r803a_label', 'r803a_value', 
  'r803b_label', 'r803b_value', 'r803c_1', 'r803c_2', 'r803c_3', 'r803c_4', 
  'r803c_lain', 'r803di_label', 'r803di_value', 'r804a_label', 'r804a_value', 
  'r804b_label', 'r804b_value', 'r805a_label', 'r805a_value', 'r805b_label', 
  'r805b_value', 'r806a_label', 'r806a_value', 'r806b_label', 'r806b_value', 
  'r807a_label', 'r807a_value', 'r807b_label', 'r807b_value', 'r808a_label', 
  'r808a_value', 'r808b_label', 'r808b_value', 'r809a_label', 'r809a_value', 
  'r809b_label', 'r809b_value', 'r901', 'prioritas', 'fasetanam', 
  'bulanmaster', 'tahun', 'nks', 'lat', 'long'
];

const ubinanRawSchema: { [key: string]: { data_type: string; udt_name: string; is_nullable: boolean } } = {
  "id": { data_type: "uuid", udt_name: "uuid", is_nullable: false },
  "uploaded_at": { data_type: "timestamp with time zone", udt_name: "timestamptz", is_nullable: true },
  "uploaded_by_username": { data_type: "text", udt_name: "text", is_nullable: true },
  "subround": { data_type: "integer", udt_name: "int4", is_nullable: true },
  "prov": { data_type: "integer", udt_name: "int4", is_nullable: true },
  "kab": { data_type: "integer", udt_name: "int4", is_nullable: true },
  "kec": { data_type: "integer", udt_name: "int4", is_nullable: true },
  "des/seg": { data_type: "text", udt_name: "text", is_nullable: true },
  "bs/sseg": { data_type: "text", udt_name: "text", is_nullable: true },
  "r111": { data_type: "text", udt_name: "text", is_nullable: true },
  "url": { data_type: "text", udt_name: "text", is_nullable: true },
  "status": { data_type: "text", udt_name: "text", is_nullable: true },
  "validasi": { data_type: "text", udt_name: "text", is_nullable: true },
  "date_modified": { data_type: "text", udt_name: "text", is_nullable: true },
  "komoditas": { data_type: "text", udt_name: "text", is_nullable: true },
  "bulan_panen": { data_type: "text", udt_name: "text", is_nullable: true },
  "r101": { data_type: "text", udt_name: "text", is_nullable: true },
  "r102": { data_type: "text", udt_name: "text", is_nullable: true },
  "r103": { data_type: "text", udt_name: "text", is_nullable: true },
  "r104": { data_type: "text", udt_name: "text", is_nullable: true },
  "r110_palawija": { data_type: "text", udt_name: "text", is_nullable: true },
  "r111a_label": { data_type: "text", udt_name: "text", is_nullable: true },
  "r111a_lain": { data_type: "text", udt_name: "text", is_nullable: true },
  "r111a_value": { data_type: "text", udt_name: "text", is_nullable: true },
  "r112": { data_type: "text", udt_name: "text", is_nullable: true },
  "r112a_label": { data_type: "text", udt_name: "text", is_nullable: true },
  "r112a_value": { data_type: "text", udt_name: "text", is_nullable: true },
  "r113": { data_type: "text", udt_name: "text", is_nullable: true },
  "r201_palawija": { data_type: "text", udt_name: "text", is_nullable: true },
  "r303a": { data_type: "text", udt_name: "text", is_nullable: true },
  "r303b": { data_type: "text", udt_name: "text", is_nullable: true },
  "r304_accuracy": { data_type: "text", udt_name: "text", is_nullable: true },
  "r304_latitude": { data_type: "text", udt_name: "text", is_nullable: true },
  "r304_longitude": { data_type: "text", udt_name: "text", is_nullable: true },
  "r401a": { data_type: "text", udt_name: "text", is_nullable: true },
  "r401b": { data_type: "text", udt_name: "text", is_nullable: true },
  "r501_label": { data_type: "text", udt_name: "text", is_nullable: true },
  "r501_value": { data_type: "text", udt_name: "text", is_nullable: true },
  "r501a": { data_type: "text", udt_name: "text", is_nullable: true },
  "r501b": { data_type: "text", udt_name: "text", is_nullable: true },
  "r502a": { data_type: "text", udt_name: "text", is_nullable: true },
  "r502b": { data_type: "text", udt_name: "text", is_nullable: true },
  "r601_label": { data_type: "text", udt_name: "text", is_nullable: true },
  "r601_value": { data_type: "text", udt_name: "text", is_nullable: true },
  "r602_label": { data_type: "text", udt_name: "text", is_nullable: true },
  "r602_value": { data_type: "text", udt_name: "text", is_nullable: true },
  "r603": { data_type: "text", udt_name: "text", is_nullable: true },
  "r604": { data_type: "numeric", udt_name: "numeric", is_nullable: true },
  "r605_label": { data_type: "text", udt_name: "text", is_nullable: true },
  "r605_value": { data_type: "text", udt_name: "text", is_nullable: true },
  "r606a_label": { data_type: "text", udt_name: "text", is_nullable: true },
  "r606a_value": { data_type: "text", udt_name: "text", is_nullable: true },
  "r606b_label": { data_type: "text", udt_name: "text", is_nullable: true },
  "r606b_value": { data_type: "text", udt_name: "text", is_nullable: true },
  "r607_label": { data_type: "text", udt_name: "text", is_nullable: true },
  "r607_value": { data_type: "text", udt_name: "text", is_nullable: true },
  "r608": { data_type: "numeric", udt_name: "numeric", is_nullable: true },
  "r609_label": { data_type: "text", udt_name: "text", is_nullable: true },
  "r609_value": { data_type: "numeric", udt_name: "numeric", is_nullable: true },
  "r610_1": { data_type: "numeric", udt_name: "numeric", is_nullable: true },
  "r610_2": { data_type: "numeric", udt_name: "numeric", is_nullable: true },
  "r610_3": { data_type: "numeric", udt_name: "numeric", is_nullable: true },
  "r610_4": { data_type: "numeric", udt_name: "numeric", is_nullable: true },
  "r610_5": { data_type: "numeric", udt_name: "numeric", is_nullable: true },
  "r610_6": { data_type: "numeric", udt_name: "numeric", is_nullable: true },
  "r610_7": { data_type: "numeric", udt_name: "numeric", is_nullable: true },
  "r611_label": { data_type: "text", udt_name: "text", is_nullable: true },
  "r611_value": { data_type: "text", udt_name: "text", is_nullable: true },
  "r701": { data_type: "numeric", udt_name: "numeric", is_nullable: true },
  "r702": { data_type: "numeric", udt_name: "numeric", is_nullable: true },
  "r801a_label": { data_type: "text", udt_name: "text", is_nullable: true },
  "r801a_value": { data_type: "text", udt_name: "text", is_nullable: true },
  "r801b_label": { data_type: "text", udt_name: "text", is_nullable: true },
  "r801b_lain": { data_type: "text", udt_name: "text", is_nullable: true },
  "r801b_value": { data_type: "text", udt_name: "text", is_nullable: true },
  "r801c_label": { data_type: "text", udt_name: "text", is_nullable: true },
  "r801c_value": { data_type: "text", udt_name: "text", is_nullable: true },
  "r801d_label": { data_type: "text", udt_name: "text", is_nullable: true },
  "r801d_value": { data_type: "text", udt_name: "text", is_nullable: true },
  "r801e_label": { data_type: "text", udt_name: "text", is_nullable: true },
  "r801e_value": { data_type: "text", udt_name: "text", is_nullable: true },
  "r802a_label": { data_type: "text", udt_name: "text", is_nullable: true },
  "r802a_value": { data_type: "text", udt_name: "text", is_nullable: true },
  "r802b_label": { data_type: "text", udt_name: "text", is_nullable: true },
  "r802b_lain": { data_type: "text", udt_name: "text", is_nullable: true },
  "r802b_value": { data_type: "text", udt_name: "text", is_nullable: true },
  "r802c_label": { data_type: "text", udt_name: "text", is_nullable: true },
  "r802c_value": { data_type: "text", udt_name: "text", is_nullable: true },
  "r803a_label": { data_type: "text", udt_name: "text", is_nullable: true },
  "r803a_value": { data_type: "text", udt_name: "text", is_nullable: true },
  "r803b_label": { data_type: "text", udt_name: "text", is_nullable: true },
  "r803b_value": { data_type: "text", udt_name: "text", is_nullable: true },
  "r803c_1": { data_type: "text", udt_name: "text", is_nullable: true },
  "r803c_2": { data_type: "text", udt_name: "text", is_nullable: true },
  "r803c_3": { data_type: "text", udt_name: "text", is_nullable: true },
  "r803c_4": { data_type: "text", udt_name: "text", is_nullable: true },
  "r803c_lain": { data_type: "text", udt_name: "text", is_nullable: true },
  "r803di_label": { data_type: "text", udt_name: "text", is_nullable: true },
  "r803di_value": { data_type: "text", udt_name: "text", is_nullable: true },
  "r804a_label": { data_type: "text", udt_name: "text", is_nullable: true },
  "r804a_value": { data_type: "text", udt_name: "text", is_nullable: true },
  "r804b_label": { data_type: "text", udt_name: "text", is_nullable: true },
  "r804b_value": { data_type: "text", udt_name: "text", is_nullable: true },
  "r805a_label": { data_type: "text", udt_name: "text", is_nullable: true },
  "r805a_value": { data_type: "text", udt_name: "text", is_nullable: true },
  "r805b_label": { data_type: "text", udt_name: "text", is_nullable: true },
  "r805b_value": { data_type: "text", udt_name: "text", is_nullable: true },
  "r806a_label": { data_type: "text", udt_name: "text", is_nullable: true },
  "r806a_value": { data_type: "text", udt_name: "text", is_nullable: true },
  "r806b_label": { data_type: "text", udt_name: "text", is_nullable: true },
  "r806b_value": { data_type: "text", udt_name: "text", is_nullable: true },
  "r807a_label": { data_type: "text", udt_name: "text", is_nullable: true },
  "r807a_value": { data_type: "text", udt_name: "text", is_nullable: true },
  "r807b_label": { data_type: "text", udt_name: "text", is_nullable: true },
  "r807b_value": { data_type: "text", udt_name: "text", is_nullable: true },
  "r808a_label": { data_type: "text", udt_name: "text", is_nullable: true },
  "r808a_value": { data_type: "text", udt_name: "text", is_nullable: true },
  "r808b_label": { data_type: "text", udt_name: "text", is_nullable: true },
  "r808b_value": { data_type: "text", udt_name: "text", is_nullable: true },
  "r809a_label": { data_type: "text", udt_name: "text", is_nullable: true },
  "r809a_value": { data_type: "text", udt_name: "text", is_nullable: true },
  "r809b_label": { data_type: "text", udt_name: "text", is_nullable: true },
  "r809b_value": { data_type: "text", udt_name: "text", is_nullable: true },
  "r901": { data_type: "text", udt_name: "text", is_nullable: true },
  "prioritas": { data_type: "text", udt_name: "text", is_nullable: true },
  "fasetanam": { data_type: "text", udt_name: "text", is_nullable: true },
  "bulanmaster": { data_type: "text", udt_name: "text", is_nullable: true },
  "tahun": { data_type: "integer", udt_name: "int4", is_nullable: true },
  "nks": { data_type: "text", udt_name: "text", is_nullable: true },
  "lat": { data_type: "numeric", udt_name: "numeric", is_nullable: true },
  "long": { data_type: "numeric", udt_name: "numeric", is_nullable: true }
};

function getColumnSchemaInfo(columnName: string): { data_type: string; udt_name: string; is_nullable: boolean } {
  return ubinanRawSchema[columnName] || { data_type: "text", udt_name: "text", is_nullable: true };
}

// --- SERVER ACTIONS UNTUK UBINAN RAW ---

export async function analyzeCsvHeadersAction(formData: FormData): Promise<{
  success: boolean;
  message?: string;
  analysis?: AnalysisResult;
}> {
  const file = formData.get("file") as File | null;
  if (!file) return { success: false, message: "File tidak ditemukan." };

  try {
    const fileContent = await file.text();
    const records: any[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      to_line: 2,
    });

    if (records.length === 0) {
      return { success: false, message: "File CSV kosong atau tidak memiliki header." };
    }
    
    // --- AWAL PATCH ---

    const csvHeadersRaw = Object.keys(records[0]);

    // Fungsi untuk membersihkan dan menormalisasi header
    // Ini akan menghapus BOM, spasi berlebih, dan mengubah ke huruf kecil
    const normalizeHeader = (header: string) => {
        // Hapus karakter BOM (\uFEFF) dan karakter non-ASCII lainnya, lalu trim dan ubah ke lowercase
        return header.replace(/[\uFEFF\s]/g, '').toLowerCase();
    };

    // Buat peta dari header yang sudah dinormalisasi ke header asli dari file
    const normalizedToRawHeaderMap = new Map<string, string>();
    csvHeadersRaw.forEach(rawHeader => {
        normalizedToRawHeaderMap.set(normalizeHeader(rawHeader), rawHeader);
    });

    const analysis: AnalysisResult = {
      matchedHeaders: [],
      unmappedDbCols: [],
      unexpectedCsvHeaders: [...csvHeadersRaw] // Mulai dengan semua header asli
    };

    // Lakukan auto-matching menggunakan header yang sudah dinormalisasi
    REQUIRED_UBINAN_RAW_COLS.forEach(dbCol => {
      const normalizedDbCol = normalizeHeader(dbCol);
      
      if (normalizedToRawHeaderMap.has(normalizedDbCol)) {
        const originalCsvHeader = normalizedToRawHeaderMap.get(normalizedDbCol)!;
        analysis.matchedHeaders.push({ dbCol, csvHeader: originalCsvHeader });
        // Hapus header yang sudah cocok dari daftar tak terduga
        analysis.unexpectedCsvHeaders = analysis.unexpectedCsvHeaders.filter(h => h !== originalCsvHeader);
      } else {
        analysis.unmappedDbCols.push(dbCol);
      }
    });

    // --- AKHIR PATCH ---

    return { success: true, analysis };
  } catch (error) {
    console.error("Header analysis error:", error);
    return { success: false, message: "Gagal membaca header file CSV." };
  }
}

export async function uploadUbinanRawAction(formData: FormData): Promise<ActionResult> {
  const mappingConfigStr = formData.get("mappingConfig") as string | null;
  if (!mappingConfigStr) return { success: false, message: "Konfigurasi pemetaan kolom tidak ditemukan." };
  
  const mappingConfig = JSON.parse(mappingConfigStr);
  const cookieStore = await cookies();
  const supabaseUserContext = await createSupabaseServerClientWithUserContext(cookieStore);
  const { data: { user } } = await supabaseUserContext.auth.getUser();
  if (user?.user_metadata?.role !== "super_admin") return { success: false, message: "Akses ditolak." };
  
  const username = user.user_metadata?.username || user.email || 'tidak_diketahui';
  const file = formData.get("file") as File | null;
  if (!file) return { success: false, message: "File tidak ditemukan." };
  
  try {
    // ✅ BARU: Ambil ID kegiatan Padi dan Palawija di awal
    const [padiResult, palawijaResult] = await Promise.all([
        supabaseServer.from('kegiatan').select('id').eq('nama_kegiatan', 'Ubinan Padi').single(),
        supabaseServer.from('kegiatan').select('id').eq('nama_kegiatan', 'Ubinan Palawija').single()
    ]);

    if (padiResult.error || !padiResult.data) {
        throw new Error("Konfigurasi error: Kegiatan 'Ubinan Padi' tidak ditemukan di tabel 'kegiatan'.");
    }
    if (palawijaResult.error || !palawijaResult.data) {
        throw new Error("Konfigurasi error: Kegiatan 'Ubinan Palawija' tidak ditemukan di tabel 'kegiatan'.");
    }

    const padiKegiatanId = padiResult.data.id;
    const palawijaKegiatanId = palawijaResult.data.id;

    const fileContent = await file.text();
    const records: any[] = parse(fileContent, { columns: true, skip_empty_lines: true, trim: true });
    if (records.length === 0) return { success: false, message: "Tidak ada data untuk diimpor." };
    
    let allRowsToInsert: any[] = [];
    let uniqueDeletionScopesSet = new Set<string>();
    const uploadedAt = new Date().toISOString();
    let skippedRowCount = 0;

    for (const record of records) {
      const tahun = parseInt(record[mappingConfig['tahun']], 10);
      const subround = parseInt(record[mappingConfig['subround']], 10);
      const kab = parseInt(record[mappingConfig['kab']], 10);
      
      if (isNaN(tahun) || isNaN(subround) || isNaN(kab)) {
        skippedRowCount++;
        continue;
      }

      uniqueDeletionScopesSet.add(`${tahun}-${subround}-${kab}`);

      const newRow: { [key: string]: any } = { uploaded_at: uploadedAt, uploaded_by_username: username };

      for (const dbCol in mappingConfig) {
        const csvHeader = mappingConfig[dbCol];
        const value = record[csvHeader];
        const dbColumnInfo = getColumnSchemaInfo(dbCol);

        if (value === "" || value === undefined || value === null) {
          newRow[dbCol] = null;
        } else {
            const valStr = value.toString();
            switch (dbColumnInfo.udt_name) {
                case 'int4': case 'integer':
                    const parsedInt = parseInt(valStr, 10);
                    newRow[dbCol] = isNaN(parsedInt) ? null : parsedInt;
                    break;
                case 'numeric': case 'float4': case 'float8':
                    const parsedFloat = parseFloat(valStr);
                    newRow[dbCol] = isNaN(parsedFloat) ? null : parsedFloat;
                    break;
                case 'timestamptz': case 'timestamp':
                    const dateVal = new Date(valStr);
                    newRow[dbCol] = isNaN(dateVal.getTime()) ? null : dateVal.toISOString();
                    break;
                default:
                    newRow[dbCol] = valStr.trim();
            }
        }
      }
      
      // ✅ DIUBAH: Tambahkan kegiatan_id ke setiap baris data yang akan di-insert
      const komoditasValue = newRow['komoditas'];
      const isPadi = ['1 - Padi Sawah', '3 - Padi Ladang'].includes(komoditasValue);
      newRow['kegiatan_id'] = isPadi ? padiKegiatanId : palawijaKegiatanId;
      
      allRowsToInsert.push(newRow);
    }
    
    if (allRowsToInsert.length === 0) return { success: false, message: "Tidak ada baris data yang valid untuk diimpor." };

    const deletion_scopes = Array.from(uniqueDeletionScopesSet).map(key => {
        const [tahun, subround, kab] = key.split('-');
        return { tahun: parseInt(tahun), subround: parseInt(subround), kab: parseInt(kab) };
    });

    const { error: rpcError } = await supabaseServer.rpc('process_ubinan_raw_upload', {
        deletion_scopes: deletion_scopes, insert_data: allRowsToInsert
    });
    if (rpcError) throw rpcError;

    await supabaseServer.rpc('refresh_materialized_view_ubinan_anomali');
    await supabaseServer.rpc('refresh_materialized_view_ubinan_dashboard');
    
    revalidatePath("/update-data/ubinan");
    revalidatePath("/monitoring/ubinan");
    revalidatePath("/evaluasi/ubinan");
    revalidatePath("/");

    let successMessage = `Berhasil menyimpan ${allRowsToInsert.length} baris.`;
    if (skippedRowCount > 0) successMessage += ` Ada ${skippedRowCount} baris dilewati karena data kunci tidak valid.`;

    return { success: true, message: successMessage };
  } catch (error: any) {
    console.error("Ubinan Raw Upload Action Error:", error);
    return { success: false, message: "Gagal memproses file ubinan raw.", errorDetails: error.message };
  }
}

// ===================================================================================
// BAGIAN 2: LOGIKA UNTUK UPLOAD MASTER SAMPEL UBINAN
// ===================================================================================

const KABUPATEN_MAP_MASTER: { [key: string]: string } = {
    "6101": "Sambas", "6102": "Bengkayang", "6103": "Landak", "6104": "Mempawah",
    "6105": "Sanggau", "6106": "Ketapang", "6107": "Sintang", "6108": "Kapuas Hulu",
    "6109": "Sekadau", "6110": "Melawi", "6111": "Kayong Utara", "6112": "Kubu Raya",
    "6171": "Pontianak", "6172": "Singkawang"
};
const MONTH_MAP_MASTER: { [key: string]: string } = {
  'januari': '1', 'februari': '2', 'maret': '3', 'april': '4', 'mei': '5', 'juni': '6', 
  'juli': '7', 'agustus': '8', 'september': '9', 'oktober': '10', 'november': '11', 'desember': '12',
};

export async function uploadMasterSampleAction(formData: FormData): Promise<ActionResult> {
  const cookieStore = await cookies();
  const supabaseUserContext = await createSupabaseServerClientWithUserContext(cookieStore);
  const { data: { user } } = await supabaseUserContext.auth.getUser();
  if (user?.user_metadata?.role !== "super_admin") return { success: false, message: "Akses ditolak." };

  const username = user.user_metadata?.username || user.email || 'tidak_diketahui';
  const files = formData.getAll("files") as File[];
  if (!files || files.length === 0) return { success: false, message: "Tidak ada file yang dipilih." };

  let allRowsToUpsert: any[] = [];
  const uploadedAt = new Date().toISOString();
  let skippedRowCount = 0;

  try {
    for (const file of files) {
      const buffer = await file.arrayBuffer();
      const workbook = xlsx.read(buffer, { type: "buffer", cellDates: true });
      const sheetName = workbook.SheetNames[0];
      const worksheet = sheetName ? workbook.Sheets[sheetName] : undefined;
      const jsonData = worksheet ? xlsx.utils.sheet_to_json(worksheet) as any[] : [];

      for (const record of jsonData) {
        const monthName = record.bulan?.toString().trim().toLowerCase();
        const monthNumber = MONTH_MAP_MASTER[monthName];
        if (!monthNumber || !record.tahun || !record.subround || !record.idsegmen || !record.subsegmen) {
          skippedRowCount++;
          continue;
        }
        const newRow = {
          kab: record.kab, nmkab: record.nmkab, kec: record.kec, nmkec: record.nmkec,
          namalok: record.namalok, jenis_sampel: record.jenis_sampel, Utama: record.Utama,
          Cadangan: record.Cadangan, idsegmen: record.idsegmen, rilis: record.rilis, 
          x: record.x, y: record.y, subsegmen: record.subsegmen,
          tahun: parseInt(record.tahun), subround: parseInt(record.subround), bulan: monthNumber,
          uploaded_at: uploadedAt, uploaded_by_username: username,
        };
        allRowsToUpsert.push(newRow);
      }
    }
    
    if (allRowsToUpsert.length === 0) return { success: false, message: "Tidak ada baris data yang valid untuk diimpor." };

    const { error: upsertError } = await supabaseServer
      .from('master_sampel_ubinan')
      .upsert(allRowsToUpsert, { onConflict: 'tahun,subround,bulan,idsegmen,subsegmen' });
    if (upsertError) throw upsertError;

    await supabaseServer.rpc('refresh_materialized_view_ubinan_dashboard');

    revalidatePath("/update-data/ubinan");

    let successMessage = `Berhasil menyimpan/memperbarui ${allRowsToUpsert.length} baris master sampel.`;
    if (skippedRowCount > 0) successMessage += ` Ada ${skippedRowCount} baris dilewati karena data tidak lengkap.`;

    return { success: true, message: successMessage };
  } catch (error: any) {
    console.error("Upload Master Sample Error:", error);
    return { success: false, message: "Gagal memproses file master sampel.", errorDetails: error.message };
  }
}