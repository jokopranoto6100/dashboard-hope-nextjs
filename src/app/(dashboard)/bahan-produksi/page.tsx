// src/app/(dashboard)/bahan-produksi/page.tsx
import { BahanProduksiClient } from "./bahan-produksi-client";
import { supabaseServer } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { createServerComponentSupabaseClient } from "@/lib/supabase";
// BARU: Impor komponen kartu yang baru dibuat
import { MateriPedomanCard } from "./materi-pedoman-card";

// Tipe data untuk komponen BahanProduksiClient
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

// Fungsi untuk mengambil data sektor dan link-linknya
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

// Fungsi untuk mengambil link Materi & Pedoman dari database
async function getMateriPedomanLink(): Promise<string> {
    const { data, error } = await supabaseServer
        .from('app_settings')
        .select('value')
        .eq('key', 'materi_pedoman_link')
        .single();

    if (error || !data) {
        // Log error jika ada, tapi jangan hentikan render halaman
        if (error) console.error("Gagal mengambil link pedoman, menggunakan default.", error);
        return '#'; // Fallback ke link default jika tidak ditemukan atau error
    }
    return data.value || '#';
}


// Komponen Halaman Utama
export default async function BahanProduksiPage() {
  // Ambil semua data yang diperlukan secara paralel untuk performa lebih baik
  const [sektorData, materiPedomanLink, cookieStore] = await Promise.all([
    getSektorData(),
    getMateriPedomanLink(),
    cookies()
  ]);

  // Cek peran pengguna untuk menampilkan tombol manajemen
  const supabase = createServerComponentSupabaseClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    isAdmin = profile?.role === 'super_admin';
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      {/* Kartu Materi dan Pedoman Survei (sekarang komponen dinamis) */}
      <MateriPedomanCard initialHref={materiPedomanLink} isAdmin={isAdmin} />
      
      {/* Komponen Portal Bahan Fungsi Produksi */}
      <div>
        <BahanProduksiClient initialData={sektorData} isAdmin={isAdmin} />
      </div>
    </div>
  );
}