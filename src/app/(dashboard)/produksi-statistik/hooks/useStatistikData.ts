// src/app/(dashboard)/produksi-statistik/hooks/useStatistikData.ts
import { useMemo } from 'react';
import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import { useYear } from '@/context/YearContext';
import { useAtapStatistikData } from '@/hooks/useAtapStatistikData';
import { LineChartRawData, MonthlyDataPoint, Annotation } from '@/lib/types';

interface UseStatistikDataProps {
  filters: {
    idIndikator: number;
    indikatorNama: string;
    bulan: string;
    level: 'provinsi' | 'kabupaten';
    tahunPembanding: string;
  };
  selectedKabupaten: string | null;
}

export const useStatistikData = ({ filters, selectedKabupaten }: UseStatistikDataProps) => {
  const { selectedYear } = useYear();
  const { supabase } = useAuth();

  // Main data fetching
  const { data, dataPembanding, isLoading } = useAtapStatistikData({ 
    ...filters, 
    tahunPembanding: filters.tahunPembanding === 'tidak' ? null : parseInt(filters.tahunPembanding) 
  });

  // Line chart data fetching dengan memoized key
  const lineChartSWRKey = useMemo(() => 
    filters.idIndikator && supabase 
      ? `monthly_trend_${selectedYear}_${filters.idIndikator}_${filters.tahunPembanding}_${selectedKabupaten || 'prov'}`
      : null,
    [selectedYear, filters.idIndikator, filters.tahunPembanding, selectedKabupaten, supabase]
  );

  const { data: lineChartRawData, isLoading: isLineChartLoading } = useSWR<LineChartRawData | null>(
    lineChartSWRKey,
    async () => {
      if (!supabase || !filters.idIndikator) return null;

      const fetchMonthlyData = async (year: number): Promise<MonthlyDataPoint[]> => {
        let query = supabase.from('laporan_atap_lengkap')
          .select('bulan, nilai, kode_wilayah')
          .eq('tahun', year)
          .eq('indikator', filters.indikatorNama)
          .like('level_data', 'Bulanan%')
          .in('bulan', [1,2,3,4,5,6,7,8,9,10,11,12]);
        
        query = selectedKabupaten ? 
          query.eq('kode_wilayah', selectedKabupaten) : 
          query.eq('level_wilayah', 'provinsi');
        
        const { data, error } = await query;
        if (error) throw error;
        return (data || []) as MonthlyDataPoint[];
      };
      
      const mainData = await fetchMonthlyData(selectedYear);
      let compareData: MonthlyDataPoint[] = [];
      
      if (filters.tahunPembanding !== 'tidak') {
        compareData = await fetchMonthlyData(parseInt(filters.tahunPembanding));
      }
      
      return { mainData, compareData };
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30000, // Cache for 30 seconds
    }
  );

  // Annotations data fetching dengan memoized key
  const annotationsSWRKey = useMemo(() => 
    filters.idIndikator && supabase 
      ? `annotations_${selectedYear}_${filters.idIndikator}`
      : null,
    [selectedYear, filters.idIndikator, supabase]
  );

  const { data: annotations, mutate: mutateAnnotations } = useSWR<Annotation[]>( 
    annotationsSWRKey, 
    async () => {
      if (!supabase || !filters.idIndikator) return [];

      const { data, error } = await supabase.rpc('get_annotations_with_user_details', { 
        p_id_indikator: filters.idIndikator, 
        p_tahun: selectedYear 
      });
      
      if (error) { 
        console.error("Gagal mengambil anotasi:", error); 
        return []; 
      }
      
      return data || [];
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache annotations for 1 minute
    }
  );

  return {
    data,
    dataPembanding,
    lineChartRawData,
    annotations,
    isLoading,
    isLineChartLoading,
    mutateAnnotations
  };
};
