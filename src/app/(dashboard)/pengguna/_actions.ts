// src/app/(dashboard)/pengguna/_actions.ts
'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createServerComponentSupabaseClient } from '@/lib/supabase';
import { supabaseServer } from '@/lib/supabase-server';

async function verifySuperAdmin() {
  const cookieStore = await cookies();
  const supabase = createServerComponentSupabaseClient(cookieStore);
  const { data: { user }, error: getUserError } = await supabase.auth.getUser();

  if (getUserError) {
    console.error('[verifySuperAdmin] Error getting current user:', getUserError.message);
    throw new Error('Akses ditolak: Tidak dapat memverifikasi sesi pengguna.');
  }
  if (!user) {
    throw new Error('Akses ditolak: Pengguna tidak terotentikasi.');
  }

  const currentUserRole = user.user_metadata?.role || (user as any).role; 
  if (currentUserRole !== 'super_admin') {
    console.warn(`[verifySuperAdmin] Unauthorized access attempt by user ${user.email} with role '${currentUserRole}'.`);
    throw new Error('Akses ditolak: Hanya super_admin yang diizinkan melakukan aksi ini.');
  }
  return user;
}

export async function deleteUserAction(userId: string) {
  try {
    await verifySuperAdmin();
    if (!userId) throw new Error('User ID tidak boleh kosong.');

    const { error: deleteError } = await supabaseServer.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error(`[deleteUserAction] Error deleting user ${userId} from Supabase Auth:`, deleteError);
      throw new Error(`Gagal menghapus pengguna: ${deleteError.message}`);
    }

    revalidatePath('/pengguna');
    return { success: true, message: 'Pengguna berhasil dihapus.' };
  } catch (error: any) {
    console.error('[deleteUserAction] Overall error:', error.message);
    return { success: false, message: error.message || 'Terjadi kesalahan saat menghapus pengguna.' };
  }
}

interface UpdateUserRolePayload {
  userId: string;
  newRole: string;
}

export async function updateUserRoleAction(payload: UpdateUserRolePayload) {
  try {
    await verifySuperAdmin();
    const { userId, newRole } = payload;

    if (!userId || !newRole) throw new Error('User ID dan peran baru tidak boleh kosong.');
    
    const { data: roleSetInDbByRpc, error: rpcRoleError } = await supabaseServer.rpc('update_user_custom_role', {
      user_id_to_update: userId,
      new_custom_role: newRole,
    });

    if (rpcRoleError) {
      console.error(`[updateUserRoleAction] Error calling RPC 'update_user_custom_role' for user ${userId}:`, rpcRoleError);
      throw new Error(`Gagal memperbarui kolom peran kustom via RPC: ${rpcRoleError.message}.`);
    }
    if (roleSetInDbByRpc !== newRole) {
      console.warn(`[updateUserRoleAction] RPC 'update_user_custom_role' for user ${userId} executed, but DB function returned '${roleSetInDbByRpc}' instead of expected '${newRole}'.`);
      throw new Error('Gagal memperbarui kolom peran kustom: Nilai di database tidak sesuai harapan.');
    }
    
    const { data: targetUserData, error: getUserError } = await supabaseServer.auth.admin.getUserById(userId);
    if (getUserError) console.warn(`[updateUserRoleAction] Peringatan: Gagal mengambil metadata pengguna ${userId} untuk sinkronisasi sesi. Error: ${getUserError.message}`);
    
    const existingUserMetadata = targetUserData?.user?.user_metadata || {};
    const updatedUserMetadata = { ...existingUserMetadata, role: newRole };

    const { error: updateMetaError } = await supabaseServer.auth.admin.updateUserById( userId, { user_metadata: updatedUserMetadata });
    if (updateMetaError) console.warn(`[updateUserRoleAction] Peringatan: Kolom peran kustom berhasil diupdate, tapi gagal sinkronisasi user_metadata.role untuk pengguna ${userId}. Error: ${updateMetaError.message}`);

    revalidatePath('/pengguna');
    return { success: true, message: `Peran pengguna berhasil diperbarui menjadi ${newRole}.` };
  } catch (error: any) {
    console.error('[updateUserRoleAction] Overall error:', error.message);
    return { success: false, message: error.message || 'Terjadi kesalahan fatal saat memperbarui peran pengguna.' };
  }
}

interface UserFormData {
  email: string;
  password?: string;
  username: string;
  role: string;
}

interface EditUserPayload extends UserFormData {
  userId: string;
}

export async function createUserAction(userData: UserFormData) {
  try {
    await verifySuperAdmin();
    const { email, password, username, role } = userData;

    if (!email || !username || !role) throw new Error("Email, username, dan peran harus diisi.");
    if (!password) throw new Error("Password harus diisi untuk pengguna baru.");

    const { data: newUserResponse, error: createError } = await supabaseServer.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, 
      user_metadata: { username_initial: username, role_initial: role }
    });

    if (createError) throw new Error(`Gagal membuat pengguna di Supabase Auth: ${createError.message}`);
    const newUser = newUserResponse?.user;
    if (!newUser || !newUser.id) throw new Error('Gagal membuat pengguna: tidak ada data pengguna yang valid dikembalikan.');
    
    const { data: roleSetInDb, error: rpcRoleError } = await supabaseServer.rpc('update_user_custom_role', {
        user_id_to_update: newUser.id,
        new_custom_role: role,
    });
    if (rpcRoleError || roleSetInDb !== role) {
        await supabaseServer.auth.admin.deleteUser(newUser.id); // Rollback
        throw new Error(`Pengguna dibuat, tapi gagal mengatur kolom peran kustom: ${rpcRoleError?.message || `DB melaporkan peran sebagai '${roleSetInDb}' bukan '${role}'`}`);
    }

    const { data: usernameSetInDb, error: rpcUsernameError } = await supabaseServer.rpc('update_user_custom_username', {
        user_id_to_update: newUser.id,
        new_custom_username: username,
    });
    if (rpcUsernameError || usernameSetInDb !== username) {
        await supabaseServer.auth.admin.deleteUser(newUser.id); // Rollback
        throw new Error(`Pengguna dibuat, tapi gagal mengatur kolom username kustom: ${rpcUsernameError?.message || `DB melaporkan username sebagai '${usernameSetInDb}' bukan '${username}'`}`);
    }

    const { error: updateMetaError } = await supabaseServer.auth.admin.updateUserById(
      newUser.id,
      { user_metadata: { username: username, role: role } }
    );
    if (updateMetaError) console.warn(`[createUserAction] Peringatan: Kolom kustom berhasil diupdate, tapi gagal sinkronisasi user_metadata untuk pengguna baru ${newUser.id}.`);

    revalidatePath('/pengguna');
    return { success: true, message: `Pengguna ${email} berhasil dibuat.`, userId: newUser.id };
  } catch (error: any) {
    console.error('[createUserAction] Overall error:', error.message);
    return { success: false, message: error.message || 'Terjadi kesalahan fatal saat membuat pengguna.' };
  }
}

export async function editUserAction(payload: EditUserPayload) {
  try {
    await verifySuperAdmin();
    const { userId, email, password, username, role } = payload;

    if (!userId) throw new Error("User ID diperlukan untuk edit.");
    if (!email || !username || !role) throw new Error("Email, username, dan peran harus diisi.");

    const authUpdatePayload: { email?: string; password?: string; user_metadata?: Record<string, any> } = {};
    if (email) authUpdatePayload.email = email;
    if (password) authUpdatePayload.password = password;
    
    const { data: targetUserData, error: getUserError } = await supabaseServer.auth.admin.getUserById(userId);
    if (getUserError) throw new Error(`Gagal mengambil data pengguna ${userId} sebelum update metadata: ${getUserError.message}`);
    
    const existingUserMetadata = targetUserData?.user?.user_metadata || {};
    authUpdatePayload.user_metadata = { ...existingUserMetadata, username: username, role: role };

    const { error: authUpdateError } = await supabaseServer.auth.admin.updateUserById(userId, authUpdatePayload);
    if (authUpdateError) throw new Error(`Gagal mengupdate data Auth pengguna: ${authUpdateError.message}`);

    const { data: roleSetInDb, error: rpcRoleError } = await supabaseServer.rpc('update_user_custom_role', {
      user_id_to_update: userId,
      new_custom_role: role,
    });
    if (rpcRoleError || roleSetInDb !== role) {
      throw new Error(`Gagal mengupdate kolom peran kustom via RPC: ${rpcRoleError?.message || `DB melaporkan peran sebagai '${roleSetInDb}' bukan '${role}'`}`);
    }

    const { data: usernameSetInDb, error: rpcUsernameError } = await supabaseServer.rpc('update_user_custom_username', {
      user_id_to_update: userId,
      new_custom_username: username,
    });
    if (rpcUsernameError || usernameSetInDb !== username) {
      throw new Error(`Gagal mengupdate kolom username kustom via RPC: ${rpcUsernameError?.message || `DB melaporkan username sebagai '${usernameSetInDb}' bukan '${username}'`}`);
    }

    revalidatePath('/pengguna');
    return { success: true, message: `Data pengguna ${username} berhasil diperbarui.` };
  } catch (error: any) {
    console.error('[editUserAction] Overall error:', error.message);
    return { success: false, message: error.message || 'Terjadi kesalahan fatal saat mengedit pengguna.' };
  }
}
