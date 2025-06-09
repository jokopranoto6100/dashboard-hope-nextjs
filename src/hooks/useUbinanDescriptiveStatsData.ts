// src/hooks/useUbinanDescriptiveStatsData.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useYear } from '@/context/YearContext';
import { useUbinanEvaluasiFilter } from '@/context/UbinanEvaluasiFilterContext';
import { Tables } from '@/lib/database.types';
import {
  getNamaKabupaten,
  calculateMean,
  calculateMedian,
  calculateMin,
  calculateMax,
  calculateStandardDeviation,
  calculateQuartile,
} from '@/lib/utils';

export interface DescriptiveStatsRow {
  kab?: number;
  namaKabupaten: string;
  count: number; // Jumlah sampel tidak berubah oleh konversi unit
  mean: number | null;
  median: number | null;
  min: number | null;
  max: number | null;
  stdDev: number | null;
  q1: number | null;
  q3: number | null;
}

type UbinanRawFiltered = Pick<Tables<'ubinan_raw'>, 'kab' | 'r701'>;
const ITEMS_PER_PAGE = 1000;

export interface UbinanDescriptiveStatsOutput {
  perKabupatenData: DescriptiveStatsRow[];
  kalimantanBaratData: DescriptiveStatsRow | null;
}

// Tambahkan parameter conversionFactor
export const useUbinanDescriptiveStatsData = (conversionFactor: number = 1) => {
  const { supabase } = useAuth();
  const { selectedYear } = useYear();
  const { selectedSubround, selectedKomoditas, isLoadingFilters } = useUbinanEvaluasiFilter();

  const [processedData, setProcessedData] = useState<UbinanDescriptiveStatsOutput>({
    perKabupatenData: [],
    kalimantanBaratData: null,
  });
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDataAndProcess = useCallback(async () => {
    if (!selectedYear || isLoadingFilters || !selectedKomoditas) {
      setProcessedData({ perKabupatenData: [], kalimantanBaratData: null });
      return;
    }

    setIsLoadingData(true);
    setError(null);

    try {
      let allRawDataForProcessing: number[] = [];
      let allRawDataPerKab: { kab: number; r701Converted: number }[] = []; // Simpan r701 yang sudah dikonversi
      let currentPage = 0;
      let hasMoreData = true;

      while (hasMoreData) {
        const { from, to } = {
          from: currentPage * ITEMS_PER_PAGE,
          to: (currentPage + 1) * ITEMS_PER_PAGE - 1,
        };

        let query = supabase
          .from('ubinan_raw')
          .select('kab, r701')
          .eq('tahun', selectedYear)
          .not('r701', 'is', null)
          .eq('komoditas', selectedKomoditas);

        if (selectedSubround !== 'all') {
          query = query.eq('subround', selectedSubround);
        }
        
        query = query.range(from, to);
        const { data: pageData, error: pageError } = await query;

        if (pageError) throw pageError;

        if (pageData && pageData.length > 0) {
          pageData.forEach(item => {
            if (item.r701 !== null) {
              const r701Converted = item.r701 * conversionFactor; // Terapkan konversi di sini
              allRawDataForProcessing.push(r701Converted);
              if (item.kab !== null) {
                allRawDataPerKab.push({ kab: item.kab, r701Converted });
              }
            }
          });
        }
        
        if (!pageData || pageData.length < ITEMS_PER_PAGE) {
          hasMoreData = false;
        }
        currentPage++;
      }
      
      const groupedByKab = allRawDataPerKab.reduce((acc, curr) => {
        const kabStr = String(curr.kab);
        if (!acc[kabStr]) acc[kabStr] = [];
        acc[kabStr].push(curr.r701Converted); // Gunakan nilai yang sudah dikonversi
        return acc;
      }, {} as Record<string, number[]>);

      const perKabupatenStats: DescriptiveStatsRow[] = Object.entries(groupedByKab)
        .map(([kabCode, r701Values]) => { // r701Values di sini sudah dikonversi
          const kabNumber = parseInt(kabCode, 10);
          return {
            kab: kabNumber,
            namaKabupaten: getNamaKabupaten(kabNumber) || `Kode ${kabNumber}`,
            count: r701Values.length, // Count tetap jumlah sampel asli
            mean: calculateMean(r701Values),
            median: calculateMedian(r701Values),
            min: calculateMin(r701Values),
            max: calculateMax(r701Values),
            stdDev: calculateStandardDeviation(r701Values),
            q1: calculateQuartile(r701Values, 0.25),
            q3: calculateQuartile(r701Values, 0.75),
          };
        })
        .sort((a, b) => (a.kab || 0) - (b.kab || 0));

      let kalimantanBaratStats: DescriptiveStatsRow | null = null;
      if (allRawDataForProcessing.length > 0) { // allRawDataForProcessing sudah berisi nilai yang dikonversi
        kalimantanBaratStats = {
          namaKabupaten: "Kalimantan Barat",
          count: allRawDataForProcessing.length, // Count tetap jumlah sampel asli
          mean: calculateMean(allRawDataForProcessing),
          median: calculateMedian(allRawDataForProcessing),
          min: calculateMin(allRawDataForProcessing),
          max: calculateMax(allRawDataForProcessing),
          stdDev: calculateStandardDeviation(allRawDataForProcessing),
          q1: calculateQuartile(allRawDataForProcessing, 0.25),
          q3: calculateQuartile(allRawDataForProcessing, 0.75),
        };
      }
      
      setProcessedData({
        perKabupatenData: perKabupatenStats,
        kalimantanBaratData: kalimantanBaratStats,
      });

    } catch (err: any) {
      console.error("Error fetching or processing descriptive stats data:", err);
      setError(err.message || 'Terjadi kesalahan saat mengambil data statistik.');
      setProcessedData({ perKabupatenData: [], kalimantanBaratData: null });
    } finally {
      setIsLoadingData(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedSubround, selectedKomoditas, isLoadingFilters, supabase, conversionFactor]); // Tambahkan conversionFactor sebagai dependency

  useEffect(() => {
    fetchDataAndProcess();
  }, [fetchDataAndProcess]); // fetchFilterOptions tidak ada di sini, fetchDataAndProcess yang benar

  return { 
    data: processedData.perKabupatenData,
    kalimantanBaratData: processedData.kalimantanBaratData,
    isLoadingData, 
    error, 
    refreshData: fetchDataAndProcess 
  };
};