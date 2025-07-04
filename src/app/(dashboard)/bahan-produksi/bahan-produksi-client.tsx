"use client";

import { useState, useCallback, useMemo } from "react";
import { useBahanProduksiData } from "@/hooks/useBahanProduksiData";
import { BahanProduksiSkeleton } from "./bahan-produksi-skeleton";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Undo2 } from "lucide-react";
import Link from "next/link";
import { getIcon } from "@/lib/icon-map";
import { ContentManagementDialog } from "./content-management-dialog";

interface BahanProduksiClientProps {
  isAdmin: boolean;
}

// ✅ Pre-defined animation variants untuk performance
const cardVariants: Variants = {
  front: { 
    rotateY: 0,
    transition: { duration: 0.6, ease: "easeInOut" }
  },
  back: { 
    rotateY: 180,
    transition: { duration: 0.6, ease: "easeInOut" }
  }
};

const linkVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: (index: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: index * 0.1, duration: 0.3 }
  })
};

// ✅ Memoized component untuk links section
const LinksSection = ({ links, isVisible }: { links: any[], isVisible: boolean }) => {
  // ✅ Precompute icons untuk menghindari re-computation
  const linksWithIcons = useMemo(() => 
    links.map(link => ({
      ...link,
      LinkIcon: getIcon(link.icon_name)
    })), [links]
  );

  if (!isVisible) return null;

  return (
    <div className="flex flex-col gap-2 overflow-y-auto pr-1 text-white scrollbar-thin scrollbar-thumb-white/20">
      <AnimatePresence mode="wait">
        {linksWithIcons.map((link, index) => (
          <motion.div
            key={link.id}
            variants={linkVariants}
            initial="hidden"
            animate="visible"
            custom={index}
            exit="hidden"
          >
            <Link 
              href={link.href || '#'} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group block"
            >
              <div className="flex items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-white/20">
                <link.LinkIcon className="h-5 w-5 flex-shrink-0 opacity-80"/>
                <span className="text-sm font-medium">{link.label}</span>
                <ArrowUpRight className="ml-auto h-4 w-4 opacity-70 transition-opacity group-hover:opacity-100"/>
              </div>
            </Link>
          </motion.div>
        ))}
      </AnimatePresence>
      {linksWithIcons.length === 0 && (
        <motion.p 
          className="text-sm text-center text-muted-foreground/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Belum ada link di sektor ini.
        </motion.p>
      )}
    </div>
  );
};

// ✅ Memoized card component
const SektorCard = ({ sektor, flippedCardId, onFlip, onReset }: {
  sektor: any;
  flippedCardId: string | null;
  onFlip: (id: string) => void;
  onReset: () => void;
}) => {
  const SektorIcon = useMemo(() => getIcon(sektor.icon_name), [sektor.icon_name]);
  const isFlipped = flippedCardId === sektor.id;

  const handleCardClick = useCallback(() => {
    onFlip(sektor.id);
  }, [sektor.id, onFlip]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onFlip(sektor.id);
    }
  }, [sektor.id, onFlip]);

  return (
    <div className="perspective-1000">
      <motion.div
        className="relative h-80 w-full hardware-accelerated"
        style={{ transformStyle: "preserve-3d" }}
        animate={isFlipped ? "back" : "front"}
        variants={cardVariants} // ✅ Sekarang sudah type-safe
        layout={false}
      >
        {/* --- SISI DEPAN KARTU --- */}
        <motion.div
          role="button"
          tabIndex={0}
          className="absolute inset-0 flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-2xl p-6 text-center shadow-lg bg-white/10 backdrop-blur-sm border border-white/20 hardware-accelerated"
          style={{ backfaceVisibility: "hidden" }}
          onClick={handleCardClick}
          onKeyDown={handleKeyDown}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <SektorIcon className="mb-4 h-20 w-20 text-white/90" />
          <h2 className="text-2xl font-bold text-white">{sektor.nama}</h2>
          <p className="mt-2 text-sm text-purple-200">Klik untuk lihat detail</p>
        </motion.div>

        {/* --- SISI BELAKANG KARTU --- */}
        <motion.div
          className="absolute inset-0 flex h-full w-full flex-col rounded-2xl p-4 shadow-lg bg-white/10 backdrop-blur-sm border border-white/20 hardware-accelerated"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="flex items-center justify-between border-b border-white/20 pb-2 mb-2 text-white">
            <h3 className="font-bold">{sektor.nama}</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full hover:bg-white/20" 
              onClick={onReset}
            >
              <Undo2 className="h-4 w-4"/>
              <span className="sr-only">Kembali</span>
            </Button>
          </div>

          <LinksSection 
            links={sektor.links} 
            isVisible={isFlipped}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export function BahanProduksiClient({ isAdmin }: BahanProduksiClientProps) {
  const { data: dataSektor, isLoading, error, refresh } = useBahanProduksiData(); // ✅ Add refresh
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);

  // ✅ Handler untuk refresh data dari dialog
  const handleDataChange = useCallback(() => {
    refresh();
  }, [refresh]);

  // ✅ Memoized event handlers
  const handleCardFlip = useCallback((sektorId: string) => {
    setFlippedCardId(sektorId);
  }, []);

  const handleCardReset = useCallback(() => {
    setFlippedCardId(null);
  }, []);

  // ✅ Memoized carousel options
  const carouselOptions = useMemo(() => ({
    align: "start" as const,
    loop: (dataSektor?.length || 0) > 3,
    skipSnaps: false,
    dragFree: true
  }), [dataSektor?.length]);

  if (isLoading) {
    return <BahanProduksiSkeleton />;
  }

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
          <Button 
            variant="outline" 
            onClick={() => refresh()} // ✅ Gunakan refresh function
            className="mt-4"
          >
            Coba Lagi
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!dataSektor || dataSektor.length === 0) {
    return (
      <Card className="relative w-full overflow-hidden bg-gray-500/20 shadow-2xl">
        <CardHeader>
          <CardTitle>Tidak Ada Data</CardTitle>
          <CardDescription>
            Belum ada sektor yang tersedia saat ini.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

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
            <ContentManagementDialog 
              initialData={dataSektor} 
              onDataChange={handleDataChange} // ✅ Pass refresh callback
            />
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Carousel opts={carouselOptions} className="w-full">
          <CarouselContent className="-ml-4">
            {dataSektor.map((sektor) => (
              <CarouselItem 
                key={sektor.id} 
                className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
              >
                <SektorCard
                  sektor={sektor}
                  flippedCardId={flippedCardId}
                  onFlip={handleCardFlip}
                  onReset={handleCardReset}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          
          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 border-white/20" />
          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 border-white/20" />
        </Carousel>
      </CardContent>
    </Card>
  );
}