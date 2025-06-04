// src/app/(dashboard)/evaluasi/ubinan/page.tsx
import { UbinanEvaluasiFilterProvider } from '@/context/UbinanEvaluasiFilterContext'; // Pastikan path ini benar
import { EvaluasiUbinanClient } from './evaluasi-ubinan-client'; // Komponen klien yang baru kita buat
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton'; // Untuk fallback suspense jika diperlukan

// Anda bisa menambahkan metadata untuk halaman di sini jika diperlukan
// export const metadata = {
//   title: 'Evaluasi Statistik Ubinan - Dashboard HOPE',
// };

export default function EvaluasiUbinanPage() {
  return (
    <UbinanEvaluasiFilterProvider>
      {/* Suspense dapat digunakan di sini jika EvaluasiUbinanClient melakukan data fetching awal
        atau memiliki bagian yang bisa di-lazy load. Untuk kasus kita, loading utama
        ditangani di dalam client component, jadi Suspense di sini lebih untuk best practice
        jika komponen client menjadi lebih kompleks atau melakukan fetch awal.
      */}
      <Suspense fallback={<PageSkeleton />}>
        <EvaluasiUbinanClient />
      </Suspense>
    </UbinanEvaluasiFilterProvider>
  );
}

// Komponen skeleton sederhana untuk fallback Suspense
const PageSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2 pt-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
};