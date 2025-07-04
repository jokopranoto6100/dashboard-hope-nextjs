import { cookies } from "next/headers";
import { createServerComponentSupabaseClient } from "@/lib/supabase";
import { supabaseServer } from "@/lib/supabase-server";
import { MateriPedomanCard } from "./materi-pedoman-card";
import { BahanProduksiClient } from "./bahan-produksi-client";

export interface LinkItem {
  id: string;
  label: string;
  href: string | null;
  icon_name: string | null;
  description: string | null;
  urutan: number;
  sektor_id?: string; // ✅ TAMBAHKAN: Optional untuk compatibility
}
export interface SektorItem {
  id: string;
  nama: string;
  icon_name: string | null;
  bg_color_class: string | null;
  urutan: number;
  links: LinkItem[];
}

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

export default async function BahanProduksiPage() {
  const [materiPedomanLink, cookieStore] = await Promise.all([
    getMateriPedomanLink(),
    cookies()
  ]);

  const supabase = createServerComponentSupabaseClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
    isAdmin = profile?.role === 'super_admin';
  }

  return (
    <div className="flex flex-col gap-4 min-w-0">
      <MateriPedomanCard initialHref={materiPedomanLink} isAdmin={isAdmin} />
      <BahanProduksiClient isAdmin={isAdmin} />
    </div>
  );
}