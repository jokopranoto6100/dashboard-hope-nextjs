// Lokasi: src/hooks/useStatistikDataFetcher.ts
"use client";

import useSWR from 'swr';
import { useAtapStatistikData, AtapDataPoint } from "@/hooks/useAtapStatistikData";
import { useAuth } from '@/context/AuthContext';

// Tipe data untuk anotasi
interface Annotation {
    id: number;
    created_at: string;
    user_id: string;
    komentar: string;
    id_indikator: number;
    tahun: number;
    bulan: number | null;
    kode_wilayah: string | null;
    user_fullname: string | null;
}

// Tipe data untuk properti yang diterima hook ini
interface FetcherProps {
  idIndikator: number | null;
  tahunPembanding: string;
  bulan: string;
  level: 'provinsi' | 'kabupaten';
  indikatorNama: string;
  selectedYear: number;
  selectedKabupaten: string | null;
}

/**
 * Custom hook yang bertanggung jawab untuk semua pengambilan data mentah dari server.
 * Ini mengisolasi semua logika fetching (SWR, Supabase calls) dari komponen UI.
 */
export function useStatistikDataFetcher({
  idIndikator,
  tahunPembanding,
  bulan,
  level,
  indikatorNama,
  selectedYear,
  selectedKabupaten,
}: FetcherProps) {
  const { supabase } = useAuth();

  // 1. Fetch data utama dan data pembanding (dari hook yang sudah ada)
  const { data, dataPembanding, isLoading: isAtapDataLoading } = useAtapStatistikData({
    tahunPembanding: tahunPembanding === 'tidak' ? null : parseInt(tahunPembanding),
    bulan,
    level,
    indikatorNama,
  });

  // 2. Fetch data mentah untuk time-series chart (Line Chart)
  const lineChartSWRKey = idIndikator ? `monthly_trend_${selectedYear}_${idIndikator}_${tahunPembanding}_${selectedKabupaten || 'prov'}` : null;
  const { data: lineChartRawData, isLoading: isLineChartLoading } = useSWR(
    lineChartSWRKey,
    async () => {
      if (!supabase) return { mainData: [], compareData: [] };

      const fetchMonthlyData = async (year: number) => {
        let query = supabase.from('laporan_atap_lengkap').select('bulan, nilai, kode_wilayah')
          .eq('tahun', year)
          .eq('indikator', indikatorNama)
          .like('level_data', 'Bulanan%')
          .in('bulan', [1,2,3,4,5,6,7,8,9,10,11,12]);
        
        query = selectedKabupaten ? query.eq('kode_wilayah', selectedKabupaten) : query.eq('level_wilayah', 'provinsi');
        
        const { data, error } = await query;
        if (error) throw error;
        return data;
      };

      const mainData = await fetchMonthlyData(selectedYear);
      let compareData: { bulan: number; nilai: number; kode_wilayah: string | null }[] = [];
      if (tahunPembanding !== 'tidak') {
        compareData = await fetchMonthlyData(parseInt(tahunPembanding));
      }
      return { mainData, compareData };
    }
  );

  // 3. Fetch data anotasi
  const annotationsSWRKey = idIndikator ? `annotations_${selectedYear}_${idIndikator}` : null;
  const { data: annotations, mutate: mutateAnnotations } = useSWR(annotationsSWRKey, async () => {
    if (!supabase || !idIndikator) return [];
    const { data, error } = await supabase.rpc('get_annotations_with_user_details', { 
        p_id_indikator: idIndikator, 
        p_tahun: selectedYear 
    });
    if (error) {
      console.error("Gagal mengambil anotasi:", error);
      return [];
    }
    return data as Annotation[];
  });
  
  return {
    rawData: {
      mainData: data as AtapDataPoint[] | null,
      compareData: dataPembanding as AtapDataPoint[] | null,
      lineChartRawData,
      annotations,
    },
    isLoading: isAtapDataLoading || isLineChartLoading,
    mutateAnnotations,
  };
}