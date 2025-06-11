// src/app/(dashboard)/pengguna/_actions.ts
'use server';

import { cookies } from 'next/headers';
import { createServerComponentSupabaseClient } from '@/lib/supabase';
import { supabaseServer } from '@/lib/supabase-server';

async function verifySuperAdmin() {
  const cookieStore = await cookies();
  const supabase = createServerComponentSupabaseClient(cookieStore); 
  const { data: { user }, error: getUserError } = await supabase.auth.getUser();

  if (getUserError || !user) {
    throw new Error('Akses ditolak: Pengguna tidak terotentikasi.');
  }

  const { data: profile, error: profileError } = await supabaseServer
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (profileError || profile?.role !== 'super_admin') {
    throw new Error('Akses ditolak: Hanya super_admin yang diizinkan.');
  }
  return user; 
}

export async function deleteUserAction(userId: string) {
  try {
    // PATCH: Tangkap data admin yang sedang login
    const actor = await verifySuperAdmin(); 
    if (!userId) throw new Error('User ID tidak boleh kosong.');

    // PATCH: Tambahkan pengecekan agar tidak bisa menghapus diri sendiri
    if (actor.id === userId) {
      throw new Error('Anda tidak dapat menghapus akun Anda sendiri.');
    }

    const { error: authError } = await supabaseServer.auth.admin.deleteUser(userId);
    if (authError) throw new Error(`Gagal menghapus otentikasi pengguna: ${authError.message}`);

    return { success: true, message: 'Pengguna berhasil dihapus.' };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.';
    return { success: false, message: errorMessage };
  }
}

interface UserFormData {
  email: string;
  password?: string;
  username: string;
  full_name: string;
  satker_id: string;
  role: string;
}

export async function createUserAction(userData: UserFormData) {
  try {
    await verifySuperAdmin();
    const { email, password, username, full_name, satker_id, role } = userData;

    if (!password) throw new Error("Password harus diisi untuk pengguna baru.");

    // Membuat pengguna baru dengan client admin
    const { data: newUserResponse, error: createError } = await supabaseServer.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
    });

    if (createError) throw new Error(`Gagal membuat pengguna di Auth: ${createError.message}`);
    const newUser = newUserResponse.user;
    if (!newUser) throw new Error('Gagal membuat pengguna.');
    
    // Langsung insert ke tabel users
    const { error: profileError } = await supabaseServer.from('users').insert({
      id: newUser.id,
      username,
      full_name,
      satker_id,
      role,
    });

    if (profileError) {
      await supabaseServer.auth.admin.deleteUser(newUser.id); // Rollback
      throw new Error(`Pengguna dibuat, tapi gagal menyimpan profil: ${profileError.message}`);
    }

    return { success: true, message: `Pengguna ${email} berhasil dibuat.` };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.';
    return { success: false, message: errorMessage };
  }
}

interface EditUserPayload extends Omit<UserFormData, 'password'> {
  userId: string;
  password?: string;
}

export async function editUserAction(payload: EditUserPayload) {
  try {
    // PATCH: Tangkap data admin yang sedang login (aktor)
    const actor = await verifySuperAdmin();
    const { userId, email, password, username, full_name, satker_id, role } = payload;

    if (!userId) throw new Error("User ID diperlukan untuk edit.");

    // PATCH: Tambahkan pengecekan agar tidak bisa mengedit diri sendiri secara sembarangan
    if (actor.id === userId) {
      // Izinkan admin mengedit profilnya sendiri,
      // TAPI cegah dia menurunkan perannya sendiri yang bisa mengunci akses.
      if (role !== 'super_admin') {
        throw new Error('Anda tidak dapat menurunkan peran (role) akun Anda sendiri.');
      }
    }

    // 1. Update data di public.users
    const { error: profileError } = await supabaseServer
      .from('users')
      .update({ username, full_name, satker_id, role })
      .eq('id', userId);

    if (profileError) throw new Error(`Gagal mengupdate profil: ${profileError.message}`);
    
    // 2. Update data di auth (jika ada perubahan email/password)
    const authUpdatePayload: { email?: string; password?: string } = {};
    if (email) authUpdatePayload.email = email;
    // Hanya tambahkan password ke payload jika diisi (tidak kosong)
    if (password) authUpdatePayload.password = password;

    if (Object.keys(authUpdatePayload).length > 0) {
      const { error: authError } = await supabaseServer.auth.admin.updateUserById(userId, authUpdatePayload);
      if (authError) throw new Error(`Gagal mengupdate data Auth: ${authError.message}`);
    }

    return { success: true, message: `Data pengguna berhasil diperbarui.` };
  } catch (error: unknown) {
    // Mempertahankan error handling Anda yang sudah baik
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.';
    return { success: false, message: errorMessage };
  }
}