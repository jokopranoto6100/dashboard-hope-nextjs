// src/app/(dashboard)/evaluasi/ubinan/scatter-plot/layout.tsx
import { UbinanEvaluasiFilterProvider } from '@/context/UbinanEvaluasiFilterContext';

export default function ScatterPlotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UbinanEvaluasiFilterProvider>
      {children}
    </UbinanEvaluasiFilterProvider>
  );
}
