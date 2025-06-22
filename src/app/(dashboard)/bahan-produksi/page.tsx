// src/app/(dashboard)/bahan-produksi/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookMarked } from "lucide-react";
import Link from "next/link";
import { BahanProduksiClient } from "./bahan-produksi-client";
import { supabaseServer } from "@/lib/supabase-server";
import { cookies } from "next/headers";
import { createServerComponentSupabaseClient } from "@/lib/supabase";

// Tipe data yang akan kita teruskan ke komponen klien
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
  urutan: number; // <-- PERBAIKAN: Properti 'urutan' ditambahkan di sini
  links: LinkItem[];
}

// Fungsi untuk mengambil data dari database
async function getSektorData(): Promise<SektorItem[]> {
    const { data: sektors, error: sektorError } = await supabaseServer
        .from('sektors')
        .select('*')
        .order('urutan', { ascending: true });

    if (sektorError) {
        console.error("Error fetching sectors:", sektorError);
        return [];
    }
    
    const { data: links, error: linkError } = await supabaseServer
        .from('links')
        .select('*')
        .order('urutan', { ascending: true });

    if (linkError) {
        console.error("Error fetching links:", linkError);
        // Tetap kembalikan sektor meskipun link gagal
        return sektors.map(s => ({ ...s, links: [] }));
    }

    // Gabungkan link ke dalam sektornya masing-masing
    const dataTergabung = sektors.map(sektor => ({
        ...sektor,
        links: links.filter(link => link.sektor_id === sektor.id)
    }));
    
    return dataTergabung;
}

export default async function BahanProduksiPage() {
  const sektorData = await getSektorData();

  // Cek peran pengguna untuk menampilkan tombol manajemen
  const cookieStore = cookies();
  const supabase = createServerComponentSupabaseClient(await cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    isAdmin = profile?.role === 'super_admin';
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-4">
            <BookMarked className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">Materi dan Pedoman Survei</CardTitle>
              <CardDescription>
                Pusat dokumentasi untuk semua materi, buku pedoman, dan panduan pelaksanaan survei.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Temukan semua dokumen yang Anda butuhkan untuk memastikan pelaksanaan survei berjalan
            sesuai dengan standar dan metodologi yang telah ditetapkan.
          </p>
          <Button asChild>
            <Link href="#">
              Lihat Semua Dokumen <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
      
      <div>
        {/* Teruskan data dinamis dan status admin ke komponen klien */}
        <BahanProduksiClient initialData={sektorData} isAdmin={isAdmin} />
      </div>
    </div>
  );
}