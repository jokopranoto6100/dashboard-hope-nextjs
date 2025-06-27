// src/app/(dashboard)/bahan-produksi/bahan-produksi-skeleton.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function BahanProduksiSkeleton() {
  return (
    <Card className="relative w-full overflow-hidden bg-gradient-to-br from-purple-600/80 to-indigo-700/80 shadow-2xl">
      <CardHeader>
        {/* Skeleton untuk judul dan deskripsi kartu */}
        <Skeleton className="h-8 w-1/2 rounded-lg bg-white/20" />
        <Skeleton className="h-5 w-2/5 rounded-lg bg-white/20 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="relative mx-auto">
          {/* Wrapper untuk item carousel skeleton */}
          <div className="flex -ml-4">
            {/* Tampilkan 3 kartu skeleton sebagai placeholder di dalam carousel */}
            {[...Array(4)].map((_, i) => (
              <div key={i} className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <div className="p-1">
                  <Skeleton className="h-80 w-full rounded-2xl bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}