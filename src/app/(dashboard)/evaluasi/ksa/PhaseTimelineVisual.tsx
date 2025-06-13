// Lokasi: src/app/(dashboard)/evaluasi/ksa/PhaseTimelineVisual.tsx
"use client";

import React from 'react'; // <-- TAMBAHKAN BARIS INI
import { cn } from "@/lib/utils";

interface PhaseTimelineVisualProps {
  urutan_fase: string;
}

export function PhaseTimelineVisual({ urutan_fase }: PhaseTimelineVisualProps) {
  const phases = urutan_fase.split(' -> ');

  return (
    <div className="flex items-center justify-center gap-2 font-mono">
      {phases.map((phase, index) => (
        <React.Fragment key={index}>
          <div
            className={cn(
              "flex h-7 w-9 items-center justify-center rounded-md border text-sm",
              index > 0 ? "bg-destructive/10 border-destructive/50" : "bg-muted"
            )}
          >
            {phase}
          </div>
          {index < phases.length - 1 && <span className="text-muted-foreground">→</span>}
        </React.Fragment>
      ))}
    </div>
  );
}