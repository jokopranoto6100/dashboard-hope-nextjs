/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/pengguna/_actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createServerComponentSupabaseClient } from '@/lib/supabase';
import { supabaseServer } from '@/lib/supabase-server';
import { daftarSatker } from '@/lib/satker-data';
import type { ManagedUser } from './page';
import { User } from '@supabase/supabase-js';

async function verifySuperAdmin(): Promise<User> {
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

interface ActionResult<T = null> {
    success: boolean;
    message: string;
    data?: T;
    errorFields?: { field: string; message: string }[];
}

async function logAudit(action: string, actor: User, details: object = {}) {
    const { error } = await supabaseServer.from('audit_logs').insert({
        action,
        actor_id: actor.id,
        actor_email: actor.email,
        details,
        target_user_id: (details as any).target_user_id
    });
    if (error) {
        console.error('Gagal mencatat log audit:', error.message);
    }
}

export async function createUserAction(userData: UserFormData): Promise<ActionResult<ManagedUser>> {
  try {
    const actor = await verifySuperAdmin();
    const { email, password, username, full_name, satker_id, role } = userData;
    if (!password) throw new Error("Password harus diisi untuk pengguna baru.");

    const { data: existingUser } = await supabaseServer.from('users').select('email, username').or(`email.eq.${email},username.eq.${username}`).maybeSingle();
    if (existingUser) {
        if (existingUser.email === email) return { success: false, message: "Email sudah terdaftar.", errorFields: [{ field: 'email', message: 'Email ini sudah digunakan.' }] };
        if (existingUser.username === username) return { success: false, message: "Username sudah terdaftar.", errorFields: [{ field: 'username', message: 'Username ini sudah digunakan.' }] };
    }

    const { data: newUserResponse, error: createError } = await supabaseServer.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name, username } });
    if (createError) throw new Error(`Gagal membuat pengguna di Auth: ${createError.message}`);
    const newUser = newUserResponse.user;
    if (!newUser) throw new Error('Gagal membuat pengguna.');
    
    const { data: updatedProfile, error: profileError } = await supabaseServer.from('users').update({ username, full_name, satker_id, role, email, is_active: true }).eq('id', newUser.id).select().single();
    if (profileError) {
      await supabaseServer.auth.admin.deleteUser(newUser.id);
      throw new Error(`Gagal mengupdate profil: ${profileError.message}`);
    }
    
    await logAudit('CREATE_USER', actor, { target_user_id: newUser.id, email: userData.email, role: userData.role });
    revalidatePath('/pengguna');
    
    const satkerMap = new Map(daftarSatker.map(s => [s.value, s.label]));
    const finalManagedUser: ManagedUser = { ...updatedProfile, email: newUser.email || 'N/A', satker_name: satkerMap.get(updatedProfile.satker_id) || 'N/A' }
    return { success: true, message: `Pengguna ${email} berhasil dibuat.`, data: finalManagedUser };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan.';
    return { success: false, message: errorMessage };
  }
}

export async function deleteUserAction(userId: string): Promise<ActionResult> {
  try {
    const actor = await verifySuperAdmin();
    if (actor.id === userId) throw new Error('Anda tidak dapat menghapus akun Anda sendiri.');
    
    const { data: userToDelete } = await supabaseServer.auth.admin.getUserById(userId);
    if (!userToDelete.user) throw new Error("Pengguna yang akan dihapus tidak ditemukan.");

    const { error } = await supabaseServer.auth.admin.deleteUser(userId);
    if (error) throw new Error(`Gagal menghapus otentikasi pengguna: ${error.message}`);

    await logAudit('DELETE_USER', actor, { target_user_id: userId, email: userToDelete.user.email });
    revalidatePath('/pengguna');
    return { success: true, message: 'Pengguna berhasil dihapus.' };
  } catch (error: unknown) {
    return { success: false, message: error instanceof Error ? error.message : 'Gagal menghapus pengguna.' };
  }
}

export async function editUserAction(payload: EditUserPayload): Promise<ActionResult> {
  try {
    const actor = await verifySuperAdmin();
    const { userId, email, password, username, full_name, satker_id, role } = payload;
    if (actor.id === userId && role !== 'super_admin') throw new Error('Anda tidak dapat menurunkan peran Anda sendiri.');

    const { error: profileError } = await supabaseServer.from('users').update({ username, full_name, satker_id, role }).eq('id', userId);
    if (profileError) throw new Error(`Gagal mengupdate profil: ${profileError.message}`);
    
    const authUpdatePayload: any = {};
    if (email) authUpdatePayload.email = email;
    if (password) authUpdatePayload.password = password;
    authUpdatePayload.data = { full_name, username };
    
    const { error: authError } = await supabaseServer.auth.admin.updateUserById(userId, authUpdatePayload);
    if (authError) throw new Error(`Gagal mengupdate data Auth: ${authError.message}`);

    await logAudit('EDIT_USER', actor, { target_user_id: userId, changes: { email, username, full_name, satker_id, role } });
    revalidatePath('/pengguna');
    return { success: true, message: 'Data pengguna berhasil diperbarui.' };
  } catch (error: unknown) {
    return { success: false, message: error instanceof Error ? error.message : 'Gagal memperbarui pengguna.' };
  }
}

export async function toggleUserStatusAction(userId: string, newStatus: boolean): Promise<ActionResult> {
    try {
        const actor = await verifySuperAdmin();
        if (actor.id === userId) throw new Error('Anda tidak dapat menonaktifkan akun Anda sendiri.');
        if (newStatus === false) await supabaseServer.auth.admin.signOut(userId);

        const { error } = await supabaseServer.from('users').update({ is_active: newStatus }).eq('id', userId);
        if (error) throw new Error(`Gagal mengubah status pengguna: ${error.message}`);
        
        await logAudit(newStatus ? 'ENABLE_USER' : 'DISABLE_USER', actor, { target_user_id: userId });
        revalidatePath('/pengguna');
        return { success: true, message: 'Status pengguna berhasil diubah.' };
    } catch (error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : 'Gagal mengubah status.' };
    }
}

export async function bulkDeleteUsersAction(userIds: string[]): Promise<ActionResult> {
  try {
    const actor = await verifySuperAdmin();
    if (!userIds || userIds.length === 0) throw new Error('Tidak ada pengguna yang dipilih untuk dihapus.');
    if (userIds.includes(actor.id)) throw new Error('Aksi dibatalkan: Anda tidak dapat menghapus akun Anda sendiri.');

    const results = await Promise.allSettled(userIds.map(id => supabaseServer.auth.admin.deleteUser(id)));
    const failedDeletes = results.filter(r => r.status === 'rejected');
    
    await logAudit('BULK_DELETE_USERS', actor, { target_user_ids: userIds, successCount: userIds.length - failedDeletes.length, failureCount: failedDeletes.length });
    revalidatePath('/pengguna');

    if (failedDeletes.length > 0) {
        console.error("Gagal menghapus beberapa pengguna:", failedDeletes);
        throw new Error(`Berhasil menghapus ${userIds.length - failedDeletes.length}, gagal ${failedDeletes.length} pengguna.`);
    }
    return { success: true, message: `${userIds.length} pengguna berhasil dihapus.` };
  } catch (error: unknown) {
    return { success: false, message: error instanceof Error ? error.message : 'Terjadi kesalahan saat hapus massal.' };
  }
}

// PERBAIKAN: Menambahkan tipe data yang benar untuk properti 'data' yang dikembalikan
export async function bulkImportUsersAction(usersData: any[]): Promise<ActionResult<{ errors: { email: string; reason: string; }[] }>> {
    try {
        const actor = await verifySuperAdmin();
        let successCount = 0;
        const errors: { email: string; reason: string }[] = [];

        for (const userData of usersData) {
            try {
                const password = userData.email.split('@')[0];
                const { data: newUserRes, error: createError } = await supabaseServer.auth.admin.createUser({ email: userData.email, password, email_confirm: true, user_metadata: { full_name: userData.full_name, username: userData.username }});
                if (createError) throw new Error(createError.message);
                
                const newUser = newUserRes.user;
                if (!newUser) throw new Error('Gagal membuat auth entry.');
                
                await supabaseServer.from('users').update({ username: userData.username, full_name: userData.full_name, satker_id: userData.satker_id, role: userData.role, email: userData.email, is_active: true }).eq('id', newUser.id);
                successCount++;
            } catch (e: any) {
                errors.push({ email: userData.email, reason: e.message });
            }
        }

        await logAudit('BULK_IMPORT_USERS', actor, { successCount, errors, total: usersData.length });
        revalidatePath('/pengguna');
        return { success: true, message: `Impor selesai. Berhasil: ${successCount}, Gagal: ${errors.length}.`, data: { errors } };
    } catch(error: unknown) {
        return { success: false, message: error instanceof Error ? error.message : 'Terjadi kesalahan saat impor massal.' };
    }
}

export async function sendPasswordResetAction(userId: string, email: string): Promise<ActionResult> {
  try {
      const actor = await verifySuperAdmin();
      
      // PERBAIKAN: Memanggil resetPasswordForEmail dari .auth, bukan .auth.admin
      const { error } = await supabaseServer.auth.resetPasswordForEmail(email, {
          redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback` // Ganti dengan URL halaman update password Anda jika ada
      });

      if (error) throw new Error(`Gagal mengirim link reset: ${error.message}`);

      await logAudit('SEND_PASSWORD_RESET', actor, { target_user_id: userId, email });
      return { success: true, message: `Link reset password telah dikirim ke ${email}.` };
  } catch (error: unknown) {
      return { success: false, message: error instanceof Error ? error.message : 'Gagal mengirim link reset.' };
  }
}


export async function impersonateUserAction(userId: string): Promise<ActionResult<{ actionLink: string }>> {
  try {
      const actor = await verifySuperAdmin();
      if (actor.id === userId) return { success: false, message: 'Anda tidak dapat melakukan impersonasi pada diri sendiri.' };

      const { data: userToImpersonate, error: getUserError } = await supabaseServer.auth.admin.getUserById(userId);
      if (getUserError || !userToImpersonate.user) return { success: false, message: 'Pengguna target tidak ditemukan.' };
      if (!userToImpersonate.user.email) return { success: false, message: 'Pengguna target tidak memiliki email untuk impersonasi.' };

      const { data, error } = await supabaseServer.auth.admin.generateLink({
          type: 'magiclink',
          email: userToImpersonate.user.email,
      });
      if (error) throw new Error(`Gagal membuat link impersonasi: ${error.message}`);

      await logAudit('IMPERSONATE_USER', actor, { target_user_id: userId, email: userToImpersonate.user.email });
      
      // PERBAIKAN: Mengembalikan 'action_link' dari dalam 'properties'
      return { success: true, message: 'Link impersonasi berhasil dibuat.', data: { actionLink: data.properties.action_link } };
  } catch (error: unknown) {
      return { success: false, message: error instanceof Error ? error.message : 'Gagal membuat link impersonasi.' };
  }
}

// --- ACTIONS BARU UNTUK HALAMAN DETAIL ---

export async function getUserDetailsAction(userId: string): Promise<ActionResult<ManagedUser | null>> {
  try {
      await verifySuperAdmin();
      const { data: user, error } = await supabaseServer.from('users').select('*').eq('id', userId).single();

      if (error) throw new Error(error.message);
      if (!user) return { success: true, message: 'User not found.', data: null };

      const satkerName = daftarSatker.find(s => s.value === user.satker_id)?.label || 'Satker tidak diketahui';
      const managedUser: ManagedUser = { ...user, satker_name: satkerName, email: user.email || '' };

      return { success: true, message: 'User details fetched.', data: managedUser };
  } catch (error: unknown) {
      return { success: false, message: error instanceof Error ? error.message : 'Gagal mengambil detail pengguna.' };
  }
}

export async function getAuditLogsForUserAction(userId: string): Promise<ActionResult<any[]>> {
  try {
      await verifySuperAdmin();
      const { data: auditLogs, error } = await supabaseServer
          .from('audit_logs')
          .select('*')
          .or(`actor_id.eq.${userId},target_user_id.eq.${userId}`)
          .order('created_at', { ascending: false })
          .limit(20);
      
      if (error) throw new Error(error.message);

      return { success: true, message: 'Audit logs fetched.', data: auditLogs || [] };
  } catch (error: unknown) {
      return { success: false, message: error instanceof Error ? error.message : 'Gagal mengambil log audit.' };
  }
}