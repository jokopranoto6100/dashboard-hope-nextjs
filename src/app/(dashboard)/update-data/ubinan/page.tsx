// src/app/(dashboard)/update-data/ubinan/page.tsx (SETELAH DIPERBAIKI)

import { createSupabaseServerClientWithUserContext } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { UpdateUbinanClient } from "./update-ubinan-client"; // Ganti nama impor ke client baru

// Definisikan tipe untuk prop agar lebih aman
type UpdateInfo = { uploaded_at: string | null; uploaded_by_username: string | null; } | null;

export type LastUbinanUpdateData = {
  raw: UpdateInfo;
  master: UpdateInfo;
};

// Fungsi generik untuk mengambil informasi pembaruan terakhir dari tabel manapun
async function getLastUpdateInfo(tableName: 'ubinan_raw' | 'master_sampel_ubinan'): Promise<UpdateInfo> {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClientWithUserContext(cookieStore);

  const { data, error } = await supabase
    .from(tableName)
    .select('uploaded_at, uploaded_by_username')
    .not('uploaded_at', 'is', null) 
    .order('uploaded_at', { ascending: false }) 
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching last update info for ${tableName}:`, error.message);
    return null;
  }
  return data;
}

export default async function UpdateDataPage() {
  // Ambil riwayat pembaruan untuk kedua tabel secara paralel
  const [lastUpdateRaw, lastUpdateMaster] = await Promise.all([
    getLastUpdateInfo('ubinan_raw'),
    getLastUpdateInfo('master_sampel_ubinan')
  ]);

  const lastUpdateData: LastUbinanUpdateData = {
    raw: lastUpdateRaw,
    master: lastUpdateMaster,
  };

  // Langsung render Client Component dengan data yang sudah diambil
  return <UpdateUbinanClient lastUpdateData={lastUpdateData} />;
}