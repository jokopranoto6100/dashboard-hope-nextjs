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

// Interface untuk tabel statistik deskriptif
export interface DescriptiveStatsRow {
  kab?: number;
  namaKabupaten: string;
  count: number;
  mean: number | null;
  median: number | null;
  min: number | null;
  max: number | null;
  stdDev: number | null;
  q1: number | null;
  q3: number | null;
}

// Interface untuk data yang dibutuhkan oleh Box Plot
export interface BoxPlotStatsRow {
  kab?: number;
  namaKabupaten: string;
  boxPlotData: (number | null)[]; // Format [min, q1, median, q3, max]
  outliers: (number | null)[][]; // Format ECharts: [[index_kategori, nilai_outlier]]
  count: number;
}

// Interface untuk output hook yang sekarang berisi kedua jenis data
export interface UbinanDescriptiveStatsOutput {
  descriptiveStats: DescriptiveStatsRow[];
  boxPlotStats: BoxPlotStatsRow[];
  kalimantanBaratData: DescriptiveStatsRow | null;
}

type UbinanRawFiltered = Pick<Tables<'ubinan_raw'>, 'kab' | 'r701'>;
const ITEMS_PER_PAGE = 1000;

// Fungsi utility untuk kalkulasi data Box Plot
const calculateBoxPlotData = (data: number[]) => {
  if (data.length === 0) {
    return {
      boxPlotData: [0, 0, 0, 0, 0],
      outliers: []
    };
  }

  const sortedData = [...data].sort((a, b) => a - b);
  const q1 = calculateQuartile(sortedData, 0.25);
  const median = calculateMedian(sortedData);
  const q3 = calculateQuartile(sortedData, 0.75);

  // Handle null case for q1/q3
  if (q1 === null || q3 === null) {
      return {
          boxPlotData: [
              calculateMin(sortedData),
              q1,
              median,
              q3,
              calculateMax(sortedData)
          ],
          outliers: []
      };
  }

  const iqr = q3 - q1;
  const lowerWhisker = q1 - 1.5 * iqr;
  const upperWhisker = q3 + 1.5 * iqr;

  const outliers: number[][] = [];
  const validData: number[] = [];

  sortedData.forEach((value) => {
    if (value < lowerWhisker || value > upperWhisker) {
      outliers.push([0, value]); // Format ECharts [index_kategori, nilai]
    } else {
      validData.push(value);
    }
  });

  const min = validData.length > 0 ? Math.min(...validData) : lowerWhisker;
  const max = validData.length > 0 ? Math.max(...validData) : upperWhisker;

  return {
    boxPlotData: [min, q1, median, q3, max],
    outliers,
  };
};


export const useUbinanDescriptiveStatsData = (conversionFactor: number) => {
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
      let allData: UbinanRawFiltered[] = [];
      let currentPage = 0;
      let hasMoreData = true;

      while (hasMoreData) {
        const { from, to } = { from: currentPage * ITEMS_PER_PAGE, to: (currentPage + 1) * ITEMS_PER_PAGE - 1 };
        
        let query = supabase
          .from('ubinan_raw')
          .select('kab, r701')
          .eq('tahun', selectedYear)
          .not('r701', 'is', null)
          .eq('komoditas', selectedKomoditas);

        if (selectedSubround !== 'all') {
          query = query.eq('subround', selectedSubround);
        }
        
        const { data: pageData, error: pageError } = await query.range(from, to);

        if (pageError) throw pageError;
        if (pageData) allData.push(...pageData as UbinanRawFiltered[]);
        if (!pageData || pageData.length < ITEMS_PER_PAGE) hasMoreData = false;
        
        currentPage++;
      }
      
      const allRawDataForProcessing = allData.map(d => d.r701! * conversionFactor);
      
      const groupedByKab = allData.reduce((acc, curr) => {
        const kabStr = String(curr.kab);
        if (!acc.has(kabStr)) acc.set(kabStr, []);
        acc.get(kabStr)!.push(curr);
        return acc;
      }, new Map<string, UbinanRawFiltered[]>());
      
      const perKabupatenStats: DescriptiveStatsRow[] = [];
      const perKabupatenBoxPlot: BoxPlotStatsRow[] = [];

      groupedByKab.forEach((data, kabStr) => {
        const kab = parseInt(kabStr, 10);
        const dataForProcessing = data.map(d => d.r701! * conversionFactor);
        const namaKabupaten = getNamaKabupaten(kab);

        // 1. Kalkulasi untuk tabel deskriptif
        perKabupatenStats.push({
          kab,
          namaKabupaten,
          count: dataForProcessing.length,
          mean: calculateMean(dataForProcessing),
          median: calculateMedian(dataForProcessing),
          min: calculateMin(dataForProcessing),
          max: calculateMax(dataForProcessing),
          stdDev: calculateStandardDeviation(dataForProcessing),
          q1: calculateQuartile(dataForProcessing, 0.25),
          q3: calculateQuartile(dataForProcessing, 0.75),
        });

        // 2. Kalkulasi untuk Box Plot
        const { boxPlotData, outliers } = calculateBoxPlotData(dataForProcessing);
        perKabupatenBoxPlot.push({
            kab,
            namaKabupaten,
            count: dataForProcessing.length,
            boxPlotData,
            outliers
        });
      });

      perKabupatenStats.sort((a,b) => (a.kab || 0) - (b.kab || 0));
      perKabupatenBoxPlot.sort((a,b) => (a.kab || 0) - (b.kab || 0));
      
      let kalimantanBaratStats: DescriptiveStatsRow | null = null;
      if (allRawDataForProcessing.length > 0) {
        kalimantanBaratStats = {
          namaKabupaten: "Kalimantan Barat",
          count: allRawDataForProcessing.length,
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
        descriptiveStats: perKabupatenStats,
        boxPlotStats: perKabupatenBoxPlot,
        kalimantanBaratData: kalimantanBaratStats,
      });

    } catch (err: any) {
      console.error("Error fetching or processing descriptive stats data:", err);
      setError(err.message || 'Terjadi kesalahan saat mengambil data statistik.');
      setProcessedData({ descriptiveStats: [], boxPlotStats: [], kalimantanBaratData: null });
    } finally {
      setIsLoadingData(false);
    }
  }, [selectedYear, selectedSubround, selectedKomoditas, isLoadingFilters, supabase, conversionFactor]);

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