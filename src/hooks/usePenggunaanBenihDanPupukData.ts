// src/hooks/usePenggunaanBenihDanPupukData.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useYear } from '@/context/YearContext';
import { useUbinanEvaluasiFilter } from '@/context/UbinanEvaluasiFilterContext';
import { PupukDanBenihRow } from '../app/(dashboard)/evaluasi/ubinan/types';

// HAPUS: Semua konstanta dan fungsi helper seperti ITEMS_PER_PAGE, getAverage, dll. tidak diperlukan lagi.

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
    // Cek kondisi awal, sama seperti sebelumnya
    if (!selectedYear || isLoadingFilters || !selectedKomoditas) {
      setProcessedData({ pupukDanBenihPerKab: [], kalimantanBaratPupukDanBenih: null });
      return;
    }
    setIsLoadingData(true);
    setError(null);

    try {
      // =======================================================================
      // AWAL PERUBAHAN UTAMA
      // =======================================================================

      // 1. Panggil RPC yang baru kita buat di Langkah 4.
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_pupuk_benih_stats', {
        tahun_val: selectedYear,
        komoditas_val: selectedKomoditas,
        subround_filter: selectedSubround === 'all' ? 'all' : String(selectedSubround),
        comparison_tahun_val: comparisonYear
      });

      if (rpcError) throw rpcError;

      // 2. Data dari RPC sudah matang. Kita hanya perlu memetakannya ke tipe data
      //    camelCase yang digunakan di front-end.
      const mappedData = rpcData.map((d: any) => ({
        kab: d.kab,
        namaKabupaten: d.nama_kabupaten,
        avgR604_m2: d.avg_r604_m2,
        avgBenihPerHa_kg_ha: d.avg_benih_per_ha_kg_ha,
        avgUreaPerHa_kg_ha: d.avg_urea_per_ha_kg_ha,
        avgTSPerHa_kg_ha: d.avg_ts_per_ha_kg_ha,
        avgKCLperHa_kg_ha: d.avg_kcl_per_ha_kg_ha,
        avgNPKPerHa_kg_ha: d.avg_npk_per_ha_kg_ha,
        avgKomposPerHa_kg_ha: d.avg_kompos_per_ha_kg_ha,
        avgOrganikCairPerHa_liter_ha: d.avg_organik_cair_per_ha_liter_ha,
        avgZAPerHa_kg_ha: d.avg_za_per_ha_kg_ha,
        comparison_avgR604_m2: d.comparison_avg_r604_m2,
        comparison_avgBenihPerHa_kg_ha: d.comparison_avg_benih_per_ha_kg_ha,
        comparison_avgUreaPerHa_kg_ha: d.comparison_avg_urea_per_ha_kg_ha,
        comparison_avgTSPerHa_kg_ha: d.comparison_avg_ts_per_ha_kg_ha,
        comparison_avgKCLperHa_kg_ha: d.comparison_avg_kcl_per_ha_kg_ha,
        comparison_avgNPKPerHa_kg_ha: d.comparison_avg_npk_per_ha_kg_ha,
        comparison_avgKomposPerHa_kg_ha: d.comparison_avg_kompos_per_ha_kg_ha,
        comparison_avgOrganikCairPerHa_liter_ha: d.comparison_avg_organik_cair_per_ha_liter_ha,
        comparison_avgZAPerHa_kg_ha: d.comparison_avg_za_per_ha_kg_ha,
        change_avgBenihPerHa_kg_ha: d.change_avg_benih_per_ha_kg_ha,
        change_avgUreaPerHa_kg_ha: d.change_avg_urea_per_ha_kg_ha,
        change_avgTSPerHa_kg_ha: d.change_avg_ts_per_ha_kg_ha,
        change_avgKCLperHa_kg_ha: d.change_avg_kcl_per_ha_kg_ha,
        change_avgNPKPerHa_kg_ha: d.change_avg_npk_per_ha_kg_ha,
        change_avgKomposPerHa_kg_ha: d.change_avg_kompos_per_ha_kg_ha,
        change_avgOrganikCairPerHa_liter_ha: d.change_avg_organik_cair_per_ha_liter_ha,
        change_avgZAPerHa_kg_ha: d.change_avg_za_per_ha_kg_ha,
      })) as PupukDanBenihRow[];

      // 3. Pisahkan data total provinsi dari data per kabupaten, sama seperti sebelumnya.
      const kalbarData = mappedData.find(d => d.namaKabupaten === 'Kalimantan Barat') || null;
      const kabData = mappedData.filter(d => d.namaKabupaten !== 'Kalimantan Barat');

      setProcessedData({
        pupukDanBenihPerKab: kabData,
        kalimantanBaratPupukDanBenih: kalbarData
      });

      // =======================================================================
      // AKHIR PERUBAHAN UTAMA
      // =======================================================================

    } catch (err: unknown) {
      console.error("Error fetching from RPC get_pupuk_benih_stats:", err);
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat memanggil data pupuk & benih.';
      setError(errorMessage);
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