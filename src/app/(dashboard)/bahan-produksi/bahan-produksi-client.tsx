"use client";

import { useState } from "react";
import { dataSektor } from "./config";
import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Undo2 } from "lucide-react";
import Link from "next/link";

export function BahanProduksiClient() {
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);

  return (
    // 1. Carousel kini dibungkus di dalam sebuah Card dengan tema ungu
    <Card className="relative w-full overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-700 shadow-2xl">
      <CardHeader className="text-white">
        <CardTitle className="text-2xl">Portal Bahan Fungsi Produksi</CardTitle>
        <CardDescription className="text-purple-200">
          Pilih subsektor untuk melihat file-file terkait.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {dataSektor.map((sektor) => (
              <CarouselItem key={sektor.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="perspective-1000">
                  <motion.div
                    className="relative h-80 w-full"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateY: flippedCardId === sektor.id ? 180 : 0 }}
                    transition={{ duration: 0.7, ease: "easeInOut" }}
                  >
                    {/* SISI DEPAN KARTU */}
                    <div
                      className="absolute inset-0 flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-2xl p-6 text-center shadow-lg bg-white/10 backdrop-blur-sm border border-white/20"
                      style={{ backfaceVisibility: "hidden" }}
                      onClick={() => setFlippedCardId(sektor.id)}
                    >
                      <sektor.Icon className="mb-4 h-20 w-20 text-white/90" />
                      <h2 className="text-2xl font-bold text-white">{sektor.nama}</h2>
                      <p className="mt-2 text-sm text-purple-200">Klik untuk lihat detail</p>
                    </div>

                    {/* SISI BELAKANG KARTU */}
                    <div
                      className="absolute inset-0 flex h-full w-full flex-col rounded-2xl p-4 shadow-lg bg-white/10 backdrop-blur-sm border border-white/20"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      <div className="flex items-center justify-between border-b border-white/20 pb-2 mb-2 text-white">
                          <h3 className="font-bold">{sektor.nama}</h3>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-white/20" onClick={() => setFlippedCardId(null)}>
                              <Undo2 className="h-4 w-4"/>
                              <span className="sr-only">Kembali</span>
                          </Button>
                      </div>

                      <div className="flex flex-col gap-2 overflow-y-auto pr-1 text-white">
                          {sektor.links.map(link => (
                             <Link key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="group block">
                                 <div className="flex items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-white/20">
                                      <link.Icon className="h-5 w-5 flex-shrink-0 opacity-80"/>
                                      <span className="text-sm font-medium">{link.label}</span>
                                      <ArrowUpRight className="ml-auto h-4 w-4 opacity-70 transition-opacity group-hover:opacity-100"/>
                                 </div>
                             </Link>
                          ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* 2. Tombol Navigasi kini berada di dalam Card, posisinya pasti pas */}
          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 border-white/20" />
          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 border-white/20" />
        </Carousel>
      </CardContent>
    </Card>
  );
}