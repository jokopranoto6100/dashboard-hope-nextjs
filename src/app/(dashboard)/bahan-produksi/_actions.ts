'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase-server';
import { sektorFormSchema, linkActionSchema, reorderSchema, materiPedomanLinkSchema } from '@/lib/schemas';

// Helper 'verifySuperAdmin' tidak lagi diperlukan untuk operasi database ini
// dan bisa dihapus dari file ini jika tidak digunakan di tempat lain.

// --- Aksi untuk Sektor ---

export async function createSektor(formData: FormData) {
  // await verifySuperAdmin(); // <-- HAPUS BARIS INI
  const validated = sektorFormSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validated.success) return { error: validated.error.flatten().fieldErrors };

  // RLS akan otomatis memblokir jika bukan super_admin
  const { error } = await supabaseServer.from('sektors').insert(validated.data);
  if (error) return { error: { _form: [error.message] } };

  revalidatePath('/bahan-produksi');
  return { success: true };
}

export async function updateSektor(id: string, formData: FormData) {
  // await verifySuperAdmin(); // <-- HAPUS BARIS INI
  const validated = sektorFormSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validated.success) return { error: validated.error.flatten().fieldErrors };

  // RLS akan otomatis memblokir jika bukan super_admin
  const { error } = await supabaseServer.from('sektors').update(validated.data).eq('id', id);
  if (error) return { error: { _form: [error.message] } };
  
  revalidatePath('/bahan-produksi');
  return { success: true };
}

export async function deleteSektor(id: string) {
    // await verifySuperAdmin(); // <-- HAPUS BARIS INI

    // RLS akan melindungi kedua operasi delete ini
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
    // await verifySuperAdmin(); // <-- HAPUS BARIS INI
    const validated = reorderSchema.safeParse(items);
    if (!validated.success) return { error: { _form: ['Data urutan tidak valid.'] } };

    const updatePromises = validated.data.map(item =>
        // RLS akan melindungi setiap operasi update ini
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
    // await verifySuperAdmin(); // <-- HAPUS BARIS INI
    const validated = linkActionSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validated.success) return { error: validated.error.flatten().fieldErrors };

    // RLS akan otomatis memblokir jika bukan super_admin
    const { error } = await supabaseServer.from('links').insert(validated.data);
    if (error) return { error: { _form: [error.message] } };
    
    revalidatePath('/bahan-produksi');
    return { success: true };
}

export async function updateLink(id: string, formData: FormData) {
    // await verifySuperAdmin(); // <-- HAPUS BARIS INI
    const validated = linkActionSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validated.success) return { error: validated.error.flatten().fieldErrors };
    
    const updateData = {
        label: validated.data.label,
        href: validated.data.href,
        icon_name: validated.data.icon_name,
        description: validated.data.description,
        urutan: validated.data.urutan,
    };

    // RLS akan otomatis memblokir jika bukan super_admin
    const { error } = await supabaseServer.from('links').update(updateData).eq('id', id);
    if (error) return { error: { _form: [error.message] } };

    revalidatePath('/bahan-produksi');
    return { success: true };
}

export async function deleteLink(id: string) {
    // await verifySuperAdmin(); // <-- HAPUS BARIS INI
    const { error } = await supabaseServer.from('links').delete().eq('id', id);
    if (error) return { error: { _form: [error.message] } };

    revalidatePath('/bahan-produksi');
    return { success: true };
}

export async function updateMateriPedomanLink(formData: FormData) {
    // await verifySuperAdmin(); // <-- HAPUS BARIS INI
    const validated = materiPedomanLinkSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validated.success) return { error: validated.error.flatten().fieldErrors };
  
    const { error } = await supabaseServer
      .from('app_settings')
      .upsert({ 
        key: 'materi_pedoman_link', 
        value: validated.data.href 
      });
  
    if (error) return { error: { _form: [error.message] } };
  
    revalidatePath('/bahan-produksi');
    return { success: true, newHref: validated.data.href };
  }