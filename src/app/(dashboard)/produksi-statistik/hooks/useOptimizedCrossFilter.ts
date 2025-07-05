// src/app/(dashboard)/produksi-statistik/hooks/useOptimizedCrossFilter.ts
import { useCallback, useState, useTransition } from 'react';
import { ChartDataPoint } from '@/lib/types';

interface UseOptimizedCrossFilterProps {
  selectedKabupaten: string | null;
  onSetKabupaten: (kabupaten: string | null) => void;
  level: 'provinsi' | 'kabupaten';
}

export const useOptimizedCrossFilter = ({
  selectedKabupaten,
  onSetKabupaten,
  level
}: UseOptimizedCrossFilterProps) => {
  const [isPending, startTransition] = useTransition();
  const [pendingKabupaten, setPendingKabupaten] = useState<string | null>(null);

  const handleOptimizedBarClick = useCallback((payload: { activePayload?: { payload: ChartDataPoint }[] }) => {
    if (!payload?.activePayload?.[0]?.payload) return;
    const clickedPayload = payload.activePayload[0].payload;
    
    if (level === 'kabupaten' && clickedPayload.kode_wilayah !== undefined) {
      const newKabupaten = selectedKabupaten === clickedPayload.kode_wilayah 
        ? null 
        : clickedPayload.kode_wilayah || null;
      
      // Set pending state immediately for UI feedback
      setPendingKabupaten(newKabupaten);
      
      // Use transition to mark state update as non-urgent
      startTransition(() => {
        onSetKabupaten(newKabupaten);
        setPendingKabupaten(null);
      });
      
      return true; // Indicate that this was a cross-filter action
    }
    
    return false; // Indicate this was not a cross-filter action
  }, [level, selectedKabupaten, onSetKabupaten]);

  return {
    handleOptimizedBarClick,
    isPending,
    pendingKabupaten,
    // For UI indication: show pending kabupaten or actual selected
    displayKabupaten: pendingKabupaten !== null ? pendingKabupaten : selectedKabupaten
  };
};
