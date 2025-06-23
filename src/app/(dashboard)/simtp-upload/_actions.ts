// /app/(dashboard)/simtp-upload/_actions.ts
'use server';

// DIUBAH: Menggunakan helper kustom dari proyek Anda, sesuai referensi
import { createSupabaseServerClientWithUserContext } from '@/lib/supabase-server'; 
import { cookies } from 'next/headers';
import { google } from 'googleapis';
import { Readable } from 'stream';

// --- Helper Function untuk Google Drive API Client (Tidak berubah) ---
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

// --- Fungsi Utama Server Action ---
export async function uploadSimtpAction(formData: FormData) {
  // 1. Inisialisasi Supabase client menggunakan pola kustom Anda yang sudah benar
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClientWithUserContext(cookieStore);

  // 2. Dapatkan data pengguna inti dari Supabase Auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Akses ditolak: Anda harus login." };
  }

  // Ambil data lain dari form
  let kodeKabupaten = formData.get('satker_id') as string | null;
  const year = formData.get('year') as string | null;

  // 3. Logika untuk menentukan kodeKabupaten berdasarkan peran
  const userRole = user.user_metadata?.role;
  if (userRole !== 'super_admin') {
    // Jika bukan super admin, paksa gunakan satker_id mereka sendiri demi keamanan
    const { data: profile } = await supabase.from('users').select('satker_id').eq('id', user.id).single();
    kodeKabupaten = profile?.satker_id;
  }

  if (!kodeKabupaten || !year) {
    return { success: false, error: "Data tidak lengkap: Kode Kabupaten atau Tahun tidak valid." };
  }
  
  const successMessages: string[] = [];
  const drive = getDriveClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID!;

  try {
    const filesToUpload = [
      { key: 'stp_bulanan', type: 'STP_BULANAN', prefix: 'STP' },
      { key: 'lahan_tahunan', type: 'LAHAN_TAHUNAN', prefix: 'LahanTP' },
      { key: 'alsin_tahunan', type: 'ALSIN_TAHUNAN', prefix: 'AlsinTP' },
      { key: 'benih_tahunan', type: 'BENIH_TAHUNAN', prefix: 'BenihTP' },
    ];

    for (const fileInfo of filesToUpload) {
      const file = formData.get(fileInfo.key) as File | null;
      if (!file || file.size === 0) continue;

      const fileName = `${fileInfo.prefix}_${year}_${kodeKabupaten}.mdb`;
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
      if (existingFiles.data.files && existingFiles.data.files.length > 0) {
        const fileId = existingFiles.data.files[0].id!;
        uploadedFile = await drive.files.update({ fileId, media, fields: 'id' });
      } else {
        uploadedFile = await drive.files.create({ requestBody: fileMetadata, media, fields: 'id' });
      }
      
      const gdriveFileId = uploadedFile.data.id;
      if (!gdriveFileId) {
        throw new Error(`Gagal mendapatkan ID file dari Google Drive untuk ${fileName}`);
      }

      const currentMonth = new Date().getMonth() + 1;
      // Gunakan client supabase yang sama untuk insert
      const { error: logError } = await supabase.from('simtp_uploads').insert({
        uploader_id: user.id,
        file_type: fileInfo.type,
        file_name: fileName,
        gdrive_file_id: gdriveFileId,
        year: parseInt(year, 10),
        month: currentMonth,
        kabupaten_kode: kodeKabupaten,
      });

      if (logError) {
        throw new Error(`Upload ${fileName} berhasil, tetapi gagal mencatat log: ${logError.message}`);
      }

      successMessages.push(`${fileInfo.prefix} berhasil diupload.`);
    }

    if (successMessages.length === 0) {
        return { success: false, error: "Tidak ada file yang dipilih untuk diupload." };
    }

    return { success: true, message: successMessages.join(' | ') };

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("SIMTP Upload Action Error:", error);
      return { success: false, error: error.message || "Terjadi kesalahan yang tidak diketahui di server." };
    } else {
      console.error("SIMTP Upload Action Error:", error);
      return { success: false, error: "Terjadi kesalahan yang tidak diketahui di server." };
    }
  }
}

// --- ACTION BARU UNTUK MENGAMBIL RIWAYAT ---
export async function getUploadHistoryAction({ year, satkerId }: { year: number; satkerId: string; }) {
  // Gunakan pola yang sama untuk inisialisasi client
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClientWithUserContext(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Akses ditolak." };
  }

  const userRole = user.user_metadata?.role;
  // Ambil satker_id dari user yang login untuk validasi
  const { data: profile } = await supabase.from('users').select('satker_id').eq('id', user.id).single();
  const userSatkerId = profile?.satker_id;

  if (userRole !== 'super_admin' && satkerId !== userSatkerId) {
    return { success: false, error: "Anda tidak memiliki izin untuk melihat riwayat satker ini." };
  }

  try {
    const { data, error } = await supabase
      .from('simtp_uploads')
      .select('id, uploaded_at, file_type, file_name')
      .eq('year', year)
      .eq('kabupaten_kode', satkerId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    
    return { success: true, data };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Terjadi kesalahan yang tidak diketahui." };
  }
}