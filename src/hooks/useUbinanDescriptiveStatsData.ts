// src/hooks/useUbinanDescriptiveStatsData.ts
"use client";

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
  count: number;
  mean: number | null;
  median: number | null;
  min: number | null;
  max: number | null;
  stdDev: number | null;
  q1: number | null;
  q3: number | null;
  comparisonCount?: number | null;
  comparisonMean?: number | null;
  meanChange?: number | null;
}

export interface BoxPlotStatsRow {
  kab?: number;
  namaKabupaten: string;
  boxPlotData: (number | null)[];
  outliers: (number | null)[][];
  count: number;
}

export interface UbinanDescriptiveStatsOutput {
  descriptiveStats: DescriptiveStatsRow[];
  boxPlotStats: BoxPlotStatsRow[];
  kalimantanBaratData: DescriptiveStatsRow | null;
}

type UbinanRawFiltered = Pick<Tables<'ubinan_raw'>, 'tahun' | 'kab' | 'r701'>;
const ITEMS_PER_PAGE = 1000;

const calculateBoxPlotData = (data: number[]) => {
  if (data.length === 0) return { boxPlotData: [0, 0, 0, 0, 0], outliers: [] };
  const sortedData = [...data].sort((a, b) => a - b);
  const q1 = calculateQuartile(sortedData, 0.25);
  const median = calculateMedian(sortedData);
  const q3 = calculateQuartile(sortedData, 0.75);
  if (q1 === null || q3 === null) return { boxPlotData: [calculateMin(sortedData), q1, median, q3, calculateMax(sortedData)], outliers: [] };
  const iqr = q3 - q1;
  const lowerWhisker = q1 - 1.5 * iqr;
  const upperWhisker = q3 + 1.5 * iqr;
  const outliers: number[][] = [];
  const validData: number[] = [];
  sortedData.forEach((value) => {
    if (value < lowerWhisker || value > upperWhisker) outliers.push([0, value]);
    else validData.push(value);
  });
  const min = validData.length > 0 ? Math.min(...validData) : lowerWhisker;
  const max = validData.length > 0 ? Math.max(...validData) : upperWhisker;
  return { boxPlotData: [min, q1, median, q3, max], outliers };
};

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
      const yearsToFetch = comparisonYear ? [selectedYear, comparisonYear] : [selectedYear];
      let allData: UbinanRawFiltered[] = [];
      let currentPage = 0;
      let hasMoreData = true;

      while (hasMoreData) {
        const { from, to } = { from: currentPage * ITEMS_PER_PAGE, to: (currentPage + 1) * ITEMS_PER_PAGE - 1 };
        let query = supabase.from('ubinan_raw').select('tahun, kab, r701').in('tahun', yearsToFetch).not('r701', 'is', null).eq('komoditas', selectedKomoditas);
        if (selectedSubround !== 'all') query = query.eq('subround', selectedSubround);
        const { data: pageData, error: pageError } = await query.range(from, to);
        if (pageError) throw pageError;
        if (pageData) allData.push(...pageData as UbinanRawFiltered[]);
        if (!pageData || pageData.length < ITEMS_PER_PAGE) hasMoreData = false;
        currentPage++;
      }
      
      const groupedByKab = allData.reduce((acc, curr) => {
        const key = String(curr.kab);
        if (!acc.has(key)) acc.set(key, []);
        acc.get(key)!.push(curr);
        return acc;
      }, new Map<string, UbinanRawFiltered[]>());

      const finalDescriptiveStats: DescriptiveStatsRow[] = [];
      const finalBoxPlotStats: BoxPlotStatsRow[] = [];
      
      groupedByKab.forEach((data, kabStr) => {
        const kab = parseInt(kabStr, 10);
        const namaKabupaten = getNamaKabupaten(kab);
        const dataThisYear = data.filter(d => d.tahun === selectedYear).map(d => d.r701! * conversionFactor);
        
        let descriptiveRow: DescriptiveStatsRow = {
          kab,
          namaKabupaten,
          count: dataThisYear.length,
          mean: calculateMean(dataThisYear),
          median: calculateMedian(dataThisYear),
          min: calculateMin(dataThisYear),
          max: calculateMax(dataThisYear),
          stdDev: calculateStandardDeviation(dataThisYear),
          q1: calculateQuartile(dataThisYear, 0.25),
          q3: calculateQuartile(dataThisYear, 0.75),
        };

        if (comparisonYear) {
          const dataComparisonYear = data.filter(d => d.tahun === comparisonYear).map(d => d.r701! * conversionFactor);
          descriptiveRow.comparisonCount = dataComparisonYear.length;
          descriptiveRow.comparisonMean = calculateMean(dataComparisonYear);
          if (descriptiveRow.mean !== null && descriptiveRow.comparisonMean !== null && descriptiveRow.comparisonMean > 0) {
            descriptiveRow.meanChange = ((descriptiveRow.mean - descriptiveRow.comparisonMean) / descriptiveRow.comparisonMean) * 100;
          }
        } else {
          const { boxPlotData, outliers } = calculateBoxPlotData(dataThisYear);
          finalBoxPlotStats.push({ kab, namaKabupaten, count: dataThisYear.length, boxPlotData, outliers });
        }
        finalDescriptiveStats.push(descriptiveRow);
      });
      
      const sortedDescriptiveStats = finalDescriptiveStats.sort((a, b) => (a.kab || 0) - (b.kab || 0));
      const sortedBoxPlotStats = finalBoxPlotStats.sort((a, b) => (a.kab || 0) - (b.kab || 0));

      const allDataThisYear = allData.filter(d => d.tahun === selectedYear).map(d => d.r701! * conversionFactor);
      let kalbarData: DescriptiveStatsRow | null = allDataThisYear.length > 0 ? {
          namaKabupaten: "Kalimantan Barat",
          count: allDataThisYear.length,
          mean: calculateMean(allDataThisYear),
          median: calculateMedian(allDataThisYear),
          min: calculateMin(allDataThisYear),
          max: calculateMax(allDataThisYear),
          stdDev: calculateStandardDeviation(allDataThisYear),
          q1: calculateQuartile(allDataThisYear, 0.25),
          q3: calculateQuartile(allDataThisYear, 0.75),
      } : null;

      if (comparisonYear && kalbarData) {
        const allDataComparisonYear = allData.filter(d => d.tahun === comparisonYear).map(d => d.r701! * conversionFactor);
        kalbarData.comparisonCount = allDataComparisonYear.length;
        kalbarData.comparisonMean = calculateMean(allDataComparisonYear);
        if (kalbarData.mean !== null && kalbarData.comparisonMean !== null && kalbarData.comparisonMean > 0) {
          kalbarData.meanChange = ((kalbarData.mean - kalbarData.comparisonMean) / kalbarData.comparisonMean) * 100;
        }
      }
      
      setProcessedData({
        descriptiveStats: sortedDescriptiveStats,
        boxPlotStats: sortedBoxPlotStats,
        kalimantanBaratData: kalbarData,
      });

    } catch (err: any) {
      console.error("Error fetching or processing descriptive stats data:", err);
      setError(err.message || 'Terjadi kesalahan.');
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