// src/app/(dashboard)/bahan-produksi/_actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { createServerComponentSupabaseClient } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { sektorFormSchema, linkActionSchema, reorderSchema, materiPedomanLinkSchema } from '@/lib/schemas';

// Helper untuk verifikasi admin (tidak berubah)
async function verifySuperAdmin(): Promise<User> {
  const cookieStore = await cookies();
  const supabase = createServerComponentSupabaseClient(cookieStore); 
  const { data: { user }, error: getUserError } = await supabase.auth.getUser();
  if (getUserError || !user) throw new Error('Akses ditolak: Pengguna tidak terotentikasi.');

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (profile?.role !== 'super_admin') throw new Error('Akses ditolak: Hanya super_admin yang diizinkan.');
  
  return user; 
}

// --- Aksi untuk Sektor ---

export async function createSektor(formData: FormData) {
  await verifySuperAdmin();
  const validated = sektorFormSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validated.success) return { error: validated.error.flatten().fieldErrors };

  const { error } = await supabaseServer.from('sektors').insert(validated.data);
  if (error) return { error: { _form: [error.message] } };

  revalidatePath('/bahan-produksi');
  return { success: true };
}

export async function updateSektor(id: string, formData: FormData) {
  await verifySuperAdmin();
  const validated = sektorFormSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validated.success) return { error: validated.error.flatten().fieldErrors };

  const { error } = await supabaseServer.from('sektors').update(validated.data).eq('id', id);
  if (error) return { error: { _form: [error.message] } };
  
  revalidatePath('/bahan-produksi');
  return { success: true };
}

export async function deleteSektor(id: string) {
    await verifySuperAdmin();

    const { error: linkError } = await supabaseServer.from('links').delete().eq('sektor_id', id);
    if (linkError) {
      return { error: { _form: [`Gagal menghapus link terkait: ${linkError.message}`] } };
    }

    const { error: sektorError } = await supabaseServer.from('sektors').delete().eq('id', id);
    if (sektorError) {
      return { error: { _form: [sektorError.message] } };
    }

    revalidatePath('/bahan-produksi');
    return { success: true };
}

export async function updateSektorOrder(items: z.infer<typeof reorderSchema>) {
    await verifySuperAdmin();
    const validated = reorderSchema.safeParse(items);
    if (!validated.success) return { error: { _form: ['Data urutan tidak valid.'] } };

    const updatePromises = validated.data.map(item =>
        supabaseServer.from('sektors').update({ urutan: item.urutan }).eq('id', item.id)
    );
    
    const results = await Promise.all(updatePromises);
    const firstError = results.find(res => res.error);

    if (firstError) {
        return { error: { _form: [firstError.error?.message || 'Terjadi kesalahan saat mengupdate urutan.'] } };
    }
    
    revalidatePath('/bahan-produksi');
    return { success: true };
}


// --- Aksi untuk Link ---

export async function createLink(formData: FormData) {
    await verifySuperAdmin();
    const validated = linkActionSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validated.success) return { error: validated.error.flatten().fieldErrors };

    const { error } = await supabaseServer.from('links').insert(validated.data);
    if (error) return { error: { _form: [error.message] } };
    
    revalidatePath('/bahan-produksi');
    return { success: true };
}

export async function updateLink(id: string, formData: FormData) {
    await verifySuperAdmin();
    const validated = linkActionSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validated.success) return { error: validated.error.flatten().fieldErrors };
    
    // --- PERBAIKAN FINAL ---
    // Buat objek baru hanya dengan field yang relevan untuk di-update.
    // Ini 100% type-safe dan tidak menimbulkan error atau warning.
    const updateData = {
        label: validated.data.label,
        href: validated.data.href,
        icon_name: validated.data.icon_name,
        description: validated.data.description,
        urutan: validated.data.urutan,
    };

    const { error } = await supabaseServer.from('links').update(updateData).eq('id', id);
    if (error) return { error: { _form: [error.message] } };

    revalidatePath('/bahan-produksi');
    return { success: true };
}

export async function deleteLink(id: string) {
    await verifySuperAdmin();
    const { error } = await supabaseServer.from('links').delete().eq('id', id);
    if (error) return { error: { _form: [error.message] } };

    revalidatePath('/bahan-produksi');
    return { success: true };
}

export async function updateMateriPedomanLink(formData: FormData) {
    await verifySuperAdmin();
    const validated = materiPedomanLinkSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validated.success) return { error: validated.error.flatten().fieldErrors };
  
    // Gunakan upsert untuk membuat atau memperbarui. 'key' adalah Primary Key.
    const { error } = await supabaseServer
      .from('app_settings')
      .upsert({ 
        key: 'materi_pedoman_link', 
        value: validated.data.href 
      });
  
    if (error) return { error: { _form: [error.message] } };
  
    // Revalidasi path agar halaman me-load link baru
    revalidatePath('/bahan-produksi');
    return { success: true, newHref: validated.data.href };
  }
  