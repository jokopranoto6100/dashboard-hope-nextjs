'use server';

import { createSupabaseServerClientWithUserContext } from '@/lib/supabase-server'; 
import { cookies } from 'next/headers';

// Helper Function untuk otentikasi
async function getSupabaseClientWithAuthenticatedUser() {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClientWithUserContext(cookieStore);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Akses ditolak: Anda harus login untuk melakukan aksi ini.");
  }
  return { supabase, user };
}

export async function uploadSimtpAction(formData: FormData) {
  try {
    const { supabase, user } = await getSupabaseClientWithAuthenticatedUser();

    let kodeKabupaten = formData.get('satker_id') as string | null;
    const yearString = formData.get('year') as string | null;
    const userRole = user.user_metadata?.role;

    if (userRole !== 'super_admin') {
      const { data: profile } = await supabase.from('users').select('satker_id').eq('id', user.id).single();
      kodeKabupaten = profile?.satker_id;
    }

    if (!kodeKabupaten || !yearString) {
      return { success: false, error: "Data tidak lengkap: Kode Kabupaten atau Tahun tidak valid." };
    }

    // =======================================================================
    // ✅ BARU: Ambil ID untuk kegiatan 'SIMTP' dari database sekali saja
    // =======================================================================
    const { data: kegiatanData, error: kegiatanError } = await supabase
        .from('kegiatan')
        .select('id')
        .eq('nama_kegiatan', 'SIMTP')
        .single();

    if (kegiatanError || !kegiatanData) {
        throw new Error("Konfigurasi error: Kegiatan 'SIMTP' tidak ditemukan di tabel 'kegiatan'. Harap buat terlebih dahulu.");
    }
    const simtpKegiatanId = kegiatanData.id;
    // =======================================================================

    
    const uploadDetails: string[] = [];
    const currentUploadYear = parseInt(yearString, 10);
    const bucketName = 'simtp-uploads';

    const filesToUpload = [
      { key: 'stp_bulanan', type: 'STP_BULANAN', prefix: 'STP' },
      { key: 'lahan_tahunan', type: 'LAHAN_TAHUNAN', prefix: 'LahanTP' },
      { key: 'alsin_tahunan', type: 'ALSIN_TAHUNAN', prefix: 'AlsinTP' },
      { key: 'benih_tahunan', type: 'BENIH_TAHUNAN', prefix: 'BenihTP' },
    ];

    for (const fileInfo of filesToUpload) {
      const file = formData.get(fileInfo.key) as File | null;
      if (!file || file.size === 0) continue;

      let yearForData = currentUploadYear;
      const isAnnualFile = ['LAHAN_TAHUNAN', 'ALSIN_TAHUNAN', 'BENIH_TAHUNAN'].includes(fileInfo.type);
      if (isAnnualFile) {
        yearForData = currentUploadYear - 1;
      }

      const fileName = `${fileInfo.prefix}_${yearForData}_${kodeKabupaten}.mdb`;
      const filePath = `${kodeKabupaten}/${yearForData}/${fileName}`;
      
      // Cek apakah file sudah ada di Supabase Storage
      const { data: existingFile } = await supabase.storage
        .from(bucketName)
        .list(`${kodeKabupaten}/${yearForData}`, {
          search: fileName
        });

      const isUpdating = existingFile && existingFile.length > 0;
      
      // Convert file to buffer
      const fileBuffer = await file.arrayBuffer();
      
      let uploadResult;
      if (isUpdating) {
        // Update existing file
        uploadResult = await supabase.storage
          .from(bucketName)
          .update(filePath, fileBuffer, {
            contentType: 'application/vnd.ms-access',
            upsert: true
          });
      } else {
        // Upload new file
        uploadResult = await supabase.storage
          .from(bucketName)
          .upload(filePath, fileBuffer, {
            contentType: 'application/vnd.ms-access'
          });
      }
      
      if (uploadResult.error) {
        throw new Error(`Gagal mengupload ${fileName}: ${uploadResult.error.message}`);
      }

      const currentMonth = new Date().getMonth() + 1;
      
      // ✅ DIUBAH: Simpan ke database dengan storage_path sebagai pengganti gdrive_file_id
      const { error: logError } = await supabase.from('simtp_uploads').insert({
        uploader_id: user.id,
        file_type: fileInfo.type,
        file_name: fileName,
        storage_path: filePath, // Menggunakan storage_path instead of gdrive_file_id
        year: yearForData,
        month: currentMonth,
        kabupaten_kode: kodeKabupaten,
        kegiatan_id: simtpKegiatanId,
      });

      if (logError) {
        throw new Error(`Upload ${fileName} berhasil, tetapi gagal mencatat log: ${logError.message}`);
      }

      uploadDetails.push(`${fileInfo.prefix} (${yearForData}) ${isUpdating ? 'diperbarui' : 'diupload'}.`);
    }

    if (uploadDetails.length === 0) {
        return { success: false, error: "Tidak ada file yang dipilih untuk diupload." };
    }

    return { success: true, message: "Proses upload selesai.", details: uploadDetails };

  } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui di server.";
      console.error("SIMTP Upload Action Error:", errorMessage);
      return { success: false, error: errorMessage };
  }
}

// --- ACTION UNTUK MENGAMBIL RIWAYAT (Tidak ada perubahan di sini) ---
export async function getUploadHistoryAction({ year, satkerId }: { year: number; satkerId: string; }) {
  try {
    const { supabase, user } = await getSupabaseClientWithAuthenticatedUser();

    const userRole = user.user_metadata?.role;
    const { data: profile } = await supabase.from('users').select('satker_id').eq('id', user.id).single();
    const userSatkerId = profile?.satker_id;

    if (userRole !== 'super_admin' && satkerId !== userSatkerId) {
      return { success: false, error: "Anda tidak memiliki izin untuk melihat riwayat satker ini." };
    }

    const { data, error } = await supabase
      .from('simtp_uploads')
      .select('id, uploaded_at, file_type, file_name, storage_path')
      .eq('year', year)
      .eq('kabupaten_kode', satkerId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    
    return { success: true, data };
  } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui.";
      return { success: false, error: errorMessage };
  }
}

// --- ACTION UNTUK DOWNLOAD FILE ---
export async function downloadSimtpFileAction(storagePath: string) {
  try {
    const { supabase } = await getSupabaseClientWithAuthenticatedUser();

    const bucketName = 'simtp-uploads';
    
    // Download file dari Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(storagePath);

    if (error) {
      throw new Error(`Gagal mendownload file: ${error.message}`);
    }

    // Convert blob to buffer
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return {
      success: true,
      data: {
        buffer: Array.from(buffer), // Convert buffer to array for JSON serialization
        filename: storagePath.split('/').pop() || 'download.mdb',
        contentType: 'application/vnd.ms-access'
      }
    };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui.";
    return { success: false, error: errorMessage };
  }
}

// --- ACTION UNTUK BULK DOWNLOAD FILES (Super Admin Only) ---
export async function bulkDownloadSimtpFilesAction({
  year,
  satkerId,
  fileTypes
}: {
  year: number;
  satkerId?: string; // Jika kosong, download semua satker
  fileTypes?: string[]; // Jika kosong, download semua jenis file
}) {
  try {
    const { supabase, user } = await getSupabaseClientWithAuthenticatedUser();

    const userRole = user.user_metadata?.role;
    if (userRole !== 'super_admin') {
      return { success: false, error: "Hanya super admin yang dapat melakukan bulk download." };
    }

    const bucketName = 'simtp-uploads';
    
    // Build query untuk mendapatkan daftar file (ambil yang terbaru berdasarkan uploaded_at)
    let query = supabase
      .from('simtp_uploads')
      .select('id, file_name, storage_path, kabupaten_kode, file_type, uploaded_at')
      .eq('year', year)
      .not('storage_path', 'is', null) // Hanya file yang ada storage_path
      .order('uploaded_at', { ascending: false }); // Yang terbaru dulu

    if (satkerId) {
      query = query.eq('kabupaten_kode', satkerId);
    }

    if (fileTypes && fileTypes.length > 0) {
      query = query.in('file_type', fileTypes);
    }

    const { data: allFiles, error: queryError } = await query;

    if (queryError) {
      throw new Error(`Gagal mengambil daftar file: ${queryError.message}`);
    }

    if (!allFiles || allFiles.length === 0) {
      return { success: false, error: "Tidak ada file yang ditemukan untuk kriteria yang dipilih." };
    }

    // Filter untuk ambil hanya 1 file per kombinasi satker + file_type (yang terbaru)
    const uniqueFiles: typeof allFiles = [];
    const seenCombinations = new Set<string>();

    for (const file of allFiles) {
      const combination = `${file.kabupaten_kode}_${file.file_type}`;
      if (!seenCombinations.has(combination)) {
        seenCombinations.add(combination);
        uniqueFiles.push(file);
      }
    }

    // Download semua file
    const downloadResults = [];
    const errors = [];

    for (const file of uniqueFiles) {
      try {
        const { data, error } = await supabase.storage
          .from(bucketName)
          .download(file.storage_path);

        if (error) {
          errors.push(`${file.file_name}: ${error.message}`);
          continue;
        }

        const arrayBuffer = await data.arrayBuffer();
        downloadResults.push({
          filename: file.file_name,
          kabupaten_kode: file.kabupaten_kode,
          file_type: file.file_type,
          buffer: Array.from(new Uint8Array(arrayBuffer))
        });
      } catch (error) {
        errors.push(`${file.file_name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      success: true,
      data: {
        files: downloadResults,
        totalFiles: uniqueFiles.length,
        successCount: downloadResults.length,
        errorCount: errors.length,
        errors: errors
      }
    };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui.";
    return { success: false, error: errorMessage };
  }
}

// --- ACTION UNTUK MENDAPATKAN DAFTAR SATKER YANG ADA FILE ---
export async function getSatkerWithFilesAction(year: number) {
  try {
    const { supabase, user } = await getSupabaseClientWithAuthenticatedUser();

    const userRole = user.user_metadata?.role;
    if (userRole !== 'super_admin') {
      return { success: false, error: "Hanya super admin yang dapat mengakses data ini." };
    }

    // Ambil data unique berdasarkan storage_path (karena file di-replace, 1 storage_path = 1 file)
    const { data, error } = await supabase
      .from('simtp_uploads')
      .select('kabupaten_kode, file_type, storage_path')
      .eq('year', year)
      .not('storage_path', 'is', null)
      .order('kabupaten_kode');

    if (error) throw error;

    // Group by kabupaten_kode dan hitung unique storage_path per file_type
    type GroupedData = {
      [key: string]: {
        kabupaten_kode: string;
        file_types: { [fileType: string]: number };
        total_files: number;
      };
    };

    type DataItem = {
      kabupaten_kode: string;
      file_type: string;
      storage_path: string;
    };

    // Buat set untuk tracking unique storage_path per kabupaten per file_type
    const uniqueFiles = new Set<string>();
    const groupedData = data.reduce((acc: GroupedData, item: DataItem) => {
      const { kabupaten_kode, file_type } = item;
      
      // Key unik untuk kombinasi kabupaten + file_type
      const uniqueKey = `${kabupaten_kode}_${file_type}`;
      
      // Skip jika kombinasi ini sudah ada (karena sistem replace, cuma 1 file per kombinasi)
      if (uniqueFiles.has(uniqueKey)) {
        return acc;
      }
      
      uniqueFiles.add(uniqueKey);
      
      if (!acc[kabupaten_kode]) {
        acc[kabupaten_kode] = {
          kabupaten_kode,
          file_types: {},
          total_files: 0
        };
      }
      
      // Set ke 1 karena maksimal cuma 1 file per jenis per satker
      acc[kabupaten_kode].file_types[file_type] = 1;
      acc[kabupaten_kode].total_files++;
      
      return acc;
    }, {});

    return { 
      success: true, 
      data: Object.values(groupedData)
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui.";
    return { success: false, error: errorMessage };
  }
}