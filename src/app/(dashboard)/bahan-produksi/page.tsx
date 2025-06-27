// src/app/(dashboard)/bahan-produksi/page.tsx
import { Suspense } from 'react';
import { supabaseServer } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { createServerComponentSupabaseClient } from "@/lib/supabase";

// Impor komponen-komponen yang relevan
import { MateriPedomanCard } from "./materi-pedoman-card";
import { PortalProduksi } from './portal-produksi';
import { BahanProduksiSkeleton } from './bahan-produksi-skeleton';

// Definisi tipe data bisa tetap di sini agar komponen lain bisa mengimpornya
export interface LinkItem {
  id: string;
  label: string;
  href: string | null;
  icon_name: string | null;
  description: string | null;
  urutan: number;
}
export interface SektorItem {
  id: string;
  nama: string;
  icon_name: string | null;
  bg_color_class: string | null;
  urutan: number;
  links: LinkItem[];
}

// Hanya fungsi fetching yang CEPAT yang tersisa di sini
async function getMateriPedomanLink(): Promise<string> {
    const { data, error } = await supabaseServer
        .from('app_settings')
        .select('value')
        .eq('key', 'materi_pedoman_link')
        .single();

    if (error || !data) {
        if (error) console.error("Gagal mengambil link pedoman, menggunakan default.", error);
        return '#';
    }
    return data.value || '#';
}


// Komponen Halaman Utama yang sudah di-patch
export default async function BahanProduksiPage() {
  // Halaman ini sekarang hanya mengambil data yang cepat,
  // sehingga bisa langsung dirender oleh server.
  const [materiPedomanLink, cookieStore] = await Promise.all([
    getMateriPedomanLink(),
    cookies()
  ]);

  // Logika pengecekan admin tidak berubah
  const supabase = createServerComponentSupabaseClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    isAdmin = profile?.role === 'super_admin';
  }

  return (
    <div className="flex flex-col gap-4 min-w-0">
      {/* Kartu ini akan langsung muncul karena datanya cepat didapat */}
      <MateriPedomanCard initialHref={materiPedomanLink} isAdmin={isAdmin} />
      
      {/* Komponen Portal Bahan Fungsi Produksi */}
      <div>
        <Suspense fallback={<BahanProduksiSkeleton />}>
          {/* Next.js akan langsung merender fallback (skeleton).
            Sementara itu, di server, komponen `PortalProduksi` mulai mengambil data.
            Setelah datanya siap, hasilnya akan di-stream ke browser
            dan menggantikan skeleton secara otomatis.
          */}
          <PortalProduksi isAdmin={isAdmin} />
        </Suspense>
      </div>
    </div>
  );
}