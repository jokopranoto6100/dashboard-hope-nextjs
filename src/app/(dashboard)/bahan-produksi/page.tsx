"use client";

import { MateriPedomanCard } from "./materi-pedoman-card";
import { BahanProduksiClient } from "./bahan-produksi-client";

// ✅ REMOVED: Server-side configuration karena sekarang full client-side

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

export default function BahanProduksiPage() {
  // ✅ SIMPLIFIED: Langsung gunakan versi full dengan animasi
  return (
    <div className="flex flex-col gap-4 min-w-0">
      <MateriPedomanCard />
      <BahanProduksiClient />
    </div>
  );
}