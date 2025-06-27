// src/app/(dashboard)/bahan-produksi/bahan-produksi-client.tsx
"use client";

import { useState } from "react";
// Impor hook yang baru kita buat
import { useBahanProduksiData } from "@/hooks/useBahanProduksiData"; 
// Impor skeleton yang sudah ada untuk dipakai lagi
import { BahanProduksiSkeleton } from "./bahan-produksi-skeleton"; 
import { motion } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Undo2 } from "lucide-react";
import Link from "next/link";
import { getIcon } from "@/lib/icon-map";
import { ContentManagementDialog } from "./content-management-dialog";

interface BahanProduksiClientProps {
  // initialData dihapus dari props, karena data diambil di sini
  isAdmin: boolean;
}

export function BahanProduksiClient({ isAdmin }: BahanProduksiClientProps) {
  // Gunakan hook untuk mengambil data
  const { data: dataSektor, isLoading, error } = useBahanProduksiData();

  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);
  
  // Jika sedang loading, tampilkan skeleton
  if (isLoading) {
    return <BahanProduksiSkeleton />;
  }

  // Jika ada error, tampilkan pesan error
  if (error) {
    return (
      <Card className="relative w-full overflow-hidden bg-red-500/20 shadow-2xl">
        <CardHeader className="text-red-700">
          <CardTitle>Terjadi Kesalahan</CardTitle>
          <CardDescription className="text-red-600">
            Tidak dapat memuat data bahan produksi. Coba lagi nanti.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-700">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // Jika data berhasil dimuat, tampilkan konten utama
  return (
    <Card className="relative w-full overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-700 shadow-2xl">
      <CardHeader className="text-white">
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-2xl">Portal Bahan Fungsi Produksi</CardTitle>
                <CardDescription className="text-purple-200">
                    Pilih subsektor untuk melihat file-file terkait.
                </CardDescription>
            </div>
            {isAdmin && (
                // ContentManagementDialog butuh data untuk di-manage
                <ContentManagementDialog initialData={dataSektor} />
            )}
        </div>
      </CardHeader>

      <CardContent>
      <Carousel opts={{ align: "start", loop: dataSektor.length > 3 }} className="w-full">
        <CarouselContent className="-ml-4">
            {dataSektor.map((sektor) => {
              const SektorIcon = getIcon(sektor.icon_name);
              return (
                <CarouselItem key={sektor.id} className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  {/* ... sisa kode kartu (motion.div, etc) tidak berubah ... */}
                  <div className="perspective-1000">
                    <motion.div
                      className="relative h-80 w-full"
                      style={{ transformStyle: "preserve-3d" }}
                      animate={{ rotateY: flippedCardId === sektor.id ? 180 : 0 }}
                      transition={{ duration: 0.7, ease: "easeInOut" }}
                    >
                      {/* --- SISI DEPAN KARTU --- */}
                      <div
                        role="button"
                        tabIndex={0}
                        className="absolute inset-0 flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-2xl p-6 text-center shadow-lg bg-white/10 backdrop-blur-sm border border-white/20"
                        style={{ backfaceVisibility: "hidden" }}
                        onClick={() => setFlippedCardId(sektor.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setFlippedCardId(sektor.id);
                          }
                        }}
                      >
                        <SektorIcon className="mb-4 h-20 w-20 text-white/90" />
                        <h2 className="text-2xl font-bold text-white">{sektor.nama}</h2>
                        <p className="mt-2 text-sm text-purple-200">Klik untuk lihat detail</p>
                      </div>
                      {/* --- SISI BELAKANG KARTU --- */}
                      <div
                        className="absolute inset-0 flex h-full w-full flex-col rounded-2xl p-4 shadow-lg bg-white/10 backdrop-blur-sm border border-white/20"
                        style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                      >
                        <div className="flex items-center justify-between border-b border-white/20 pb-2 mb-2 text-white">
                            <h3 className="font-bold">{sektor.nama}</h3>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white/20" onClick={() => setFlippedCardId(null)}>
                                <Undo2 className="h-4 w-4"/>
                                <span className="sr-only">Kembali</span>
                            </Button>
                        </div>
                        <div className="flex flex-col gap-2 overflow-y-auto pr-1 text-white">
                            {sektor.links.map(link => {
                              const LinkIcon = getIcon(link.icon_name);
                              return (
                               <Link key={link.id} href={link.href || '#'} target="_blank" rel="noopener noreferrer" className="group block">
                                   <div className="flex items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-white/20">
                                        <LinkIcon className="h-5 w-5 flex-shrink-0 opacity-80"/>
                                        <span className="text-sm font-medium">{link.label}</span>
                                        <ArrowUpRight className="ml-auto h-4 w-4 opacity-70 transition-opacity group-hover:opacity-100"/>
                                   </div>
                               </Link>
                            )})}
                             {sektor.links.length === 0 && <p className="text-sm text-center text-muted-foreground/80">Belum ada link di sektor ini.</p>}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </CarouselItem>
              )})}
          </CarouselContent>
          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 border-white/20" />
          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 border-white/20" />
        </Carousel>
      </CardContent>
    </Card>
  );
}