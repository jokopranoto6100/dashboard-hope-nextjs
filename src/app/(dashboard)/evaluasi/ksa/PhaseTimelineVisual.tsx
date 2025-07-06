// Lokasi: src/app/(dashboard)/evaluasi/ksa/PhaseTimelineVisual.tsx
"use client";

import React, { useMemo } from 'react';
import { cn } from "@/lib/utils";

interface PhaseTimelineVisualProps {
  urutan_fase: string;
}

export const PhaseTimelineVisual = React.memo(({ urutan_fase }: PhaseTimelineVisualProps) => {
  const phases = useMemo(() => {
    if (!urutan_fase || typeof urutan_fase !== 'string') return [];
    return urutan_fase.split(' -> ').filter(Boolean);
  }, [urutan_fase]);

  if (phases.length === 0) {
    return (
      <div className="flex items-center justify-center p-2 text-xs text-muted-foreground">
        Tidak ada data fase
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1 md:gap-2 font-mono overflow-x-auto">
      {phases.map((phase, index) => (
        <React.Fragment key={index}>
          <div
            className={cn(
              "flex h-6 w-7 md:h-7 md:w-9 items-center justify-center rounded-md border text-xs md:text-sm flex-shrink-0",
              index > 0 ? "bg-destructive/10 border-destructive/50" : "bg-muted"
            )}
            title={`Fase ${phase}`}
          >
            {phase}
          </div>
          {index < phases.length - 1 && (
            <span className="text-muted-foreground text-xs md:text-sm flex-shrink-0">→</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
});

PhaseTimelineVisual.displayName = 'PhaseTimelineVisual';