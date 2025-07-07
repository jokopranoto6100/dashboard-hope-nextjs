// Lokasi: src/app/(dashboard)/update-data/ksa/page.tsx (SETELAH DIPERBAIKI)

import { createSupabaseServerClientWithUserContext } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { UpdateKsaClient } from "./update-ksa-client"; // Impor komponen client baru

// Definisikan tipe agar bisa di-share dengan client component
export type LastUpdateInfo = { 
    uploaded_at: string | null; 
    uploaded_by_username: string | null; 
} | null;

// Fungsi untuk mengambil informasi pembaruan terakhir KSA Padi
async function getLastKsaPadiUpdateInfo(): Promise<LastUpdateInfo> {
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
    console.error("Error fetching last KSA Padi update info:", error.message);
    return null;
  }
  return data;
}

// Fungsi untuk mengambil informasi pembaruan terakhir KSA Jagung
async function getLastKsaJagungUpdateInfo(): Promise<LastUpdateInfo> {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClientWithUserContext(cookieStore);

  const { data, error } = await supabase
    .from('ksa_amatan_jagung')
    .select('uploaded_at, uploaded_by_username')
    .not('uploaded_at', 'is', null) 
    .order('uploaded_at', { ascending: false }) 
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Error fetching last KSA Jagung update info:", error.message);
    return null;
  }
  return data;
}

export default async function KsaUpdatePage() {
    // Ambil data untuk kedua jenis KSA secara paralel
    const [lastPadiUpdate, lastJagungUpdate] = await Promise.all([
      getLastKsaPadiUpdateInfo(),
      getLastKsaJagungUpdateInfo()
    ]);

    // Render komponen client dan teruskan kedua data sebagai props
    return (
      <UpdateKsaClient 
        lastPadiUpdate={lastPadiUpdate}
        lastJagungUpdate={lastJagungUpdate}
      />
    );
}