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
              <Skeleton className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700" />
              <div>
                <Skeleton className="h-8 w-80 rounded bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-5 w-96 rounded bg-gray-200 dark:bg-gray-700 mt-2" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="mx-auto">
              <Skeleton className="h-10 w-56 rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2️⃣ Portal Bahan Produksi Skeleton */}
      <Card className="relative w-full overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-700 dark:from-purple-800 dark:to-indigo-900 shadow-2xl">
        <CardHeader className="text-white">
          <div className="flex justify-between items-start">
            <div>
              <Skeleton className="h-8 w-80 rounded-lg bg-white/20" />
              <Skeleton className="h-5 w-72 rounded-lg bg-white/20 mt-2" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative mx-auto">
            <div className="flex -ml-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <div className="perspective-1000">
                    <div className="relative h-80 w-full">
                      <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center rounded-2xl p-6 text-center shadow-lg bg-gradient-to-br from-white/20 to-white/10 dark:from-white/10 dark:to-white/5 border border-white/30 dark:border-white/20">
                        <Skeleton className="h-20 w-20 rounded-full bg-white/20 mb-4" />
                        <Skeleton className="h-8 w-28 rounded bg-white/20" />
                        <Skeleton className="h-4 w-32 rounded bg-white/20 mt-2" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Skeleton className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-md bg-white/10" />
            <Skeleton className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-md bg-white/10" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}