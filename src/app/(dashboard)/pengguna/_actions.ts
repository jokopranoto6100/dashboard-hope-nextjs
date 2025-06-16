// src/app/(dashboard)/pengguna/_actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createServerComponentSupabaseClient } from '@/lib/supabase';
import { supabaseServer } from '@/lib/supabase-server';

/**
 * Verifikasi apakah pengguna yang sedang login adalah super_admin.
 * @returns {Promise<User>} Objek pengguna jika terverifikasi.
 * @throws {Error} Jika tidak terotentikasi atau bukan super_admin.
 */
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

// --- INTERFACE & TYPE DEFINITIONS ---

interface UserFormData {
  email: string;
  password?: string;
  username: string;
  full_name: string;
  satker_id: string;
  role: string;
}

interface EditUserPayload extends Omit<UserFormData, 'password'> {
  userId: string;
  password?: string;
}

// --- SERVER ACTIONS ---

/**
 * Menghapus pengguna dari sistem.
 * @param {string} userId - ID pengguna yang akan dihapus.
 */
export async function deleteUserAction(userId: string) {
  try {
    const actor = await verifySuperAdmin(); 
    if (!userId) throw new Error('User ID tidak boleh kosong.');
    if (actor.id === userId) {
      throw new Error('Anda tidak dapat menghapus akun Anda sendiri.');
    }

    const { error } = await supabaseServer.auth.admin.deleteUser(userId);
    if (error) throw new Error(`Gagal menghapus otentikasi pengguna: ${error.message}`);

    revalidatePath('/pengguna');
    return { success: true, message: 'Pengguna berhasil dihapus.' };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.';
    return { success: false, message: errorMessage };
  }
}

/**
 * Membuat pengguna baru dan profilnya.
 * @param {UserFormData} userData - Data pengguna dari formulir.
 */
export async function createUserAction(userData: UserFormData) {
  try {
    await verifySuperAdmin();
    const { email, password, username, full_name, satker_id, role } = userData;
    if (!password) throw new Error("Password harus diisi untuk pengguna baru.");

    // 1. Buat pengguna di Auth dengan metadata
    const { data: newUserResponse, error: createError } = await supabaseServer.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name,
        username: username,
      }
    });

    if (createError) throw new Error(`Gagal membuat pengguna di Auth: ${createError.message}`);
    const newUser = newUserResponse.user;
    if (!newUser) throw new Error('Gagal membuat pengguna.');
    
    // 2. Update profil yang dibuat oleh trigger dengan data tambahan
    const { error: profileError } = await supabaseServer
      .from('users')
      .update({ username, full_name, satker_id, role, email })
      .eq('id', newUser.id);

    if (profileError) {
      // Rollback: Hapus pengguna dari Auth jika update profil gagal
      await supabaseServer.auth.admin.deleteUser(newUser.id);
      throw new Error(`Pengguna dibuat, tapi gagal mengupdate profil: ${profileError.message}`);
    }

    revalidatePath('/pengguna');
    return { success: true, message: `Pengguna ${email} berhasil dibuat.` };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.';
    return { success: false, message: errorMessage };
  }
}

/**
 * Mengedit data pengguna yang sudah ada.
 * @param {EditUserPayload} payload - Data baru untuk pengguna.
 */
export async function editUserAction(payload: EditUserPayload) {
  try {
    const actor = await verifySuperAdmin();
    const { userId, email, password, username, full_name, satker_id, role } = payload;
    if (!userId) throw new Error("User ID diperlukan untuk edit.");

    // Mencegah super_admin menurunkan perannya sendiri
    if (actor.id === userId && role !== 'super_admin') {
      throw new Error('Anda tidak dapat menurunkan peran (role) akun Anda sendiri.');
    }

    // 1. Update profil di tabel public.users
    const { error: profileError } = await supabaseServer
      .from('users')
      .update({ username, full_name, satker_id, role })
      .eq('id', userId);

    if (profileError) throw new Error(`Gagal mengupdate profil: ${profileError.message}`);
    
    // 2. Update data di Auth (jika ada perubahan email/password/metadata)
    const authUpdatePayload: { email?: string; password?: string; data?: object } = {};
    if (email) authUpdatePayload.email = email;
    if (password) authUpdatePayload.password = password;
    // Selalu update metadata di Auth agar konsisten
    authUpdatePayload.data = { full_name, username };

    const { error: authError } = await supabaseServer.auth.admin.updateUserById(
      userId,
      authUpdatePayload
    );
    if (authError) throw new Error(`Gagal mengupdate data Auth: ${authError.message}`);

    revalidatePath('/pengguna');
    return { success: true, message: 'Data pengguna berhasil diperbarui.' };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.';
    return { success: false, message: errorMessage };
  }
}