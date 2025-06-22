// src/app/(dashboard)/bahan-produksi/_actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { createServerComponentSupabaseClient } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

// Helper untuk verifikasi admin
async function verifySuperAdmin(): Promise<User> {
  const cookieStore = await cookies();
  const supabase = createServerComponentSupabaseClient(cookieStore); 
  const { data: { user }, error: getUserError } = await supabase.auth.getUser();
  if (getUserError || !user) throw new Error('Akses ditolak: Pengguna tidak terotentikasi.');

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (profile?.role !== 'super_admin') throw new Error('Akses ditolak: Hanya super_admin yang diizinkan.');
  
  return user; 
}

// Skema validasi untuk data sektor
const sektorSchema = z.object({
  nama: z.string().min(3, 'Nama sektor minimal 3 karakter.'),
  icon_name: z.string().min(1, 'Ikon harus dipilih.'),
  bg_color_class: z.string().optional(),
  urutan: z.coerce.number().int(),
});

// Skema validasi untuk data link
const linkSchema = z.object({
  label: z.string().min(3, 'Label minimal 3 karakter.'),
  href: z.string().url('URL tidak valid.'),
  icon_name: z.string().min(1, 'Ikon harus dipilih.'),
  description: z.string().optional(),
  sektor_id: z.string().uuid('ID Sektor tidak valid.'),
  urutan: z.coerce.number().int(),
});

// --- Aksi untuk Sektor ---

export async function createSektor(formData: FormData) {
  await verifySuperAdmin();
  const validated = sektorSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validated.success) return { error: validated.error.flatten().fieldErrors };

  const { error } = await supabaseServer.from('sektors').insert(validated.data);
  if (error) return { error: { _form: [error.message] } };

  revalidatePath('/bahan-produksi');
  return { success: true };
}

export async function updateSektor(id: string, formData: FormData) {
  await verifySuperAdmin();
  const validated = sektorSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validated.success) return { error: validated.error.flatten().fieldErrors };

  const { error } = await supabaseServer.from('sektors').update(validated.data).eq('id', id);
  if (error) return { error: { _form: [error.message] } };
  
  revalidatePath('/bahan-produksi');
  return { success: true };
}

export async function deleteSektor(id: string) {
    await verifySuperAdmin();
    const { error } = await supabaseServer.from('sektors').delete().eq('id', id);
    if (error) return { error: { _form: [error.message] } };

    revalidatePath('/bahan-produksi');
    return { success: true };
}

// --- Aksi untuk Link ---

export async function createLink(formData: FormData) {
    await verifySuperAdmin();
    const validated = linkSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validated.success) return { error: validated.error.flatten().fieldErrors };

    const { error } = await supabaseServer.from('links').insert(validated.data);
    if (error) return { error: { _form: [error.message] } };
    
    revalidatePath('/bahan-produksi');
    return { success: true };
}

export async function updateLink(id: string, formData: FormData) {
    await verifySuperAdmin();
    const validated = linkSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validated.success) return { error: validated.error.flatten().fieldErrors };
    
    const { error } = await supabaseServer.from('links').update(validated.data).eq('id', id);
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