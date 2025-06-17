// /app/auth/register/_actions.ts
'use server';

import { cookies } from 'next/headers';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { supabaseServer } from '@/lib/supabase-server'; // Import admin client
import { type RegisterFormValues } from './schema';

export async function registerUserAction(values: RegisterFormValues) {
  // Gunakan client khusus untuk Server Action
  const supabase = createServerActionClient({ cookies });

  // Langkah 1: Daftarkan pengguna baru di sistem otentikasi Supabase
  // Sertakan data tambahan di 'options' agar bisa digunakan oleh trigger database
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: {
        full_name: values.fullname,
        username: values.username,
      },
    },
  });

  if (authError) {
    return {
      success: false,
      message: `Gagal mendaftar: ${authError.message}`,
    };
  }

  if (!authData.user) {
    return {
      success: false,
      message: 'Gagal membuat pengguna, data tidak ditemukan setelah mendaftar.',
    };
  }

  // Langkah 2: UPDATE profil publik yang (seharusnya) sudah dibuat oleh trigger
  // Ini lebih aman daripada INSERT dari klien.
  const { error: profileError } = await supabaseServer
    .from('users')
    .update({
      full_name: values.fullname,
      username: values.username,
      satker_id: values.satker_id,
      email: values.email, // Pastikan email juga diisi
      role: 'viewer',      // Atur peran default
    })
    .eq('id', authData.user.id);

  if (profileError) {
    // Rollback: Jika gagal mengupdate profil, hapus user dari sistem otentikasi
    // Ini adalah langkah penting untuk menjaga konsistensi data
    await supabaseServer.auth.admin.deleteUser(authData.user.id);
    return {
      success: false,
      message: `Registrasi berhasil, tetapi gagal menyimpan profil: ${profileError.message}`,
    };
  }

  return {
    success: true,
    message: 'Registrasi Berhasil! Silakan cek email Anda untuk verifikasi.',
  };
}