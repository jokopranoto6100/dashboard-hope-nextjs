/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/update-data/ubinan/_actions.ts
"use server";

import { supabaseServer, createSupabaseServerClientWithUserContext } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { parse } from "csv-parse/sync";

// Pastikan ubinanRawSchema dan getColumnSchemaInfo didefinisikan di sini atau diimpor
// Contoh:
// import { ubinanRawSchema, getColumnSchemaInfo } from './schema-helpers'; // Jika di file terpisah

// --- AWAL PASTE DARI SINI JIKA ANDA MENYIMPAN SKEMA DI FILE INI ---
const ubinanRawSchema: { [key: string]: { data_type: string; udt_name: string; is_nullable: boolean } } = {
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
  "long": { data_type: "numeric", udt_name: "numeric", is_nullable: true },
  "id": { data_type: "uuid", udt_name: "uuid", is_nullable: false },
  "uploaded_at": { data_type: "timestamp with time zone", udt_name: "timestamptz", is_nullable: true },
  "uploaded_by_username": { data_type: "text", udt_name: "text", is_nullable: true },
};

function getColumnSchemaInfo(columnName: string): { data_type: string; udt_name: string; is_nullable: boolean } {
  const schema = ubinanRawSchema[columnName] || ubinanRawSchema[columnName.toLowerCase()]; // Coba normalisasi jika tidak ketemu
  if (schema) {
    return schema;
  }
  console.warn(`Kolom "${columnName}" tidak ditemukan di ubinanRawSchema. Menggunakan default (text, nullable).`);
  return { data_type: "text", udt_name: "text", is_nullable: true };
}
// --- AKHIR PASTE SKEMA ---

interface ActionResult {
  success: boolean;
  message: string;
  importedCount?: number;
  errorDetails?: string;
}

export async function uploadUbinanRawAction(formData: FormData): Promise<ActionResult> {
  const cookieStore = cookies(); // cookies() is synchronous and returns the correct type
  const supabaseUserContext = createSupabaseServerClientWithUserContext(await cookieStore);

  // 1. Otentikasi & Otorisasi menggunakan client yang sadar sesi
  // PATCH: Hapus await kedua pada (await supabaseUserContext).auth.getUser()
  const { data: { user }, error: userError } = await (await supabaseUserContext).auth.getUser();
  if (userError || !user) {
    return { success: false, message: "Akses tidak sah: Tidak dapat mengambil data pengguna." };
  }
  if (user.user_metadata?.role !== "super_admin") {
    return { success: false, message: "Akses ditolak: Anda bukan super admin." };
  }
  const username = user.user_metadata?.username || user.email || 'tidak_diketahui';

  // 2. Penerimaan dan Validasi File
  const file = formData.get("file") as File | null;
  if (!file) {
    return { success: false, message: "File tidak ditemukan dalam form data." };
  }
  if (file.type !== "text/csv") {
    return { success: false, message: "Format file tidak valid. Hanya file CSV yang diperbolehkan." };
  }

  try {
    const fileContent = await file.text();
    const records: any[] = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    if (records.length === 0) {
      return { success: false, message: "File CSV kosong atau tidak ada data yang bisa diproses." };
    }

    // Validasi Header
    // PATCH: Sesuaikan expectedHeaders jika perlu, atau buat lebih dinamis.
    // Untuk saat ini, kita pastikan kolom kunci untuk delete dan komoditas ada.
    const expectedHeadersMinimal = [ "tahun", "subround", "kab", "komoditas"];
    const actualHeaders = Object.keys(records[0]);
    for (const header of expectedHeadersMinimal) {
      if (!actualHeaders.includes(header)) {
        return { success: false, message: `Header kolom wajib "${header}" tidak ditemukan di file CSV.` };
      }
    }
    // Anda bisa menambahkan validasi agar SEMUA header dari ubinanRawSchema ada jika diinginkan.

    // Identifikasi Scope Penghapusan dan Persiapan Data untuk Insert
    const uniqueDeletionScopes = new Map<string, { tahun: number; subround: number; kab: number }>(); // Komoditas dihapus dari scope delete
    const dataToInsert: any[] = [];
    const uploadedAt = new Date().toISOString();

    for (const record of records) {
      const tahun = parseInt(record.tahun, 10);
      const subround = parseInt(record.subround, 10);
      const kab = parseInt(record.kab, 10);
      const komoditas = record.komoditas?.toString().trim(); // Tetap ambil komoditas untuk data insert

      // Validasi kunci untuk PENGHAPUSAN
      if (isNaN(tahun) || isNaN(subround) || isNaN(kab)) {
        return {
          success: false,
          message: `Data kunci untuk penghapusan (tahun, subround, kab) tidak valid atau kosong pada baris: ${JSON.stringify(record)}`,
        };
      }
      // Validasi komoditas untuk DATA INSERT jika kolom komoditas di DB NOT NULL
      const komoditasSchema = getColumnSchemaInfo("komoditas");
      if (!komoditas && !komoditasSchema.is_nullable) {
          return { success: false, message: `Kolom wajib 'komoditas' kosong pada baris: ${JSON.stringify(record)}` };
      }


      const scopeKey = `${tahun}-${subround}-${kab}`; // Kunci tanpa komoditas
      if (!uniqueDeletionScopes.has(scopeKey)) {
        uniqueDeletionScopes.set(scopeKey, { tahun, subround, kab }); // Simpan tanpa komoditas
      }

      const newRow: { [key: string]: any } = {
        uploaded_at: uploadedAt,
        uploaded_by_username: username,
        // id akan di-generate oleh RPC/DB
      };

      for (const header of actualHeaders) {
        if (header === 'id') continue; // Abaikan 'id' dari CSV

        const dbColumnInfo = getColumnSchemaInfo(header);
        let value = record[header];

        if (value === "" || value === undefined || value === null) {
            if (dbColumnInfo.is_nullable) {
                newRow[header] = null;
            } else {
                // Jika ini adalah salah satu kunci delete (tahun, subround, kab), error sudah ditangani.
                // Jika ini komoditas dan !komoditas, error sudah ditangani.
                // Untuk kolom lain yang NOT NULL dan kosong:
                if (header !== 'tahun' && header !== 'subround' && header !== 'kab' && header !== 'komoditas' && !dbColumnInfo.is_nullable) {
                   return { success: false, message: `Kolom wajib '${header}' kosong namun dibutuhkan pada baris: ${JSON.stringify(record)}` };
                }
                newRow[header] = null; // Untuk kasus di mana validasi di atas tidak menangkap (misal, komoditas nullable tapi kosong)
            }
        } else {
            // Konversi tipe data
            const valStr = value.toString(); // Ambil sebagai string dulu untuk parsing
            switch (dbColumnInfo.udt_name) {
                case 'int4':
                case 'integer':
                    const parsedInt = parseInt(valStr, 10);
                    if (isNaN(parsedInt)) {
                        if (dbColumnInfo.is_nullable && (valStr.trim() === '' || valStr.toLowerCase() === 'null')) newRow[header] = null;
                        else return { success: false, message: `Nilai '${value}' tidak valid untuk kolom integer '${header}' pada baris: ${JSON.stringify(record)}` };
                    } else {
                        newRow[header] = parsedInt;
                    }
                    break;
                case 'numeric':
                    const parsedFloat = parseFloat(valStr);
                    if (isNaN(parsedFloat)) {
                        if (dbColumnInfo.is_nullable && (valStr.trim() === '' || valStr.toLowerCase() === 'null')) newRow[header] = null;
                        else return { success: false, message: `Nilai '${value}' tidak valid untuk kolom numeric '${header}' pada baris: ${JSON.stringify(record)}` };
                    } else {
                        newRow[header] = parsedFloat;
                    }
                    break;
                case 'timestamptz':
                    const dateVal = new Date(valStr);
                    if (isNaN(dateVal.getTime())) {
                        if (dbColumnInfo.is_nullable && (valStr.trim() === '' || valStr.toLowerCase() === 'null')) newRow[header] = null;
                        else return { success: false, message: `Nilai '${value}' tidak valid untuk kolom tanggal '${header}' pada baris: ${JSON.stringify(record)}` };
                    } else {
                        newRow[header] = dateVal.toISOString();
                    }
                    break;
                case 'uuid': // Jika ada kolom UUID lain dari CSV yang ingin dipertahankan (selain 'id' utama)
                    // Validasi format UUID jika perlu
                    newRow[header] = valStr.trim();
                    break;
                default: // text
                    newRow[header] = valStr.trim();
            }
        }
      }
      dataToInsert.push(newRow);
    }

    // 4. Operasi Database dalam Transaksi
    const { error: rpcError } = await supabaseServer.rpc('process_ubinan_raw_upload', {
        deletion_scopes: Array.from(uniqueDeletionScopes.values()),
        insert_data: dataToInsert,
    });

    if (rpcError) {
        console.error("Supabase RPC error:", rpcError);
        return { success: false, message: "Gagal memproses data di database.", errorDetails: rpcError.message };
    }
    // --- AWAL PATCH ---

    // 5. Refresh Materialized Views (Urutan penting)
    // Pertama, refresh ubinan_anomali
    const { error: anomaliMvError } = await supabaseServer.rpc('refresh_materialized_view_ubinan_anomali');
    if (anomaliMvError) {
        console.error("Gagal me-refresh materialized view ubinan_anomali:", anomaliMvError);
        // Data utama sudah berhasil masuk, jadi kita bisa return sukses tapi dengan pesan peringatan.
        return { 
            success: true, 
            message: `Data berhasil diimpor (${dataToInsert.length} baris), tetapi proses refresh data anomali gagal. Coba refresh manual.`, 
            importedCount: dataToInsert.length,
            errorDetails: anomaliMvError.message 
        };
    }

    // Kedua, refresh ubinan_dashboard (jika anomali sukses)
    const { error: dashboardMvError } = await supabaseServer.rpc('refresh_materialized_view_ubinan_dashboard');
    if (dashboardMvError) {
        console.warn("Gagal me-refresh materialized view ubinan_dashboard:", dashboardMvError);
        return { 
            success: true, 
            message: `Data berhasil diimpor (${dataToInsert.length} baris), tetapi materialized view dashboard gagal di-refresh. Coba refresh manual.`,
            importedCount: dataToInsert.length,
            errorDetails: dashboardMvError.message
        };
    }

    // --- AKHIR PATCH ---

    revalidatePath("/update-data/ubinan");
    revalidatePath("/monitoring/ubinan");
    revalidatePath("/evaluasi/ubinan");
    revalidatePath("/");

    return { success: true, message: `Data ubinan berhasil diimpor (${dataToInsert.length} baris).`, importedCount: dataToInsert.length };

  } catch (error: any) {
    console.error("Upload Action Error:", error);
    let errorMessage = "Terjadi kesalahan internal saat memproses file.";
    if (error.message && typeof error.message === 'string') {
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorMessage = error;
    }
    return { success: false, message: errorMessage, errorDetails: error.toString() };
  }
}