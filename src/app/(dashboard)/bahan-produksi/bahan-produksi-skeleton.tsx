// src/app/(dashboard)/bahan-produksi/bahan-produksi-skeleton.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function BahanProduksiSkeleton() {
  return (
    <div className="flex flex-col gap-4 min-w-0">
      {/* 1️⃣ MateriPedomanCard Skeleton */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-8 rounded" />
              <div>
                <Skeleton className="h-6 sm:h-8 w-48 sm:w-80 rounded" />
                <Skeleton className="h-4 sm:h-5 w-56 sm:w-96 rounded mt-2" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="mx-auto">
              <Skeleton className="h-8 sm:h-10 w-40 sm:w-56 rounded" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2️⃣ Portal Bahan Produksi Skeleton */}
      <Card className="relative w-full overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-700 dark:from-purple-800 dark:to-indigo-900 shadow-2xl">
        <CardHeader className="text-white">
          <div className="flex justify-between items-start">
            <div>
              <Skeleton className="h-6 sm:h-8 w-48 sm:w-80 rounded-lg bg-white/20" />
              <Skeleton className="h-4 sm:h-5 w-40 sm:w-72 rounded-lg bg-white/20 mt-2" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Grid responsive untuk mobile-first */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="perspective-1000">
                  <div className="relative h-64 sm:h-72 lg:h-80 w-full">
                    <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center rounded-2xl p-4 sm:p-6 text-center shadow-lg bg-gradient-to-br from-white/20 to-white/10 dark:from-white/10 dark:to-white/5 border border-white/30 dark:border-white/20">
                      <Skeleton className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-white/20 mb-3 sm:mb-4" />
                      <Skeleton className="h-6 sm:h-8 w-24 sm:w-28 rounded bg-white/20" />
                      <Skeleton className="h-3 sm:h-4 w-28 sm:w-32 rounded bg-white/20 mt-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Navigation arrows - disembunyikan di mobile */}
            <div className="hidden sm:block">
              <Skeleton className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-md bg-white/10" />
              <Skeleton className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-md bg-white/10" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}