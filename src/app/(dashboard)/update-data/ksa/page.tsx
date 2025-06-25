// Lokasi: src/app/(dashboard)/update-data/ksa/page.tsx (SETELAH DIPERBAIKI)

import { createSupabaseServerClientWithUserContext } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { UpdateKsaClient } from "./update-ksa-client"; // Impor komponen client baru

// Definisikan tipe agar bisa di-share dengan client component
export type LastUpdateInfo = { 
    uploaded_at: string | null; 
    uploaded_by_username: string | null; 
} | null;

// Fungsi untuk mengambil informasi pembaruan terakhir
async function getLastKsaUpdateInfo(): Promise<LastUpdateInfo> {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClientWithUserContext(cookieStore);

  const { data, error } = await supabase
    .from('ksa_amatan')
    .select('uploaded_at, uploaded_by_username')
    .not('uploaded_at', 'is', null) 
    .order('uploaded_at', { ascending: false }) 
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching last KSA update info:", error.message);
    return null;
  }
  return data;
}

export default async function KsaUpdatePage() {
    // 1. Ambil data di server
    const lastUpdate = await getLastKsaUpdateInfo();  

    // 2. Render komponen client dan teruskan data sebagai prop
    return (
      <UpdateKsaClient lastUpdate={lastUpdate} />
    );
}