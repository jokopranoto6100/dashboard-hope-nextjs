// src/app/(dashboard)/pengguna/_actions.ts
'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { createServerComponentSupabaseClient } from '@/lib/supabase'; // Client untuk mendapatkan sesi pengguna saat ini
import { supabaseServer } from '@/lib/supabase-server'; // Client dengan service_role untuk operasi admin

/**
 * Fungsi helper untuk memverifikasi apakah pengguna saat ini adalah super_admin.
 */
async function verifySuperAdmin() {
  const cookieStore = cookies();
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
  console.log(`[verifySuperAdmin] User: ${user.email}, Attempted Role for Verification: ${currentUserRole}`);

  if (currentUserRole !== 'super_admin') {
    console.warn(`[verifySuperAdmin] Unauthorized access attempt by user ${user.email} with role '${currentUserRole}'.`);
    throw new Error('Akses ditolak: Hanya super_admin yang diizinkan melakukan aksi ini.');
  }

  console.log(`[verifySuperAdmin] User ${user.email} verified as super_admin.`);
  return user;
}

/**
 * Server Action untuk menghapus pengguna berdasarkan ID.
 */
export async function deleteUserAction(userId: string) {
  try {
    await verifySuperAdmin();
    if (!userId) {
      console.warn('[deleteUserAction] User ID is required.');
      throw new Error('User ID tidak boleh kosong.');
    }
    console.log(`[deleteUserAction] Attempting to delete user with ID: ${userId}`);
    const { error: deleteError } = await supabaseServer.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error(`[deleteUserAction] Error deleting user ${userId} from Supabase Auth:`, deleteError);
      throw new Error(`Gagal menghapus pengguna: ${deleteError.message}`);
    }
    console.log(`[deleteUserAction] User ${userId} successfully deleted from Supabase Auth.`);
    revalidatePath('/pengguna');
    console.log('[deleteUserAction] Path /pengguna revalidated.');
    return { success: true, message: 'Pengguna berhasil dihapus.' };
  } catch (error: any) {
    console.error('[deleteUserAction] Overall error:', error.message, error);
    return { 
      success: false, 
      message: error.message || 'Terjadi kesalahan tidak diketahui saat menghapus pengguna.' 
    };
  }
}

/**
 * Interface untuk payload data saat mengubah peran pengguna.
 */
interface UpdateUserRolePayload {
  userId: string;
  newRole: string;
}

/**
 * Server Action untuk mengubah peran pengguna.
 */
export async function updateUserRoleAction(payload: UpdateUserRolePayload) {
  try {
    await verifySuperAdmin();
    const { userId, newRole } = payload;

    if (!userId || !newRole) throw new Error('User ID dan peran baru tidak boleh kosong.');
    
    console.log(`[updateUserRoleAction] Attempting to update role for user ID: ${userId} to new role: ${newRole}.`);

    console.log(`[updateUserRoleAction] Calling RPC 'update_user_custom_role' for user ${userId} to role ${newRole}.`);
    const { data: roleSetInDbByRpc, error: rpcRoleError } = await supabaseServer.rpc('update_user_custom_role', {
      user_id_to_update: userId,
      new_custom_role: newRole,
    });

    console.log(`[updateUserRoleAction] RPC 'update_user_custom_role' call completed. Error:`, JSON.stringify(rpcRoleError, null, 2));
    console.log(`[updateUserRoleAction] RPC 'update_user_custom_role' call completed. Role set in DB (returned by DB function):`, roleSetInDbByRpc);

    if (rpcRoleError) throw new Error(`Gagal memperbarui kolom peran kustom via RPC: ${rpcRoleError.message}.`);
    if (roleSetInDbByRpc !== newRole) throw new Error('Gagal memperbarui kolom peran kustom: Nilai di database tidak sesuai harapan setelah pemanggilan fungsi.');
    
    console.log(`[updateUserRoleAction] RPC 'update_user_custom_role' for user ${userId} to role ${newRole} successful.`);

    const { data: targetUserData, error: getUserError } = await supabaseServer.auth.admin.getUserById(userId);
    if (getUserError) console.warn(`[updateUserRoleAction] Peringatan: Gagal mengambil metadata pengguna ${userId} untuk sinkronisasi sesi. Error: ${getUserError.message}`);
    
    const existingUserMetadata = targetUserData?.user?.user_metadata || {};
    const updatedUserMetadata = { ...existingUserMetadata, role: newRole };

    console.log(`[updateUserRoleAction] Updating user_metadata.role for user ${userId} to ${newRole}.`);
    const { error: updateMetaError } = await supabaseServer.auth.admin.updateUserById( userId, { user_metadata: updatedUserMetadata });

    if (updateMetaError) console.warn(`[updateUserRoleAction] Peringatan: Kolom peran kustom berhasil diupdate, tapi gagal sinkronisasi user_metadata.role untuk pengguna ${userId}. Error: ${updateMetaError.message}`);
    else console.log(`[updateUserRoleAction] user_metadata.role for user ${userId} successfully updated to ${newRole}.`);

    revalidatePath('/pengguna');
    console.log(`[updateUserRoleAction] Path /pengguna revalidated.`);
    return { success: true, message: `Peran pengguna berhasil diperbarui menjadi ${newRole}.` };
  } catch (error: any) {
    console.error('[updateUserRoleAction] Overall error:', error.message, error);
    return { success: false, message: error.message || 'Terjadi kesalahan fatal saat memperbarui peran pengguna.' };
  }
}

/**
 * Interface untuk data yang dibutuhkan saat membuat atau mengedit pengguna.
 */
interface UserFormData {
  email: string;
  password?: string; // Opsional, terutama saat edit
  username: string;
  role: string;
}

/**
 * Interface untuk payload edit pengguna, termasuk userId.
 */
interface EditUserPayload extends UserFormData {
  userId: string;
}


/**
 * Server Action untuk membuat pengguna baru.
 */
export async function createUserAction(userData: UserFormData) { // Menggunakan UserFormData
  try {
    await verifySuperAdmin();
    const { email, password, username, role } = userData;

    if (!email || !username || !role) throw new Error("Email, username, dan peran harus diisi.");
    if (!password) throw new Error("Password harus diisi untuk pengguna baru.");

    console.log(`[createUserAction] Attempting to create new user. Email: ${email}, Username: ${username}, Role: ${role}`);

    const { data: newUserResponse, error: createError } = await supabaseServer.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, 
      user_metadata: { username_initial: username, role_initial: role }
    });

    if (createError) throw new Error(`Gagal membuat pengguna di Supabase Auth: ${createError.message}`);
    const newUser = newUserResponse?.user;
    if (!newUser || !newUser.id) throw new Error('Gagal membuat pengguna: tidak ada data pengguna yang valid dikembalikan.');
    
    console.log(`[createUserAction] User ${email} (ID: ${newUser.id}) created in Supabase Auth. Now updating custom columns.`);
    
    const { data: roleSetInDb, error: rpcRoleError } = await supabaseServer.rpc('update_user_custom_role', {
        user_id_to_update: newUser.id,
        new_custom_role: role,
    });
    if (rpcRoleError || roleSetInDb !== role) {
        await supabaseServer.auth.admin.deleteUser(newUser.id);
        throw new Error(`Pengguna dibuat, tapi gagal mengatur kolom peran kustom: ${rpcRoleError?.message || `DB melaporkan peran sebagai '${roleSetInDb}' bukan '${role}'`}`);
    }
    console.log(`[createUserAction] Custom role '${role}' set for new user ${newUser.id} via RPC.`);

    const { data: usernameSetInDb, error: rpcUsernameError } = await supabaseServer.rpc('update_user_custom_username', {
        user_id_to_update: newUser.id,
        new_custom_username: username,
    });
    if (rpcUsernameError || usernameSetInDb !== username) {
        await supabaseServer.auth.admin.deleteUser(newUser.id);
        throw new Error(`Pengguna dibuat, tapi gagal mengatur kolom username kustom: ${rpcUsernameError?.message || `DB melaporkan username sebagai '${usernameSetInDb}' bukan '${username}'`}`);
    }
    console.log(`[createUserAction] Custom username '${username}' set for new user ${newUser.id} via RPC.`);

    const { error: updateMetaError } = await supabaseServer.auth.admin.updateUserById(
      newUser.id,
      { user_metadata: { username: username, role: role } }
    );
    if (updateMetaError) console.warn(`[createUserAction] Peringatan: Kolom kustom berhasil diupdate, tapi gagal sinkronisasi user_metadata untuk pengguna baru ${newUser.id}.`);
    else console.log(`[createUserAction] user_metadata for new user ${newUser.id} successfully set.`);

    revalidatePath('/pengguna');
    console.log('[createUserAction] Path /pengguna revalidated.');
    return { success: true, message: `Pengguna ${email} berhasil dibuat.`, userId: newUser.id };
  } catch (error: any) {
    console.error('[createUserAction] Overall error:', error.message, error);
    return { success: false, message: error.message || 'Terjadi kesalahan fatal saat membuat pengguna.' };
  }
}


/**
 * Server Action untuk mengedit data pengguna yang ada.
 * @param {EditUserPayload} payload - Data pengguna yang akan diupdate, termasuk userId.
 * @returns {Promise<{success: boolean, message: string}>} Hasil operasi.
 */
export async function editUserAction(payload: EditUserPayload) {
  try {
    await verifySuperAdmin();
    const { userId, email, password, username, role } = payload;

    if (!userId) throw new Error("User ID diperlukan untuk edit.");
    if (!email || !username || !role) throw new Error("Email, username, dan peran harus diisi.");

    console.log(`[editUserAction] Attempting to edit user ID: ${userId}. Data:`, { email, username, role, password_provided: !!password });

    // 1. Update data di Supabase Auth (email, password jika ada, user_metadata)
    const authUpdatePayload: { email?: string; password?: string; user_metadata?: Record<string, any> } = {};
    if (email) authUpdatePayload.email = email;
    if (password) authUpdatePayload.password = password; // Hanya jika password diisi

    // Ambil metadata yang ada agar tidak menimpa field lain
    const { data: targetUserData, error: getUserError } = await supabaseServer.auth.admin.getUserById(userId);
    if (getUserError) throw new Error(`Gagal mengambil data pengguna ${userId} sebelum update metadata: ${getUserError.message}`);
    
    const existingUserMetadata = targetUserData?.user?.user_metadata || {};
    authUpdatePayload.user_metadata = { ...existingUserMetadata, username: username, role: role };

    console.log(`[editUserAction] Updating Supabase Auth for user ${userId} with payload:`, authUpdatePayload);
    const { error: authUpdateError } = await supabaseServer.auth.admin.updateUserById(userId, authUpdatePayload);
    if (authUpdateError) {
      console.error(`[editUserAction] Error updating user ${userId} in Supabase Auth:`, authUpdateError);
      throw new Error(`Gagal mengupdate data Auth pengguna: ${authUpdateError.message}`);
    }
    console.log(`[editUserAction] Supabase Auth data for user ${userId} updated.`);

    // 2. Update kolom kustom 'role' via RPC
    console.log(`[editUserAction] Calling RPC 'update_user_custom_role' for user ${userId} to set role to ${role}.`);
    const { data: roleSetInDb, error: rpcRoleError } = await supabaseServer.rpc('update_user_custom_role', {
      user_id_to_update: userId,
      new_custom_role: role,
    });
    if (rpcRoleError || roleSetInDb !== role) {
      throw new Error(`Gagal mengupdate kolom peran kustom via RPC: ${rpcRoleError?.message || `DB melaporkan peran sebagai '${roleSetInDb}' bukan '${role}'`}`);
    }
    console.log(`[editUserAction] Custom role '${role}' for user ${userId} updated via RPC.`);

    // 3. Update kolom kustom 'username' via RPC
    console.log(`[editUserAction] Calling RPC 'update_user_custom_username' for user ${userId} to set username to ${username}.`);
    const { data: usernameSetInDb, error: rpcUsernameError } = await supabaseServer.rpc('update_user_custom_username', {
      user_id_to_update: userId,
      new_custom_username: username,
    });
    if (rpcUsernameError || usernameSetInDb !== username) {
      throw new Error(`Gagal mengupdate kolom username kustom via RPC: ${rpcUsernameError?.message || `DB melaporkan username sebagai '${usernameSetInDb}' bukan '${username}'`}`);
    }
    console.log(`[editUserAction] Custom username '${username}' for user ${userId} updated via RPC.`);

    revalidatePath('/pengguna');
    console.log('[editUserAction] Path /pengguna revalidated.');
    return { success: true, message: `Data pengguna ${username} berhasil diperbarui.` };

  } catch (error: any) {
    console.error('[editUserAction] Overall error:', error.message, error);
    return { 
      success: false, 
      message: error.message || 'Terjadi kesalahan fatal saat mengedit pengguna.' 
    };
  }
}
