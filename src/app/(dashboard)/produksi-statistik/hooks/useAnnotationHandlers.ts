// src/app/(dashboard)/produksi-statistik/hooks/useAnnotationHandlers.ts
import { useCallback } from 'react';
import { ChartDataPoint } from '@/lib/types';
import { MONTH_NAMES } from '@/lib/utils';
import { toast } from 'sonner';
import { SupabaseClient } from '@supabase/supabase-js';
import { User } from '@supabase/supabase-js';

interface UseAnnotationHandlersProps {
  selectedYear: number;
  filters: {
    idIndikator: number | null;
  };
  supabase: SupabaseClient | null;
  authUser: User | null;
  mutateAnnotations: () => void;
}

export const useAnnotationHandlers = ({
  selectedYear,
  filters,
  supabase,
  authUser,
  mutateAnnotations
}: UseAnnotationHandlersProps) => {
  
  const handleAnnotationSubmit = useCallback(async (
    selectedAnnotationPoint: ChartDataPoint | null,
    comment: string
  ): Promise<void> => {
    if (!selectedAnnotationPoint || !filters.idIndikator) {
      toast.error("Gagal menyimpan: Titik data tidak valid.");
      return;
    }
    if (!authUser || !supabase) {
      toast.error("Anda harus login untuk menambahkan komentar.");
      return;
    }

    const bulanAngka = parseInt(
      Object.keys(MONTH_NAMES).find(key => MONTH_NAMES[key] === selectedAnnotationPoint.name) || '0'
    );

    // Optimistic update
    mutateAnnotations();

    try {
      const { error } = await supabase
        .from('fenomena_anotasi')
        .insert({
          user_id: authUser.id,
          komentar: comment,
          id_indikator: filters.idIndikator,
          tahun: selectedYear,
          bulan: bulanAngka > 0 ? bulanAngka : null,
          kode_wilayah: selectedAnnotationPoint.kode_wilayah || null
        });

      if (error) {
        // Rollback optimistic update
        mutateAnnotations();
        throw error;
      }

      // Update with final data
      mutateAnnotations();

      toast.success("Anotasi berhasil ditambahkan!");

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error("Gagal menyimpan anotasi.", { description: errorMessage });
      console.error('Error saving annotation:', error);
    }
  }, [selectedYear, filters.idIndikator, supabase, authUser, mutateAnnotations]);

  return {
    handleAnnotationSubmit
  };
};
