// Lokasi: src/app/(dashboard)/produksi-statistik/page.tsx

import { createSupabaseServerClientWithUserContext } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { StatistikClient } from "./statistik-client";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Fungsi untuk mengambil daftar indikator dari master tabel
async function getAvailableIndicators() {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerClientWithUserContext(cookieStore);

  const { data, error } = await supabase
    .from('master_indikator_atap')
    .select('id, nama_resmi')
    .order('nama_resmi', { ascending: true });

  if (error) {
    console.error("Error fetching indicators:", error);
    return [];
  }
  return data;
}

export default async function ProduksiStatistikPage() {
  const indicators = await getAvailableIndicators();

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl">Analisis Statistik Produksi ATAP</CardTitle>
                <CardDescription>
                    Visualisasikan dan bandingkan data produksi dari berbagai level dan periode waktu. Gunakan filter di bawah untuk menyesuaikan data yang ditampilkan.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Me-render Client Component dan memberikan daftar indikator sebagai prop */}
                <StatistikClient availableIndicators={indicators} />
            </CardContent>
        </Card>
    </div>
  );
}