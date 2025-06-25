// src/app/(dashboard)/evaluasi/ubinan/page.tsx
import { UbinanEvaluasiFilterProvider } from '@/context/UbinanEvaluasiFilterContext'; 
import { EvaluasiUbinanClient } from './evaluasi-ubinan-client'; 
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton'; 

export default function EvaluasiUbinanPage() {
  return (
    <UbinanEvaluasiFilterProvider>
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