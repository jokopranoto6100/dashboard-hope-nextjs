"use client";

import { useState, useCallback, useMemo } from "react";
import { useBahanProduksiData } from "@/hooks/useBahanProduksiData";
import { BahanProduksiSkeleton } from "./bahan-produksi-skeleton";
import { motion, Variants } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Undo2 } from "lucide-react";
import { getIcon } from "@/lib/icon-map";
import { BahanProduksiLink, BahanProduksiSektor } from "@/lib/types";
import { ContentManagementDialog } from "./content-management-dialog";
import { useAuth } from "@/context/AuthContext";

// ✅ OPTIMIZED animation variants untuk smooth performance dan stable layout
const cardVariants: Variants = {
  front: { 
    rotateY: 0,
    transition: { 
      duration: 0.35, // ✅ Slightly faster for less layout shift time
      ease: [0.25, 0.1, 0.25, 1], // ✅ easeInOut cubic bezier for smoother animation
      // ✅ FIX 10: Prevent intermediate layout calculations
      transformOrigin: "center center"
    }
  },
  back: { 
    rotateY: 180,
    transition: { 
      duration: 0.35, // ✅ Consistent timing
      ease: [0.25, 0.1, 0.25, 1], // ✅ easeInOut cubic bezier
      transformOrigin: "center center"
    }
  }
};

const linkVariants: Variants = {
  hidden: { opacity: 0, y: 10 }, // ✅ Changed from x to y untuk less jarring
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { 
      delay: index * 0.05, // ✅ Reduced delay from 0.1 to 0.05
      duration: 0.2, // ✅ Reduced from 0.3
      ease: "easeOut"
    }
  })
};

// ✅ Memoized component untuk links section
const LinksSection = ({ links, isVisible }: { links: BahanProduksiLink[], isVisible: boolean }) => {
  // ✅ Precompute icons untuk menghindari re-computation
  const linksWithIcons = useMemo(() => 
    links.map(link => ({
      ...link,
      LinkIcon: getIcon(link.icon_name)
    })), [links]
  );

  if (!isVisible) return null;

  return (
    // ✅ FIX 7: Improve scrolling stability and prevent flickering
    <div className="h-full flex flex-col overflow-hidden">
      <div 
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent pr-1"
        style={{
          // ✅ FIX 8: Force scrollbar space to prevent layout shifts
          scrollbarGutter: "stable",
          // ✅ FIX 9: Smooth scrolling behavior
          scrollBehavior: "smooth"
        }}
      >
        <div className="flex flex-col gap-2 text-white">
          {/* ✅ OPTIMIZED: Removed AnimatePresence untuk mengurangi complexity */}
          {linksWithIcons.map((link, index) => (
            <motion.div
              key={link.id}
              variants={linkVariants}
              initial="hidden"
              animate="visible"
              custom={index}
            >
              {/* ✅ SIMPLE: Native <a> tag tanpa animasi berlebihan */}
              <a 
                href={link.href || '#'} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="group block"
                style={{
                  WebkitTapHighlightColor: 'rgba(0,0,0,0)',
                  outline: 'none'
                }}
              >
                <div className="flex items-center gap-3 rounded-md p-2 text-left transition-colors hover:bg-white/20 dark:hover:bg-white/10">
                  <link.LinkIcon className="h-5 w-5 flex-shrink-0 opacity-80"/>
                  <span className="text-sm font-medium truncate flex-1">{link.label}</span>
                  <ArrowUpRight className="ml-auto h-4 w-4 opacity-70 transition-opacity group-hover:opacity-100 flex-shrink-0"/>
                </div>
              </a>
            </motion.div>
          ))}
          {linksWithIcons.length === 0 && (
            <motion.p 
              className="text-sm text-center text-muted-foreground/80 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Belum ada link di sektor ini.
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
};

// ✅ Memoized card component
const SektorCard = ({ sektor, flippedCardId, onFlip, onReset }: {
  sektor: BahanProduksiSektor;
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
    // ✅ FIX 1: Add fixed height container to prevent layout shifts
    <div className="perspective-1000 h-80">
      <motion.div
        className="relative w-full h-full"
        style={{ 
          transformStyle: "preserve-3d",
          willChange: "transform", // ✅ GPU optimization hint
          // ✅ FIX 2: Force containment to prevent layout recalculation
          contain: "layout style paint"
        }}
        animate={isFlipped ? "back" : "front"}
        variants={cardVariants}
        layout={false}
        // ✅ FIX 3: Simplified transform to reduce GPU overhead
        transformTemplate={({ rotateY }) => `rotateY(${rotateY})`}
      >
        {/* --- SISI DEPAN KARTU --- */}
        <motion.div
          role="button"
          tabIndex={0}
          className="absolute inset-0 flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-2xl p-6 text-center shadow-lg bg-gradient-to-br from-white/20 to-white/10 dark:from-white/10 dark:to-white/5 border border-white/30 dark:border-white/20"
          style={{ 
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden", // ✅ Safari compatibility
            // ✅ FIX 4: Prevent any overflow issues
            overflow: "hidden"
          }}
          onClick={handleCardClick}
          onKeyDown={handleKeyDown}
        >
          <SektorIcon className="mb-4 h-20 w-20 text-white/90" />
          <h2 className="text-2xl font-bold text-white">{sektor.nama}</h2>
          <p className="mt-2 text-sm text-purple-200 dark:text-purple-300">Klik untuk lihat detail</p>
        </motion.div>

        {/* --- SISI BELAKANG KARTU --- */}
        <motion.div
          className="absolute inset-0 flex h-full w-full flex-col rounded-2xl p-4 shadow-lg bg-gradient-to-br from-white/20 to-white/10 dark:from-white/10 dark:to-white/5 border border-white/30 dark:border-white/20"
          style={{ 
            backfaceVisibility: "hidden", 
            WebkitBackfaceVisibility: "hidden", // ✅ Safari compatibility
            transform: "rotateY(180deg)",
            // ✅ FIX 5: Ensure back card doesn't cause overflow
            overflow: "hidden"
          }}
        >
          <div className="flex items-center justify-between border-b border-white/20 dark:border-white/10 pb-2 mb-2 text-white flex-shrink-0">
            <h3 className="font-bold truncate">{sektor.nama}</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full hover:bg-white/20 dark:hover:bg-white/15 flex-shrink-0" 
              onClick={onReset}
            >
              <Undo2 className="h-4 w-4"/>
              <span className="sr-only">Kembali</span>
            </Button>
          </div>

          {/* ✅ FIX 6: Fixed height for links container with stable scrolling */}
          <div className="flex-1 min-h-0">
            <LinksSection 
              links={sektor.links} 
              isVisible={isFlipped}
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export function BahanProduksiClient() {
  const { userRole } = useAuth(); // ✅ FIXED: Gunakan userRole dari AuthContext seperti halaman jadwal
  const { data: dataSektor, isLoading, error, refresh } = useBahanProduksiData();
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);

  // ✅ SIMPLIFIED: Tidak perlu useEffect untuk auth check, langsung gunakan userRole
  const isAdmin = userRole === 'super_admin';

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

  // ✅ Memoized carousel options dengan responsive snap behavior
  const carouselOptions = useMemo(() => {
    // Detect if mobile view (bisa juga pakai useMediaQuery hook kalau ada)
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    
    return {
      align: "start" as const,
      loop: (dataSektor?.length || 0) > 3,
      skipSnaps: false,
      dragFree: !isMobile, // Mobile: snap per card, Desktop: free drag
      containScroll: "trimSnaps" as const, // Trim snaps untuk clean edge behavior
      slidesToScroll: isMobile ? 1 : "auto" as const, // Mobile: 1 card per swipe
    };
  }, [dataSektor?.length]);

  if (isLoading) {
    return <BahanProduksiSkeleton />;
  }

  if (error) {
    return (
      <Card className="relative w-full overflow-hidden bg-red-500/20 dark:bg-red-900/30 shadow-2xl">
        <CardHeader className="text-red-700 dark:text-red-400">
          <CardTitle>Terjadi Kesalahan</CardTitle>
          <CardDescription className="text-red-600 dark:text-red-500">
            Tidak dapat memuat data bahan produksi. Coba lagi nanti.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
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
      <Card className="relative w-full overflow-hidden bg-gray-500/20 dark:bg-gray-700/30 shadow-2xl">
        <CardHeader>
          <CardTitle className="dark:text-gray-100">Tidak Ada Data</CardTitle>
          <CardDescription className="dark:text-gray-300">
            Belum ada sektor yang tersedia saat ini.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="relative w-full overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-700 dark:from-purple-800 dark:to-indigo-900 shadow-2xl">
      <CardHeader className="text-white">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">Portal Bahan Fungsi Produksi</CardTitle>
            <CardDescription className="text-purple-200 dark:text-purple-300">
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
        {/* ✅ FIX 11: Add stable container to prevent layout shifts during carousel animation */}
        <div 
          className="w-full" 
          style={{
            // ✅ FIX 12: Force containment to prevent layout recalculation in parent
            contain: "layout style",
            // ✅ FIX 13: Ensure stable height
            minHeight: "320px" // 80*4 (card height)
          }}
        >
          <Carousel opts={carouselOptions} className="w-full">
            <CarouselContent className="-ml-4">
              {dataSektor.map((sektor) => (
                <CarouselItem 
                  key={sektor.id} 
                  className="pl-4 basis-full sm:basis-1/1 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
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
            
            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 dark:bg-white/5 dark:hover:bg-white/15 border-white/20 dark:border-white/10" />
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-white/10 hover:bg-white/20 dark:bg-white/5 dark:hover:bg-white/15 border-white/20 dark:border-white/10" />
          </Carousel>
        </div>
      </CardContent>
    </Card>
  );
}