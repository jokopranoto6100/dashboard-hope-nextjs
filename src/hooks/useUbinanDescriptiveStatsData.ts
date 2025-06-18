// src/hooks/useUbinanDescriptiveStatsData.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useYear } from '@/context/YearContext';
import { useUbinanEvaluasiFilter } from '@/context/UbinanEvaluasiFilterContext';
import { DescriptiveStatsRow, BoxPlotStatsRow, UbinanDescriptiveStatsOutput } from '../app/(dashboard)/evaluasi/ubinan/types';

export const useUbinanDescriptiveStatsData = (
  conversionFactor: number,
  comparisonYear: number | null
) => {
  const { supabase } = useAuth();
  const { selectedYear } = useYear();
  const { selectedSubround, selectedKomoditas, isLoadingFilters } = useUbinanEvaluasiFilter();
  
  const [processedData, setProcessedData] = useState<UbinanDescriptiveStatsOutput>({
    descriptiveStats: [],
    boxPlotStats: [],
    kalimantanBaratData: null,
  });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDataAndProcess = useCallback(async () => {
    if (!selectedYear || isLoadingFilters || !selectedKomoditas) {
      setProcessedData({ descriptiveStats: [], boxPlotStats: [], kalimantanBaratData: null });
      return;
    }
    setIsLoadingData(true);
    setError(null);

    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_ubinan_descriptive_stats', {
          tahun_val: selectedYear,
          komoditas_val: selectedKomoditas,
          subround_filter: selectedSubround === 'all' ? 'all' : String(selectedSubround),
          comparison_tahun_val: comparisonYear,
      });

      if (rpcError) throw rpcError;
      
      const convertedData = rpcData.map((d: any) => ({
        ...d,
        namaKabupaten: d.nama_kabupaten,
        stdDev: d.std_dev,
        comparisonCount: d.comparison_count,
        // comparisonMean: d.comparison_mean, // Removed duplicate property
        meanChange: d.mean_change,
        mean: d.mean !== null ? d.mean * conversionFactor : null,
        median: d.median !== null ? d.median * conversionFactor : null,
        min: d.min !== null ? d.min * conversionFactor : null,
        max: d.max !== null ? d.max * conversionFactor : null,
        q1: d.q1 !== null ? d.q1 * conversionFactor : null,
        q3: d.q3 !== null ? d.q3 * conversionFactor : null,
        comparisonMean: d.comparison_mean !== null ? d.comparison_mean * conversionFactor : null,
      })) as DescriptiveStatsRow[];

      const kalbarData = convertedData.find(d => d.namaKabupaten === 'Kalimantan Barat') || null;
      const kabData = convertedData.filter(d => d.namaKabupaten !== 'Kalimantan Barat');

      // =======================================================================
      // AWAL BLOK LOGIKA BARU UNTUK BOX PLOT
      // =======================================================================
      let boxPlotStats: BoxPlotStatsRow[] = [];
      // Box plot hanya ditampilkan pada mode 'detail', bukan 'comparison'
      if (!comparisonYear) {
          boxPlotStats = kabData.map(stat => ({
              kab: stat.kab,
              namaKabupaten: stat.namaKabupaten,
              count: stat.count,
              // Susun data ke format yang dibutuhkan ECharts: [min, q1, median, q3, max]
              boxPlotData: [stat.min, stat.q1, stat.median, stat.q3, stat.max],
              // PENTING: Outlier tidak bisa dihitung karena kita tidak lagi mengambil data mentah.
              // Kita korbankan outlier demi performa yang jauh lebih cepat.
              outliers: [] 
          }));
      }
      // =======================================================================
      // AKHIR BLOK LOGIKA BARU UNTUK BOX PLOT
      // =======================================================================

      setProcessedData({
        descriptiveStats: kabData,
        kalimantanBaratData: kalbarData,
        boxPlotStats: boxPlotStats, // <-- DIUBAH: Gunakan data yang baru dibuat
      });

    } catch (err: any) {
      console.error("Error fetching from RPC get_ubinan_descriptive_stats:", err);
      setError(err.message || 'Terjadi kesalahan saat memanggil data statistik.');
      setProcessedData({ descriptiveStats: [], boxPlotStats: [], kalimantanBaratData: null });
    } finally {
      setIsLoadingData(false);
    }
  }, [selectedYear, comparisonYear, selectedSubround, selectedKomoditas, isLoadingFilters, supabase, conversionFactor]);

  useEffect(() => {
    fetchDataAndProcess();
  }, [fetchDataAndProcess]);

  return { 
    descriptiveStats: processedData.descriptiveStats,
    boxPlotData: processedData.boxPlotStats,
    kalimantanBaratData: processedData.kalimantanBaratData,
    isLoadingData, 
    error 
  };
};