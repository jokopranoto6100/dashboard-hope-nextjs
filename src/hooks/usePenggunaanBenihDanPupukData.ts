// src/hooks/usePenggunaanBenihDanPupukData.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClientComponentSupabaseClient } from '@/lib/supabase';
import { useYear } from '@/context/YearContext';
import { useUbinanEvaluasiFilter } from '@/context/UbinanEvaluasiFilterContext';
import { Tables } from '@/lib/database.types';
import { getNamaKabupaten } from '@/lib/utils'; // Asumsi dari lib/utils

// Interface untuk Output (bisa juga di-ekspor dari file types terpusat jika digunakan di banyak tempat)
export interface BenihRow {
  kab?: number;
  namaKabupaten: string;
  avgR604_m2: number | null; // Rata-rata Luas Tanam (m²)
  avgBenihPerHa_kg_ha: number | null; // Rata-rata Penggunaan Benih per Hektar (Kg/Ha)
}

export interface PupukRow {
  kab?: number;
  namaKabupaten: string;
  avgR604_m2: number | null; // Rata-rata Luas Tanam (m²)
  avgUreaPerHa_kg_ha: number | null;
  avgTSPerHa_kg_ha: number | null;
  avgKCLperHa_kg_ha: number | null;
  avgNPKperHa_kg_ha: number | null;
  avgKomposPerHa_kg_ha: number | null;
  avgOrganikCairPerHa_liter_ha: number | null;
  avgZAPerHa_kg_ha: number | null;
}

type UbinanRawBenihPupuk = Pick<
  Tables<'ubinan_raw'>,
  | 'kab'
  | 'r604' // Luas Tanam (m²)
  | 'r608' // Bibit (Kg)
  | 'r610_1' // Urea (kg)
  | 'r610_2' // TSP (kg)
  | 'r610_3' // KCL (kg)
  | 'r610_4' // NPK (kg)
  | 'r610_5' // Kompos (kg)
  | 'r610_6' // Organik Cair (liter)
  | 'r610_7' // ZA (kg)
>;

const ITEMS_PER_PAGE = 1000;

const getAverage = (arr: (number | null | undefined)[]): number | null => {
  const validNumbers = arr.filter(n => typeof n === 'number' && !isNaN(n)) as number[];
  if (validNumbers.length === 0) return null;
  return validNumbers.reduce((acc, val) => acc + val, 0) / validNumbers.length;
};

export const usePenggunaanBenihDanPupukData = () => {
  const supabase = createClientComponentSupabaseClient();
  const { selectedYear } = useYear();
  const { selectedSubround, selectedKomoditas, isLoadingFilters } = useUbinanEvaluasiFilter();

  const [allFetchedData, setAllFetchedData] = useState<UbinanRawBenihPupuk[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!selectedYear || isLoadingFilters || !selectedKomoditas) {
      setAllFetchedData([]);
      return;
    }
    setIsLoadingData(true);
    setError(null);
    try {
      let fetchedDataAccumulator: UbinanRawBenihPupuk[] = [];
      let currentPage = 0;
      let hasMoreData = true;
      const columnsToSelect = 'kab, r604, r608, r610_1, r610_2, r610_3, r610_4, r610_5, r610_6, r610_7';
      while (hasMoreData) {
        const { from, to } = { from: currentPage * ITEMS_PER_PAGE, to: (currentPage + 1) * ITEMS_PER_PAGE - 1 };
        let query = supabase.from('ubinan_raw').select(columnsToSelect)
          .eq('tahun', selectedYear)
          .eq('komoditas', selectedKomoditas);
        if (selectedSubround !== 'all') query = query.eq('subround', selectedSubround);
        const { data: pageData, error: pageError } = await query.range(from, to);
        if (pageError) throw pageError;
        if (pageData && pageData.length > 0) fetchedDataAccumulator.push(...pageData as UbinanRawBenihPupuk[]);
        if (!pageData || pageData.length < ITEMS_PER_PAGE) hasMoreData = false;
        currentPage++;
      }
      setAllFetchedData(fetchedDataAccumulator);
    } catch (err: any) {
      console.error("Error fetching benih & pupuk data:", err);
      setError(err.message || 'Terjadi kesalahan saat mengambil data benih & pupuk.');
      setAllFetchedData([]);
    } finally {
      setIsLoadingData(false);
    }
  }, [selectedYear, selectedSubround, selectedKomoditas, isLoadingFilters, supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const processedData = useMemo(() => {
    if (allFetchedData.length === 0) {
      return {
        benihPerKab: [],
        pupukPerKab: [],
        kalimantanBaratBenih: null,
        kalimantanBaratPupuk: null,
      };
    }

    const dataForProcessing = allFetchedData
      .filter(d => typeof d.r604 === 'number' && d.r604 > 0) // Pastikan r604 valid
      .map(d => {
        const luasHa = (d.r604 ?? 1) / 10000; // r604 sudah pasti > 0 dari filter
        return {
          kab: d.kab,
          r604: d.r604, // Simpan r604 asli untuk AVG(r604)
          benih_per_ha_record: typeof d.r608 === 'number' ? d.r608 / luasHa : null,
          urea_per_ha_record: typeof d.r610_1 === 'number' ? d.r610_1 / luasHa : null,
          tsp_per_ha_record: typeof d.r610_2 === 'number' ? d.r610_2 / luasHa : null,
          kcl_per_ha_record: typeof d.r610_3 === 'number' ? d.r610_3 / luasHa : null,
          npk_per_ha_record: typeof d.r610_4 === 'number' ? d.r610_4 / luasHa : null,
          kompos_per_ha_record: typeof d.r610_5 === 'number' ? d.r610_5 / luasHa : null,
          organikcair_per_ha_record: typeof d.r610_6 === 'number' ? d.r610_6 / luasHa : null,
          za_per_ha_record: typeof d.r610_7 === 'number' ? d.r610_7 / luasHa : null,
        };
      });

    const groupedByKab = dataForProcessing.reduce((acc, curr) => {
      const kabKey = String(curr.kab);
      if (!acc[kabKey]) acc[kabKey] = [];
      acc[kabKey].push(curr);
      return acc;
    }, {} as Record<string, typeof dataForProcessing>);

    const benihPerKabArr: BenihRow[] = [];
    const pupukPerKabArr: PupukRow[] = [];
    
    const uniqueKabs = new Set(dataForProcessing.map(d => d.kab).filter(k => k !== null && k !== undefined) as number[]);

    uniqueKabs.forEach(kabCode => {
      const kabNum = Number(kabCode);
      const namaKab = getNamaKabupaten(kabNum) || `Kode ${kabNum}`;
      const kabData = groupedByKab[String(kabCode)] || [];

      if (kabData.length > 0) {
        const avgR604_m2_kab = getAverage(kabData.map(d => d.r604));
        
        benihPerKabArr.push({
          kab: kabNum,
          namaKabupaten: namaKab,
          avgR604_m2: avgR604_m2_kab,
          avgBenihPerHa_kg_ha: getAverage(kabData.map(d => d.benih_per_ha_record)),
        });

        pupukPerKabArr.push({
          kab: kabNum,
          namaKabupaten: namaKab,
          avgR604_m2: avgR604_m2_kab,
          avgUreaPerHa_kg_ha: getAverage(kabData.map(d => d.urea_per_ha_record)),
          avgTSPerHa_kg_ha: getAverage(kabData.map(d => d.tsp_per_ha_record)),
          avgKCLperHa_kg_ha: getAverage(kabData.map(d => d.kcl_per_ha_record)),
          avgNPKperHa_kg_ha: getAverage(kabData.map(d => d.npk_per_ha_record)),
          avgKomposPerHa_kg_ha: getAverage(kabData.map(d => d.kompos_per_ha_record)),
          avgOrganikCairPerHa_liter_ha: getAverage(kabData.map(d => d.organikcair_per_ha_record)),
          avgZAPerHa_kg_ha: getAverage(kabData.map(d => d.za_per_ha_record)),
        });
      }
    });

    benihPerKabArr.sort((a, b) => (a.kab || 0) - (b.kab || 0));
    pupukPerKabArr.sort((a, b) => (a.kab || 0) - (b.kab || 0));

    let kalBarBenih: BenihRow | null = null;
    let kalBarPupuk: PupukRow | null = null;

    if (dataForProcessing.length > 0) {
      const avgR604Kalbar = getAverage(dataForProcessing.map(d => d.r604));
      kalBarBenih = {
        namaKabupaten: "Kalimantan Barat",
        avgR604_m2: avgR604Kalbar,
        avgBenihPerHa_kg_ha: getAverage(dataForProcessing.map(d => d.benih_per_ha_record)),
      };
      kalBarPupuk = {
        namaKabupaten: "Kalimantan Barat",
        avgR604_m2: avgR604Kalbar,
        avgUreaPerHa_kg_ha: getAverage(dataForProcessing.map(d => d.urea_per_ha_record)),
        avgTSPerHa_kg_ha: getAverage(dataForProcessing.map(d => d.tsp_per_ha_record)),
        avgKCLperHa_kg_ha: getAverage(dataForProcessing.map(d => d.kcl_per_ha_record)),
        avgNPKperHa_kg_ha: getAverage(dataForProcessing.map(d => d.npk_per_ha_record)),
        avgKomposPerHa_kg_ha: getAverage(dataForProcessing.map(d => d.kompos_per_ha_record)),
        avgOrganikCairPerHa_liter_ha: getAverage(dataForProcessing.map(d => d.organikcair_per_ha_record)),
        avgZAPerHa_kg_ha: getAverage(dataForProcessing.map(d => d.za_per_ha_record)),
      };
    }

    return {
      benihPerKab: benihPerKabArr,
      pupukPerKab: pupukPerKabArr,
      kalimantanBaratBenih: kalBarBenih,
      kalimantanBaratPupuk: kalBarPupuk,
    };
  }, [allFetchedData]);

  return {
    dataBenihPupuk: processedData, // Ganti nama agar lebih jelas
    isLoadingBenihPupuk: isLoadingData || isLoadingFilters, // Ganti nama
    errorBenihPupuk: error, // Ganti nama
    refreshBenihPupukData: fetchData, // Ganti nama
  };
};