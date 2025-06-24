// /app/auth/register/_actions.ts
'use server';

import { cookies } from 'next/headers';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { supabaseServer } from '@/lib/supabase-server';
import { type RegisterFormValues } from './schema';

export async function registerUserAction(values: RegisterFormValues) {
  const supabase = createServerActionClient({ cookies });

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

  const { error: profileError } = await supabaseServer
    .from('users')
    .update({
      full_name: values.fullname,
      username: values.username,
      satker_id: values.satker_id,
      email: values.email,
      role: 'viewer',
      // === TAMBAHAN: Atur pengguna baru sebagai non-aktif sampai verifikasi email ===
      is_active: false, 
    })
    .eq('id', authData.user.id);

  if (profileError) {
    await supabaseServer.auth.admin.deleteUser(authData.user.id);
    return {
      success: false,
      message: `Registrasi berhasil, tetapi gagal menyimpan profil: ${profileError.message}`,
    };
  }

  return {
    success: true,
    message: 'Registrasi Berhasil! Silakan cek email Anda untuk verifikasi. atau hubungi Admin untuk mengaktifkan Akun Anda.',
  };
}