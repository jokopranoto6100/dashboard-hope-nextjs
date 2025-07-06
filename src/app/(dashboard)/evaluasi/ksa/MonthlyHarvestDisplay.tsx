// Lokasi: src/app/(dashboard)/evaluasi/ksa/MonthlyHarvestDisplay.tsx
"use client";

import { cn } from "@/lib/utils";

interface MonthlyHarvestDisplayProps {
  harvestMonths: number[];
}

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export function MonthlyHarvestDisplay({ harvestMonths }: MonthlyHarvestDisplayProps) {
  return (
    <div className="flex flex-nowrap gap-0.5 md:gap-1 overflow-x-auto">
      {MONTHS.map((month, index) => {
        const monthNumber = index + 1;
        const hasHarvest = harvestMonths.includes(monthNumber);

        return (
          <div
            key={monthNumber}
            title={`${hasHarvest ? 'Panen' : 'Tidak Panen'} pada bulan ke-${monthNumber}`}
            className={cn(
              "flex h-5 w-5 md:h-6 md:w-6 items-center justify-center rounded-sm border text-[10px] md:text-xs font-mono flex-shrink-0",
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
