// Lokasi: src/app/(dashboard)/produksi-statistik/page.tsx (SETELAH DIPERBAIKI)

import { createSupabaseServerClientWithUserContext } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { StatistikClient } from "./statistik-client";

// Fungsi untuk mengambil data (tidak ada perubahan, sudah benar)
async function getAvailableIndicators() {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClientWithUserContext(cookieStore);

  const { data, error } = await supabase
    .from('master_indikator_atap')
    .select('id, nama_resmi, satuan_default')
    .order('id', { ascending: true }); 

  if (error) {
    console.error("Error fetching indicators:", error);
    return [];
  }
  return data;
}

export default async function ProduksiStatistikPage() {
  // 1. Ambil data di Server Component
  const indicators = await getAvailableIndicators();

  // 2. Langsung render Client Component dan oper data sebagai props.
  //    Tidak ada div, Card, atau padding tambahan di sini.
  return <StatistikClient availableIndicators={indicators} />;
}