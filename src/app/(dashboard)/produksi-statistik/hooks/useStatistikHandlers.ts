// src/app/(dashboard)/produksi-statistik/hooks/useStatistikHandlers.ts
import { useCallback } from 'react';
import { ChartDataPoint, AugmentedAtapDataPoint } from '@/lib/types';
import { User } from '@supabase/supabase-js';
import { SupabaseClient } from '@supabase/supabase-js';
import { MONTH_NAMES } from '@/lib/utils';

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
    if (!selectedAnnotationPoint || !supabase || !authUser) {
      throw new Error("Data tidak lengkap untuk menyimpan anotasi");
    }

    // Konversi bulan: ambil dari titik data yang diklik pada grafik trend
    let bulanAngka: number | null = null;
    
    // Cek apakah ada properti bulan eksplisit dari line chart data
    if ('bulan' in selectedAnnotationPoint && typeof selectedAnnotationPoint.bulan === 'number') {
      bulanAngka = selectedAnnotationPoint.bulan;
    } else {
      // Fallback: parse dari nama bulan jika diperlukan
      const monthName = selectedAnnotationPoint.name;
      
      // Cari nomor bulan berdasarkan nama (contoh: "Jan" -> 1, "Feb" -> 2, dst)
      const monthEntry = Object.entries(MONTH_NAMES).find(([, name]) => name === monthName);
      if (monthEntry) {
        bulanAngka = parseInt(monthEntry[0]);
      }
    }

    const insertData = {
      user_id: authUser.id,
      komentar: comment,
      id_indikator: filters.idIndikator,
      tahun: selectedYear,
      bulan: bulanAngka,
      kode_wilayah: selectedAnnotationPoint.kode_wilayah || null
    };

    try {
      const { error } = await supabase
        .from('fenomena_anotasi')
        .insert(insertData);

      if (error) {
        console.error("Database error:", error);
        throw new Error(`Gagal menyimpan ke database: ${error.message}`);
      }

      // Force refresh annotations dengan revalidation
      await mutateAnnotations();
    } catch (error) {
      console.error("Error menambahkan anotasi:", error);
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
