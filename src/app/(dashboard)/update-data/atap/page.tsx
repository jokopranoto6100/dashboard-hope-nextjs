// Lokasi File: src/app/(dashboard)/update-data/atap/page.tsx (SETELAH DIPERBAIKI)

import { createSupabaseServerClientWithUserContext } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { UpdateAtapClient } from "./update-atap-client"; // Impor komponen client baru

// Tipe untuk nama tabel yang valid
type AtapTableName = 
  | 'data_atap_bulanan_kab' 
  | 'data_atap_tahunan_kab' 
  | 'data_atap_bulanan_prov' 
  | 'data_atap_tahunan_prov';

// Tipe untuk data yang akan dilempar ke client component
export type LastUpdateData = {
  bulananKab: { uploaded_at: string; uploaded_by_username: string | null } | null;
  tahunanKab: { uploaded_at: string; uploaded_by_username: string | null } | null;
  bulananProv: { uploaded_at: string; uploaded_by_username: string | null } | null;
  tahunanProv: { uploaded_at: string; uploaded_by_username: string | null } | null;
};

// Fungsi generik untuk mengambil riwayat pembaruan terakhir
async function getLastUpdateInfo(tableName: AtapTableName) {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClientWithUserContext(cookieStore);

  const { data, error } = await supabase
    .from(tableName)
    .select('uploaded_at, uploaded_by_username')
    .not('uploaded_at', 'is', null)
    .order('uploaded_at', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(`Error fetching last update info for ${tableName}:`, error.message);
    return null;
  }
  return data;
}

export default async function UpdateAtapPage() {
  // Ambil semua riwayat pembaruan secara paralel untuk efisiensi
  const [lastUpdateBulananKab, lastUpdateTahunanKab, lastUpdateBulananProv, lastUpdateTahunanProv] = await Promise.all([
    getLastUpdateInfo('data_atap_bulanan_kab'),
    getLastUpdateInfo('data_atap_tahunan_kab'),
    getLastUpdateInfo('data_atap_bulanan_prov'),
    getLastUpdateInfo('data_atap_tahunan_prov')
  ]);
  
  const lastUpdateData: LastUpdateData = {
    bulananKab: lastUpdateBulananKab,
    tahunanKab: lastUpdateTahunanKab,
    bulananProv: lastUpdateBulananProv,
    tahunanProv: lastUpdateTahunanProv,
  };

  // Render Client Component dan teruskan semua data riwayat sebagai satu prop
  return <UpdateAtapClient lastUpdateData={lastUpdateData} />;
}