'use server';

import { createServerComponentSupabaseClient } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
// == PERUBAHAN: Impor tipe dan konstanta dari file baru ==
import { ALL_STATUSES, PerusahaanKehutanan } from "./kehutanan.types";


// Action untuk MENGAMBIL data
export const getKehutananData = async (): Promise<PerusahaanKehutanan[]> => {
    const cookieStore = cookies();
    const supabase = createServerComponentSupabaseClient(await cookieStore);

    const { data, error } = await supabase
        .from('perusahaan_kehutanan')
        .select(`
            id, nama_perusahaan, alamat_lengkap, kabupaten, kode_kab, status_perusahaan, keterangan, date_modified,
            user_modified:users!user_modified (full_name) 
        `)
        .order('nama_perusahaan', { ascending: true });

    if (error) {
        console.error("Error fetching kehutanan data:", error.message);
        throw new Error(`Gagal mengambil data perusahaan kehutanan: ${error.message}`);
    }
    if (!data) return [];
    
    // @ts-ignore - Kita biarkan ignore ini untuk sementara agar tidak kompleks
    return data.map(item => ({ ...item, user_modified: item.user_modified?.full_name || 'Tidak diketahui' }));
};


// Action untuk MENGUBAH data
export async function updateKehutananAction(perusahaanId: string, formData: FormData) {
    const cookieStore = cookies();
    const supabase = createServerComponentSupabaseClient(await cookieStore);

    // Schema Zod bisa tetap di sini karena tidak diekspor
    const formSchema = z.object({
        nama_perusahaan: z.string().min(3, "Nama perusahaan minimal 3 karakter."),
        alamat_lengkap: z.string().optional(),
        status_perusahaan: z.enum(ALL_STATUSES).optional(),
        keterangan: z.string().optional(),
    });

    const validated = formSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validated.success) return { success: false, error: validated.error.flatten().fieldErrors };

    const { error: rpcError } = await supabase.rpc('update_perusahaan_kehutanan', {
        p_id: perusahaanId,
        p_nama_perusahaan: validated.data.nama_perusahaan,
        p_alamat_lengkap: validated.data.alamat_lengkap,
        p_status_perusahaan: validated.data.status_perusahaan,
        p_keterangan: validated.data.keterangan,
    });

    if (rpcError) return { success: false, error: { _form: [rpcError.message] } };
    
    revalidatePath('/kehutanan');
    return { success: true };
}