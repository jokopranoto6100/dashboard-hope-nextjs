// src/app/(dashboard)/bahan-produksi/portal-produksi.tsx
import { BahanProduksiClient } from "./bahan-produksi-client";
import { supabaseServer } from "@/lib/supabase-server";
import type { SektorItem } from "./page";

// Fungsi fetching yang lambat dipindahkan ke sini
async function getSektorData(): Promise<SektorItem[]> {
    const { data, error } = await supabaseServer
        .from('sektors')
        .select('*, links(*)')
        .order('urutan', { ascending: true })
        .order('urutan', { foreignTable: 'links', ascending: true });

    if (error) {
        console.error("Error fetching sectors with links:", error);
        return [];
    }
    
    return data as SektorItem[];
}

// Komponen Asinkron yang akan mengambil data
// Komponen ini yang akan "ditunggu" oleh <Suspense>
export async function PortalProduksi({ isAdmin }: { isAdmin: boolean }) {
  // Data yang lambat diambil di sini
  const sektorData = await getSektorData();

  // Setelah data siap, render komponen client dengan data tersebut
  return <BahanProduksiClient initialData={sektorData} isAdmin={isAdmin} />;
}