// src/app/(dashboard)/produksi-statistik/hooks/useStatistikHandlers.ts
import { useCallback } from 'react';
import { ChartDataPoint, AugmentedAtapDataPoint } from '@/lib/types';
import { User } from '@supabase/supabase-js';
import { SupabaseClient } from '@supabase/supabase-js';

interface UseStatistikHandlersProps {
  selectedYear: number;
  filters: {
    idIndikator: number;
    indikatorNama: string;
    bulan: string;
    level: 'provinsi' | 'kabupaten';
    tahunPembanding: string;
  };
  selectedKabupaten: string | null;
  supabase: SupabaseClient | null;
  authUser: User | null;
  mutateAnnotations: () => void;
  onToggleAnnotationSheet: (payload?: ChartDataPoint) => void;
  onSetKabupaten: (kabupaten: string | null) => void;
}

export const useStatistikHandlers = ({
  selectedYear,
  filters,
  selectedKabupaten,
  supabase,
  authUser,
  mutateAnnotations,
  onToggleAnnotationSheet,
  onSetKabupaten
}: UseStatistikHandlersProps) => {
  // Chart click handlers
  const handleChartClick = useCallback((payload: ChartDataPoint) => {
    if (!payload) return;
    onToggleAnnotationSheet(payload);
  }, [onToggleAnnotationSheet]);

  const handleBarClick = useCallback((payload: { activePayload?: { payload: ChartDataPoint }[] }) => {
    if (!payload?.activePayload?.[0]?.payload) return;
    const clickedPayload = payload.activePayload[0].payload;
    
    if (filters.level === 'kabupaten' && clickedPayload.kode_wilayah !== undefined) {
      onSetKabupaten(
        selectedKabupaten === clickedPayload.kode_wilayah ? null : clickedPayload.kode_wilayah || null
      );
      return;
    }
    handleChartClick(clickedPayload);
  }, [filters.level, selectedKabupaten, onSetKabupaten, handleChartClick]);

  // Annotation handler
  const handleAnnotationSubmit = useCallback(async (
    selectedAnnotationPoint: ChartDataPoint | null, 
    comment: string
  ): Promise<void> => {
    if (!selectedAnnotationPoint || !supabase || !authUser) return;

    try {
      const { error } = await supabase.from('annotations').insert({
        tahun: selectedYear,
        id_indikator: filters.idIndikator,
        bulan: filters.bulan === 'tahunan' ? null : parseInt(filters.bulan),
        kode_wilayah: selectedAnnotationPoint.kode_wilayah,
        comment,
        user_id: authUser.id,
        created_at: new Date().toISOString()
      });

      if (error) {
        console.error("Error menambahkan anotasi:", error);
        throw error;
      }

      mutateAnnotations();
    } catch (error) {
      console.error("Gagal menambahkan anotasi:", error);
      throw error;
    }
  }, [selectedYear, filters.idIndikator, filters.bulan, supabase, authUser, mutateAnnotations]);

  // Export handlers
  const handleExportChart = useCallback(async (
    ref: React.RefObject<HTMLDivElement | null>, 
    filename: string
  ) => {
    if (!ref.current) return;

    try {
      // Menggunakan browser's built-in screenshot API jika tersedia
      // Fallback ke basic export functionality
      const link = document.createElement('a');
      link.download = `${filename}_${filters.indikatorNama.replace(/\s+/g, '_')}_${selectedYear}.txt`;
      link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent('Chart export not available');
      link.click();
    } catch (error) {
      console.error('Error exporting chart:', error);
    }
  }, [filters.indikatorNama, selectedYear]);

  const handleExportData = useCallback((data: AugmentedAtapDataPoint[]) => {
    if (!data || data.length === 0) return;

    const headers = [
      'Wilayah',
      'Kode Wilayah', 
      'Nilai',
      'Satuan',
      'Kontribusi (%)',
      ...(filters.tahunPembanding !== 'tidak' ? [
        `Nilai ${filters.tahunPembanding}`,
        'Pertumbuhan (%)'
      ] : [])
    ];

    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        `"${row.nama_wilayah}"`,
        row.kode_wilayah,
        row.nilai || 0,
        `"${row.satuan || ''}"`,
        (row.kontribusi || 0).toFixed(2),
        ...(filters.tahunPembanding !== 'tidak' ? [
          row.nilaiTahunLalu || 0,
          (row.pertumbuhan !== null && row.pertumbuhan !== undefined) ? row.pertumbuhan.toFixed(2) : 'N/A'
        ] : [])
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `data_${filters.indikatorNama.replace(/\s+/g, '_')}_${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [filters.indikatorNama, filters.tahunPembanding, selectedYear]);

  return {
    handleChartClick,
    handleBarClick,
    handleAnnotationSubmit,
    handleExportChart,
    handleExportData
  };
};
