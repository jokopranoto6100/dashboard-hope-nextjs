'use server';

import { z } from 'zod';
import { supabaseServer } from '@/lib/supabase-server';
import { sektorFormSchema, linkActionSchema, reorderSchema, materiPedomanLinkSchema } from '@/lib/schemas';

// ✅ Helper untuk logging performance
const withPerformanceLogging = async <T>(
    actionName: string, 
    operation: () => Promise<T>
): Promise<T> => {
    const startTime = Date.now();
    try {
        const result = await operation();
        const duration = Date.now() - startTime;
        if (duration > 1000) {
            console.warn(`${actionName} took ${duration}ms - consider optimization`);
        }
        return result;
    } catch (error) {
        const duration = Date.now() - startTime;
        console.error(`${actionName} failed after ${duration}ms:`, error);
        throw error;
    }
};

// --- Aksi untuk Sektor ---

export async function createSektor(formData: FormData) {
    return withPerformanceLogging('createSektor', async () => {
        try {
            const validated = sektorFormSchema.safeParse(Object.fromEntries(formData.entries()));
            if (!validated.success) return { error: validated.error.flatten().fieldErrors };

            const { error } = await supabaseServer.from('sektors').insert(validated.data);
            if (error) return { error: { _form: [error.message] } };

            return { success: true };
        } catch (error: unknown) {
            console.error('createSektor error:', error);
            return { error: { _form: ['Terjadi kesalahan saat membuat sektor.'] } };
        }
    });
}

export async function updateSektor(id: string, formData: FormData) {
    return withPerformanceLogging('updateSektor', async () => {
        try {
            const validated = sektorFormSchema.safeParse(Object.fromEntries(formData.entries()));
            if (!validated.success) return { error: validated.error.flatten().fieldErrors };

            const { error } = await supabaseServer.from('sektors').update(validated.data).eq('id', id);
            if (error) return { error: { _form: [error.message] } };
            
            return { success: true };
        } catch (error: unknown) {
            console.error('updateSektor error:', error);
            return { error: { _form: ['Terjadi kesalahan saat mengupdate sektor.'] } };
        }
    });
}

export async function deleteSektor(id: string) {
    return withPerformanceLogging('deleteSektor', async () => {
        try {
            // ✅ Gunakan transaction untuk atomic operation
            const { error } = await supabaseServer.rpc('delete_sektor_with_links', { 
                sektor_id: id 
            });

            if (error) {
                // Fallback ke manual delete jika RPC function tidak tersedia
                console.warn('RPC function not found, using manual delete:', error.message);
                
                const { error: linkError } = await supabaseServer
                    .from('links')
                    .delete()
                    .eq('sektor_id', id);
                    
                if (linkError) {
                    return { error: { _form: [`Gagal menghapus link terkait: ${linkError.message}`] } };
                }

                const { error: sektorError } = await supabaseServer
                    .from('sektors')
                    .delete()
                    .eq('id', id);
                    
                if (sektorError) {
                    return { error: { _form: [sektorError.message] } };
                }
            }

            return { success: true };
        } catch (error: unknown) {
            console.error('deleteSektor error:', error);
            return { error: { _form: ['Terjadi kesalahan saat menghapus sektor.'] } };
        }
    });
}

export async function updateSektorOrder(items: z.infer<typeof reorderSchema>) {
    return withPerformanceLogging('updateSektorOrder', async () => {
        try {
            const validated = reorderSchema.safeParse(items);
            if (!validated.success) return { error: { _form: ['Data urutan tidak valid.'] } };

            // ✅ Batasi concurrent operations dan tambahkan timeout
            const updatePromises = validated.data.map(async (item, index) => {
                // Delay kecil untuk menghindari database lock
                if (index > 0) {
                    await new Promise(resolve => setTimeout(resolve, 25 * index));
                }
                
                const result = await supabaseServer
                    .from('sektors')
                    .update({ urutan: item.urutan })
                    .eq('id', item.id);
                    
                if (result.error) {
                    throw new Error(`Failed to update item ${item.id}: ${result.error.message}`);
                }
                return result;
            });
            
            // ✅ Timeout setelah 15 detik
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Update timeout after 15 seconds')), 15000)
            );
            
            await Promise.race([Promise.all(updatePromises), timeoutPromise]);
            
            return { success: true };
            
        } catch (error: unknown) {
            console.error('updateSektorOrder error:', error);
            const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat mengupdate urutan.';
            return { error: { _form: [message] } };
        }
    });
}

// --- Aksi untuk Link ---

export async function createLink(formData: FormData) {
    return withPerformanceLogging('createLink', async () => {
        try {
            const validated = linkActionSchema.safeParse(Object.fromEntries(formData.entries()));
            if (!validated.success) return { error: validated.error.flatten().fieldErrors };

            const { error } = await supabaseServer.from('links').insert(validated.data);
            if (error) return { error: { _form: [error.message] } };
            
            return { success: true };
        } catch (error: unknown) {
            console.error('createLink error:', error);
            return { error: { _form: ['Terjadi kesalahan saat membuat link.'] } };
        }
    });
}

export async function updateLink(id: string, formData: FormData) {
    return withPerformanceLogging('updateLink', async () => {
        try {
            const validated = linkActionSchema.safeParse(Object.fromEntries(formData.entries()));
            if (!validated.success) return { error: validated.error.flatten().fieldErrors };
            
            const updateData = {
                label: validated.data.label,
                href: validated.data.href,
                icon_name: validated.data.icon_name,
                description: validated.data.description,
                urutan: validated.data.urutan,
            };

            const { error } = await supabaseServer.from('links').update(updateData).eq('id', id);
            if (error) return { error: { _form: [error.message] } };

            return { success: true };
        } catch (error: unknown) {
            console.error('updateLink error:', error);
            return { error: { _form: ['Terjadi kesalahan saat mengupdate link.'] } };
        }
    });
}

export async function deleteLink(id: string) {
    return withPerformanceLogging('deleteLink', async () => {
        try {
            const { error } = await supabaseServer.from('links').delete().eq('id', id);
            if (error) return { error: { _form: [error.message] } };

            return { success: true };
        } catch (error: unknown) {
            console.error('deleteLink error:', error);
            return { error: { _form: ['Terjadi kesalahan saat menghapus link.'] } };
        }
    });
}

export async function updateMateriPedomanLink(formData: FormData) {
    return withPerformanceLogging('updateMateriPedomanLink', async () => {
        try {
            const validated = materiPedomanLinkSchema.safeParse(Object.fromEntries(formData.entries()));
            if (!validated.success) return { error: validated.error.flatten().fieldErrors };
            
            const { error } = await supabaseServer
                .from('app_settings')
                .upsert({ 
                    key: 'materi_pedoman_link', 
                    value: validated.data.href 
                });
            
            if (error) return { error: { _form: [error.message] } };
            
            return { success: true, newHref: validated.data.href };
        } catch (error: unknown) {
            console.error('updateMateriPedomanLink error:', error);
            return { error: { _form: ['Terjadi kesalahan saat mengupdate link materi pedoman.'] } };
        }
    });
}

// ✅ Batch operations untuk multiple actions
export async function batchUpdateLinks(updates: Array<{ id: string; data: Record<string, unknown> }>) {
    return withPerformanceLogging('batchUpdateLinks', async () => {
        try {
            const updatePromises = updates.map(async ({ id, data }, index) => {
                // Stagger requests untuk menghindari rate limiting
                if (index > 0) {
                    await new Promise(resolve => setTimeout(resolve, 50 * index));
                }
                
                return supabaseServer.from('links').update(data).eq('id', id);
            });
            
            const results = await Promise.all(updatePromises);
            const firstError = results.find(res => res.error);
            
            if (firstError) {
                throw new Error(firstError.error?.message || 'Batch update failed');
            }
            
            return { success: true };
        } catch (error: unknown) {
            console.error('batchUpdateLinks error:', error);
            return { error: { _form: ['Terjadi kesalahan saat mengupdate multiple links.'] } };
        }
    });
}