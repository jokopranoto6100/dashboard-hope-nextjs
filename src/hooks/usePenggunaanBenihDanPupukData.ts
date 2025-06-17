// src/hooks/usePenggunaanBenihDanPupukData.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useYear } from '@/context/YearContext';
import { useUbinanEvaluasiFilter } from '@/context/UbinanEvaluasiFilterContext';
import { Tables } from '@/lib/database.types';
import { getNamaKabupaten } from '@/lib/utils';

export interface PupukDanBenihRow {
  kab?: number;
  namaKabupaten: string;
  avgR604_m2: number | null;
  avgBenihPerHa_kg_ha: number | null;
  avgUreaPerHa_kg_ha: number | null;
  avgTSPerHa_kg_ha: number | null;
  avgKCLperHa_kg_ha: number | null;
  avgNPKPerHa_kg_ha: number | null;
  avgKomposPerHa_kg_ha: number | null;
  avgOrganikCairPerHa_liter_ha: number | null;
  avgZAPerHa_kg_ha: number | null;
  comparison_avgR604_m2?: number | null;
  comparison_avgBenihPerHa_kg_ha?: number | null;
  comparison_avgUreaPerHa_kg_ha?: number | null;
  comparison_avgTSPerHa_kg_ha?: number | null;
  comparison_avgKCLperHa_kg_ha?: number | null;
  comparison_avgNPKPerHa_kg_ha?: number | null;
  comparison_avgKomposPerHa_kg_ha?: number | null;
  comparison_avgOrganikCairPerHa_liter_ha?: number | null;
  comparison_avgZAPerHa_kg_ha?: number | null;
  change_avgBenihPerHa_kg_ha?: number | null;
  change_avgUreaPerHa_kg_ha?: number | null;
  change_avgTSPerHa_kg_ha?: number | null;
  change_avgKCLperHa_kg_ha?: number | null;
  change_avgNPKPerHa_kg_ha?: number | null;
  change_avgKomposPerHa_kg_ha?: number | null;
  change_avgOrganikCairPerHa_liter_ha?: number | null;
  change_avgZAPerHa_kg_ha?: number | null;
}

type UbinanRawBenihPupuk = Pick<
  Tables<'ubinan_raw'>,
  'tahun' | 'kab' | 'r604' | 'r608' | 'r610_1' | 'r610_2' | 'r610_3' | 'r610_4' | 'r610_5' | 'r610_6' | 'r610_7'
>;

const ITEMS_PER_PAGE = 1000;

const getAverage = (arr: (number | null | undefined)[]): number | null => {
  const validNumbers = arr.filter(n => typeof n === 'number' && !isNaN(n)) as number[];
  if (validNumbers.length === 0) return null;
  return validNumbers.reduce((acc, val) => acc + val, 0) / validNumbers.length;
};

export const usePenggunaanBenihDanPupukData = (comparisonYear: number | null) => {
  const { supabase } = useAuth();
  const { selectedYear } = useYear();
  const { selectedSubround, selectedKomoditas, isLoadingFilters } = useUbinanEvaluasiFilter();

  const [processedData, setProcessedData] = useState<{ pupukDanBenihPerKab: PupukDanBenihRow[], kalimantanBaratPupukDanBenih: PupukDanBenihRow | null }>({
      pupukDanBenihPerKab: [], kalimantanBaratPupukDanBenih: null,
  });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!selectedYear || isLoadingFilters || !selectedKomoditas) {
      setProcessedData({ pupukDanBenihPerKab: [], kalimantanBaratPupukDanBenih: null });
      return;
    }
    setIsLoadingData(true);
    setError(null);

    try {
      const yearsToFetch = comparisonYear ? [selectedYear, comparisonYear] : [selectedYear];
      let allData: UbinanRawBenihPupuk[] = [];
      let currentPage = 0;
      let hasMoreData = true;
      const columnsToSelect = 'tahun, kab, r604, r608, r610_1, r610_2, r610_3, r610_4, r610_5, r610_6, r610_7';
      
      while (hasMoreData) {
        const { from, to } = { from: currentPage * ITEMS_PER_PAGE, to: (currentPage + 1) * ITEMS_PER_PAGE - 1 };
        let query = supabase.from('ubinan_raw').select(columnsToSelect).in('tahun', yearsToFetch).eq('komoditas', selectedKomoditas);
        if (selectedSubround !== 'all') query = query.eq('subround', selectedSubround);
        const { data: pageData, error: pageError } = await query.range(from, to);
        if (pageError) throw pageError;
        if (pageData) allData.push(...pageData as UbinanRawBenihPupuk[]);
        if (!pageData || pageData.length < ITEMS_PER_PAGE) hasMoreData = false;
        currentPage++;
      }
      
      const calculateAveragesByKab = (dataForYear: UbinanRawBenihPupuk[]): Map<number, Partial<PupukDanBenihRow>> => {
        const perRecordCalculated = dataForYear
          .filter(d => typeof d.r604 === 'number' && d.r604 > 0)
          .map(d => {
            const luasHa = d.r604! / 10000;
            return {
              kab: d.kab,
              avgR604_m2: d.r604,
              avgBenihPerHa_kg_ha: typeof d.r608 === 'number' ? d.r608 / luasHa : null,
              avgUreaPerHa_kg_ha: typeof d.r610_1 === 'number' ? d.r610_1 / luasHa : null,
              avgTSPerHa_kg_ha: typeof d.r610_2 === 'number' ? d.r610_2 / luasHa : null,
              avgKCLperHa_kg_ha: typeof d.r610_3 === 'number' ? d.r610_3 / luasHa : null,
              avgNPKPerHa_kg_ha: typeof d.r610_4 === 'number' ? d.r610_4 / luasHa : null,
              avgKomposPerHa_kg_ha: typeof d.r610_5 === 'number' ? d.r610_5 / luasHa : null,
              avgOrganikCairPerHa_liter_ha: typeof d.r610_6 === 'number' ? d.r610_6 / luasHa : null,
              avgZAPerHa_kg_ha: typeof d.r610_7 === 'number' ? d.r610_7 / luasHa : null,
            };
          });

        const groupedByKab = perRecordCalculated.reduce((acc, curr) => {
            const key = String(curr.kab);
            if (!acc.has(key)) acc.set(key, []);
            acc.get(key)!.push(curr);
            return acc;
        }, new Map<string, typeof perRecordCalculated>());

        const result = new Map<number, Partial<PupukDanBenihRow>>();
        groupedByKab.forEach((kabData, kabStr) => {
            const kab = parseInt(kabStr, 10);
            result.set(kab, {
              avgR604_m2: getAverage(kabData.map(d => d.avgR604_m2)),
              avgBenihPerHa_kg_ha: getAverage(kabData.map(d => d.avgBenihPerHa_kg_ha)),
              avgUreaPerHa_kg_ha: getAverage(kabData.map(d => d.avgUreaPerHa_kg_ha)),
              avgTSPerHa_kg_ha: getAverage(kabData.map(d => d.avgTSPerHa_kg_ha)),
              avgKCLperHa_kg_ha: getAverage(kabData.map(d => d.avgKCLperHa_kg_ha)),
              avgNPKPerHa_kg_ha: getAverage(kabData.map(d => d.avgNPKPerHa_kg_ha)),
              avgKomposPerHa_kg_ha: getAverage(kabData.map(d => d.avgKomposPerHa_kg_ha)),
              avgOrganikCairPerHa_liter_ha: getAverage(kabData.map(d => d.avgOrganikCairPerHa_liter_ha)),
              avgZAPerHa_kg_ha: getAverage(kabData.map(d => d.avgZAPerHa_kg_ha)),
            });
        });
        return result;
      };

      const thisYearRawData = allData.filter(d => d.tahun === selectedYear);
      const thisYearAveragesByKab = calculateAveragesByKab(thisYearRawData);

      let comparisonYearAveragesByKab: Map<number, Partial<PupukDanBenihRow>> | null = null;
      if (comparisonYear) {
        const comparisonYearRawData = allData.filter(d => d.tahun === comparisonYear);
        comparisonYearAveragesByKab = calculateAveragesByKab(comparisonYearRawData);
      }

      const finalPupukDanBenihStats: PupukDanBenihRow[] = [];
      const allKabs = new Set([...thisYearAveragesByKab.keys(), ...(comparisonYearAveragesByKab?.keys() || [])]);

      allKabs.forEach(kab => {
          const thisYearData = thisYearAveragesByKab.get(kab) || {};
          const compYearData = comparisonYearAveragesByKab?.get(kab) || {};
          let row: PupukDanBenihRow = {
              kab: kab, namaKabupaten: getNamaKabupaten(kab)!,
              avgR604_m2: null, avgBenihPerHa_kg_ha: null, avgUreaPerHa_kg_ha: null, avgTSPerHa_kg_ha: null, avgKCLperHa_kg_ha: null, avgNPKPerHa_kg_ha: null, avgKomposPerHa_kg_ha: null, avgOrganikCairPerHa_liter_ha: null, avgZAPerHa_kg_ha: null,
          };
          row = { ...row, ...thisYearData };

          if (comparisonYear) {
              const variables: (keyof PupukDanBenihRow)[] = ['avgR604_m2', 'avgBenihPerHa_kg_ha', 'avgUreaPerHa_kg_ha', 'avgTSPerHa_kg_ha', 'avgKCLperHa_kg_ha', 'avgNPKPerHa_kg_ha', 'avgKomposPerHa_kg_ha', 'avgOrganikCairPerHa_liter_ha', 'avgZAPerHa_kg_ha'];
              variables.forEach(v => {
                  const compKey = `comparison_${v}` as keyof PupukDanBenihRow;
                  const changeKey = `change_${v}` as keyof PupukDanBenihRow;
                  const valThisYear = thisYearData[v] as number | null;
                  const valCompYear = compYearData[v] as number | null;
                  (row as any)[compKey] = valCompYear;
                  if (v !== 'avgR604_m2' && valThisYear != null && valCompYear != null && valCompYear > 0) {
                      (row as any)[changeKey] = ((valThisYear - valCompYear) / valCompYear) * 100;
                  }
              });
          }
          finalPupukDanBenihStats.push(row);
      });
      
      const getProvincialAverages = (rawData: UbinanRawBenihPupuk[]): Partial<PupukDanBenihRow> => {
        const perRecord = rawData.filter(d => typeof d.r604 === 'number' && d.r604 > 0).map(d => {
            const luasHa = d.r604! / 10000;
            return {
                avgR604_m2: d.r604, avgBenihPerHa_kg_ha: typeof d.r608 === 'number' ? d.r608 / luasHa : null, avgUreaPerHa_kg_ha: typeof d.r610_1 === 'number' ? d.r610_1 / luasHa : null, avgTSPerHa_kg_ha: typeof d.r610_2 === 'number' ? d.r610_2 / luasHa : null, avgKCLperHa_kg_ha: typeof d.r610_3 === 'number' ? d.r610_3 / luasHa : null, avgNPKPerHa_kg_ha: typeof d.r610_4 === 'number' ? d.r610_4 / luasHa : null, avgKomposPerHa_kg_ha: typeof d.r610_5 === 'number' ? d.r610_5 / luasHa : null, avgOrganikCairPerHa_liter_ha: typeof d.r610_6 === 'number' ? d.r610_6 / luasHa : null, avgZAPerHa_kg_ha: typeof d.r610_7 === 'number' ? d.r610_7 / luasHa : null,
            };
        });
        if (perRecord.length === 0) return {};
        return {
            avgR604_m2: getAverage(perRecord.map(d => d.avgR604_m2)), avgBenihPerHa_kg_ha: getAverage(perRecord.map(d => d.avgBenihPerHa_kg_ha)), avgUreaPerHa_kg_ha: getAverage(perRecord.map(d => d.avgUreaPerHa_kg_ha)), avgTSPerHa_kg_ha: getAverage(perRecord.map(d => d.avgTSPerHa_kg_ha)), avgKCLperHa_kg_ha: getAverage(perRecord.map(d => d.avgKCLperHa_kg_ha)), avgNPKPerHa_kg_ha: getAverage(perRecord.map(d => d.avgNPKPerHa_kg_ha)), avgKomposPerHa_kg_ha: getAverage(perRecord.map(d => d.avgKomposPerHa_kg_ha)), avgOrganikCairPerHa_liter_ha: getAverage(perRecord.map(d => d.avgOrganikCairPerHa_liter_ha)), avgZAPerHa_kg_ha: getAverage(perRecord.map(d => d.avgZAPerHa_kg_ha)),
        };
      };

      let kalbarData: PupukDanBenihRow | null = thisYearRawData.length > 0 ? { namaKabupaten: 'Kalimantan Barat', ...getProvincialAverages(thisYearRawData) } as PupukDanBenihRow : null;
      
      if (comparisonYear && kalbarData) {
          const kalbarComparisonData = getProvincialAverages(allData.filter(d => d.tahun === comparisonYear));
          const variables: (keyof PupukDanBenihRow)[] = ['avgR604_m2', 'avgBenihPerHa_kg_ha', 'avgUreaPerHa_kg_ha', 'avgTSPerHa_kg_ha', 'avgKCLperHa_kg_ha', 'avgNPKPerHa_kg_ha', 'avgKomposPerHa_kg_ha', 'avgOrganikCairPerHa_liter_ha', 'avgZAPerHa_kg_ha'];
          variables.forEach(v => {
              const compKey = `comparison_${v}` as keyof PupukDanBenihRow;
              const changeKey = `change_${v}` as keyof PupukDanBenihRow;
              const valThisYear = (kalbarData as any)[v];
              const valCompYear = (kalbarComparisonData as any)[v];
              (kalbarData as any)[compKey] = valCompYear;
              if (v !== 'avgR604_m2' && valThisYear != null && valCompYear != null && valCompYear > 0) {
                  (kalbarData as any)[changeKey] = ((valThisYear - valCompYear) / valCompYear) * 100;
              }
          });
      }

      setProcessedData({ 
        pupukDanBenihPerKab: finalPupukDanBenihStats.sort((a,b) => (a.kab || 0) - (b.kab || 0)), 
        kalimantanBaratPupukDanBenih: kalbarData
      });

    } catch (err: any) {
      console.error("Error fetching benih & pupuk data:", err);
      setError(err.message || 'Terjadi kesalahan.');
      setProcessedData({ pupukDanBenihPerKab: [], kalimantanBaratPupukDanBenih: null });
    } finally {
      setIsLoadingData(false);
    }
  }, [selectedYear, comparisonYear, selectedSubround, selectedKomoditas, isLoadingFilters, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { dataBenihDanPupuk: processedData, isLoadingBenihPupuk: isLoadingData, errorBenihPupuk: error };
};