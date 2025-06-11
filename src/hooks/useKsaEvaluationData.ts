// Lokasi: src/hooks/useKsaEvaluationData.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useYear } from '@/context/YearContext';
import { useKsaEvaluasiFilter } from '@/context/KsaEvaluasiFilterContext';

// --- Tipe Data untuk Output Hook ---

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

export interface PivotTableData {
    kabupaten: string;
    [key: string]: string | number; // e.g., '1x': 50, '2x': 25
}


// --- Logika Utama Hook ---

export const useKsaEvaluationData = () => {
  const { supabase } = useAuth();
  const { selectedYear } = useYear();
  const { selectedKabupaten, isLoadingFilters } = useKsaEvaluasiFilter();

  const [kpiData, setKpiData] = useState<KsaKpiData | null>(null);
  const [areaChartData, setAreaChartData] = useState<KsaAreaChartData[]>([]);
  const [lineChartData, setLineChartData] = useState<KsaLineChartData[]>([]);
  const [pivotTableData, setPivotTableData] = useState<PivotTableData[]>([]);
  const [harvestColumns, setHarvestColumns] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  const triggerFetch = useCallback(async () => {
    if (isLoadingFilters) return;
    setIsLoading(true);
    setError(null);

    try {
      // Panggil kedua fungsi RPC secara paralel untuk efisiensi
      const rpcEvalPromise = supabase.rpc('get_ksa_evaluation_stats', {
        p_year: selectedYear,
        p_kabupaten: selectedKabupaten
      });

      // RPC ini akan mengambil data frekuensi untuk SEMUA kabupaten, 
      // agar kita bisa membangun tabel pivot secara utuh.
      // Filtering per kabupaten akan dilakukan di client-side.
      const rpcFreqPromise = supabase.rpc('get_ksa_harvest_frequency_by_kab', { 
        p_year: selectedYear 
      });
      
      const [evalResult, freqResult] = await Promise.all([rpcEvalPromise, rpcFreqPromise]);

      if (evalResult.error) throw evalResult.error;
      if (freqResult.error) throw freqResult.error;

      // --- 1. Proses Hasil dari get_ksa_evaluation_stats (untuk KPI dan Grafik) ---
      const evalData = evalResult.data;
      setKpiData({
        avgHarvestFrequency: evalData.kpi.avgHarvestFrequency,
        peakTanamMonth: evalData.kpi.peakTanamMonth ? MONTH_NAMES[evalData.kpi.peakTanamMonth - 1] : '-',
        peakPanenMonth: evalData.kpi.peakPanenMonth ? MONTH_NAMES[evalData.kpi.peakPanenMonth - 1] : '-'
      });
      
      const newLineChartData = (evalData.lineChartData || []).map((d: any) => ({
          name: MONTH_NAMES[d.bulan - 1],
          Tanam: d.tanam,
          Panen: d.panen,
      }));
      setLineChartData(newLineChartData);

      const newAreaChartData = (evalData.areaChartData || []).reduce((acc: any[], item: any) => {
          let monthEntry = acc.find((m) => m.bulan === item.bulan);
          if (!monthEntry) {
              monthEntry = { bulan: item.bulan };
              acc.push(monthEntry);
          }
          monthEntry[`Fase ${item.fase}`] = (monthEntry[`Fase ${item.fase}`] || 0) + item.jumlah;
          return acc;
      }, []);
      setAreaChartData(newAreaChartData.sort((a,b) => a.bulan - b.bulan));

      // --- 2. Proses Hasil dari get_ksa_harvest_frequency_by_kab (untuk Tabel Distribusi) ---
      const longFormatData = freqResult.data || [];
      
      const uniqueCounts = [...new Set(longFormatData.map(d => d.panen_count))].sort((a,b) => a - b);
      setHarvestColumns(uniqueCounts);

      const pivoted = longFormatData.reduce((acc, item) => {
        const { kabupaten, panen_count, subsegmen_count } = item;
        if (!acc[kabupaten]) {
            acc[kabupaten] = { kabupaten };
        }
        acc[kabupaten][`${panen_count}x`] = subsegmen_count;
        return acc;
      }, {} as { [key: string]: PivotTableData });
      
      setPivotTableData(Object.values(pivoted));
      
    } catch (err: any) {
      console.error("Error calling RPC functions:", err);
      setError(err.message || 'Gagal memuat data evaluasi dari server.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoadingFilters, selectedYear, selectedKabupaten, supabase]);

  useEffect(() => {
    triggerFetch();
  }, [triggerFetch]);

  // Kembalikan semua state yang dibutuhkan oleh UI
  return { isLoading, error, kpiData, areaChartData, lineChartData, tableData: pivotTableData, harvestColumns };
};
