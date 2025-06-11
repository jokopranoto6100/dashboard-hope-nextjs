// Lokasi: src/app/(dashboard)/evaluasi/ksa/MonthlyHarvestDisplay.tsx
"use client";

import { cn } from "@/lib/utils"; // Impor utilitas cn dari shadcn

interface MonthlyHarvestDisplayProps {
  harvestMonths: number[]; // Array berisi nomor bulan, cth: [1, 3, 8]
}

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export function MonthlyHarvestDisplay({ harvestMonths }: MonthlyHarvestDisplayProps) {
  return (
    <div className="flex gap-1">
      {MONTHS.map((month, index) => {
        const monthNumber = index + 1;
        const hasHarvest = harvestMonths.includes(monthNumber);

        return (
          <div
            key={monthNumber}
            title={`${hasHarvest ? 'Panen' : 'Tidak Panen'} pada bulan ke-${monthNumber}`}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-sm border text-xs font-mono",
              hasHarvest
                ? "bg-emerald-500 text-white border-emerald-600"
                : "bg-muted text-muted-foreground"
            )}
          >
            {month}
          </div>
        );
      })}
    </div>
  );
}
