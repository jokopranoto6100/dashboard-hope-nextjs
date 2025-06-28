'use server';

import { createSupabaseServerClientWithUserContext } from '@/lib/supabase-server'; 
import { cookies } from 'next/headers';
import { google } from 'googleapis';
import { Readable } from 'stream';

// Helper Function untuk otentikasi (tidak berubah)
async function getSupabaseClientWithAuthenticatedUser() {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClientWithUserContext(cookieStore);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Akses ditolak: Anda harus login untuk melakukan aksi ini.");
  }
  return { supabase, user };
}

// Fungsi untuk client Google Drive (tidak berubah)
function getDriveClient() {
  const decodedServiceAccount = Buffer.from(
    process.env.GOOGLE_SERVICE_ACCOUNT_BASE64!,
    'base64'
  ).toString('utf-8');
  const credentials = JSON.parse(decodedServiceAccount);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
  });
  return google.drive({ version: 'v3', auth });
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
    const drive = getDriveClient();
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID!;
    const currentUploadYear = parseInt(yearString, 10);

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
      const existingFiles = await drive.files.list({
        q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
        fields: 'files(id)',
        spaces: 'drive',
      });

      const fileMetadata = { name: fileName, parents: [folderId] };
      const media = {
        mimeType: 'application/vnd.ms-access',
        body: Readable.from(Buffer.from(await file.arrayBuffer())),
      };
      
      let uploadedFile;
      const isUpdating = existingFiles.data.files && existingFiles.data.files.length > 0;
      if (isUpdating) {
        const fileId = existingFiles.data.files![0].id!;
        uploadedFile = await drive.files.update({ fileId, media, fields: 'id' });
      } else {
        uploadedFile = await drive.files.create({ requestBody: fileMetadata, media, fields: 'id' });
      }
      
      const gdriveFileId = uploadedFile.data.id;
      if (!gdriveFileId) {
        throw new Error(`Gagal mendapatkan ID file dari Google Drive untuk ${fileName}`);
      }

      const currentMonth = new Date().getMonth() + 1;
      
      // ✅ DIUBAH: Tambahkan 'kegiatan_id' ke dalam data yang di-insert
      const { error: logError } = await supabase.from('simtp_uploads').insert({
        uploader_id: user.id,
        file_type: fileInfo.type,
        file_name: fileName,
        gdrive_file_id: gdriveFileId,
        year: yearForData,
        month: currentMonth,
        kabupaten_kode: kodeKabupaten,
        kegiatan_id: simtpKegiatanId, // <-- INI DIA
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
      .select('id, uploaded_at, file_type, file_name')
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