// Lokasi: src/hooks/useKsaEvaluationData.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useYear } from '@/context/YearContext';
import { useKsaEvaluasiFilter } from '@/context/KsaEvaluasiFilterContext';

export interface KsaKpiData {
  avgHarvestFrequency: number | null;
  peakTanamMonth: string | null;
  peakPanenMonth: string | null;
}

export interface KsaAreaChartData {
  bulan: number;
  [category: string]: number;
}

export interface KsaLineChartData {
  name: string;
  Tanam: number;
  Panen: number;
}

export const useKsaEvaluationData = () => {
  const { supabase } = useAuth();
  const { selectedYear } = useYear();
  const { selectedKabupaten, isLoadingFilters } = useKsaEvaluasiFilter();

  const [kpiData, setKpiData] = useState<KsaKpiData | null>(null);
  const [areaChartData, setAreaChartData] = useState<KsaAreaChartData[]>([]);
  const [lineChartData, setLineChartData] = useState<KsaLineChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  const triggerFetch = useCallback(async () => {
    if (isLoadingFilters) return;
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('get_ksa_evaluation_stats', {
        p_year: selectedYear,
        p_kabupaten: selectedKabupaten
      });

      if (rpcError) throw rpcError;

      const result = data;
      setKpiData({
        avgHarvestFrequency: result.kpi.avgHarvestFrequency,
        peakTanamMonth: result.kpi.peakTanamMonth ? MONTH_NAMES[result.kpi.peakTanamMonth - 1] : '-',
        peakPanenMonth: result.kpi.peakPanenMonth ? MONTH_NAMES[result.kpi.peakPanenMonth - 1] : '-'
      });
      
      const newLineChartData = (result.lineChartData || []).map((d: any) => ({
          name: MONTH_NAMES[d.bulan - 1],
          Tanam: d.tanam,
          Panen: d.panen,
      }));
      setLineChartData(newLineChartData);

      const newAreaChartData = (result.areaChartData || []).reduce((acc: any[], item: any) => {
          let monthEntry = acc.find((m) => m.bulan === item.bulan);
          if (!monthEntry) {
              monthEntry = { bulan: item.bulan };
              acc.push(monthEntry);
          }
          monthEntry[`Fase ${item.fase}`] = item.jumlah;
          return acc;
      }, []);
      setAreaChartData(newAreaChartData.sort((a,b) => a.bulan - b.bulan));
      
    } catch (err: any) {
      console.error("Error calling RPC function:", err);
      setError(err.message || 'Gagal memuat data evaluasi dari server.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoadingFilters, selectedYear, selectedKabupaten, supabase]);

  useEffect(() => {
    triggerFetch();
  }, [triggerFetch]);

  return { isLoading, error, kpiData, areaChartData, lineChartData };
};