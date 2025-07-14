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