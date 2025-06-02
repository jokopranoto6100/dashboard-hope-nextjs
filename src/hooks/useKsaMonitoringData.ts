// src/hooks/useKsaMonitoringData.ts
import { useState, useEffect } from 'react';
import { createClientComponentSupabaseClient } from '@/lib/supabase';
import { useYear } from '@/context/YearContext';

// ... (Interface KsaAmatanRow, ProcessedKsaData, KsaTotals tetap sama) ...
interface KsaAmatanRow {
  id: number; id_segmen: string | null; subsegmen: string | null; nama: string | null;
  n: number | null; amatan: string | null; status: string | null; evaluasi: string | null;
  tanggal: string; flag_kode_12: string | null; note: string | null; kode_kab: string | null;
  kode_kec: string | null; kabupaten: string | null; bulan: number | null; tahun: number | null;
}
export interface ProcessedKsaData {
  kabupaten: string; kode_kab: string; target: number; realisasi: number;
  persentase: number; inkonsisten: number; kode_12: number;
}
export interface KsaTotals {
  target: number; realisasi: number; persentase: number;
  inkonsisten: number; kode_12: number;
}

// Tambahkan tipe untuk behavior
type FetchBehavior = 'autoFallback' | 'directFetch';

export const useKsaMonitoringData = (
  requestedMonth: string | undefined, // Bulan yang diminta oleh UI
  behavior: FetchBehavior = 'directFetch' // Default behavior
) => {
  const supabase = createClientComponentSupabaseClient();
  const { selectedYear } = useYear();
  const [data, setData] = useState<ProcessedKsaData[]>([]);
  const [ksaTotals, setKsaTotals] = useState<KsaTotals | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  // State baru untuk menyimpan bulan yang datanya akhirnya ditampilkan
  const [effectiveDisplayMonth, setEffectiveDisplayMonth] = useState<string | undefined>(requestedMonth);

  useEffect(() => {
    const fetchDataForMonth = async (year: number, monthStr: string | undefined): Promise<KsaAmatanRow[]> => {
      let allRawData: KsaAmatanRow[] = [];
      if (!monthStr || monthStr === "Semua") { // Jika "Semua" atau undefined, fetch semua bulan untuk tahun tsb
        // Logika fetch semua data untuk tahun tertentu (tanpa filter bulan)
        let currentPage = 0;
        const itemsPerPage = 1000;
        const selectColumns = ['kabupaten', 'kode_kab', 'subsegmen', 'n', 'evaluasi', 'flag_kode_12', 'tanggal', 'tahun', 'bulan'];
        while(true) {
            const { data: pageData, error: dbError } = await supabase
                .from('ksa_amatan')
                .select(selectColumns.join(','))
                .eq('tahun', year)
                .range(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage - 1);
            if (dbError) throw dbError;
            if (pageData) allRawData = allRawData.concat(pageData as KsaAmatanRow[]);
            if (!pageData || pageData.length < itemsPerPage) break;
            currentPage++;
        }
        return allRawData;
      }

      // Logika fetch data untuk bulan spesifik
      const monthNum = parseInt(monthStr);
      let currentPage = 0;
      const itemsPerPage = 1000;
      const selectColumns = ['kabupaten', 'kode_kab', 'subsegmen', 'n', 'evaluasi', 'flag_kode_12', 'tanggal', 'tahun', 'bulan'];
      while(true) {
        const { data: pageData, error: dbError } = await supabase
            .from('ksa_amatan')
            .select(selectColumns.join(','))
            .eq('tahun', year)
            .eq('bulan', monthNum)
            .range(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage - 1);
        if (dbError) throw dbError;
        if (pageData) allRawData = allRawData.concat(pageData as KsaAmatanRow[]);
        if (!pageData || pageData.length < itemsPerPage) break;
        currentPage++;
      }
      return allRawData;
    };

    const processRawData = (rawData: KsaAmatanRow[]) => {
        if (!rawData || rawData.length === 0) {
            setData([]);
            setKsaTotals(null);
            // lastUpdated tidak di-set jika tidak ada data
            return;
        }

        let maxTs: Date | null = null;
        rawData.forEach(item => {
            if (item.tanggal) {
                const currentTs = new Date(item.tanggal);
                if (!maxTs || currentTs > maxTs) maxTs = currentTs;
            }
        });
        setLastUpdated(maxTs ? maxTs.toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'long'}) : null);

        const groupedMap = new Map<string, {
            kode_kab: string; targetCount: number; realisasiCount: number;
            inkonsistenCount: number; nIs12Count: number; flagKode12Count: number;
        }>();
        let ovTarget = 0, ovRealisasi = 0, ovInkonsisten = 0, ovN12 = 0, ovF12 = 0;

        rawData.forEach(item => {
            if (!item.kabupaten || !item.kode_kab) return;
            if (!groupedMap.has(item.kabupaten)) {
                groupedMap.set(item.kabupaten, {
                    kode_kab: item.kode_kab, targetCount: 0, realisasiCount: 0,
                    inkonsistenCount: 0, nIs12Count: 0, flagKode12Count: 0,
                });
            }
            const group = groupedMap.get(item.kabupaten)!;
            if (item.subsegmen !== null && item.subsegmen.trim() !== '') { group.targetCount++; ovTarget++; }
            if (item.n !== null && item.n !== undefined) {
                group.realisasiCount++; ovRealisasi++;
                if (item.n === 12) { group.nIs12Count++; ovN12++; }
            }
            if (item.evaluasi === 'Inkonsisten') { group.inkonsistenCount++; ovInkonsisten++; }
            if (item.flag_kode_12 !== null && item.flag_kode_12.trim() !== '') { group.flagKode12Count++; ovF12++; }
        });

        const processedArray: ProcessedKsaData[] = Array.from(groupedMap.entries()).map(([kab, grp]) => ({
            kabupaten: kab, kode_kab: grp.kode_kab, target: grp.targetCount, realisasi: grp.realisasiCount,
            persentase: grp.targetCount > 0 ? parseFloat(((grp.realisasiCount / grp.targetCount) * 100).toFixed(2)) : 0,
            inkonsisten: grp.inkonsistenCount, kode_12: grp.nIs12Count + grp.flagKode12Count,
        })).sort((a, b) => a.kode_kab.localeCompare(b.kode_kab));
        setData(processedArray);

        const totalKode12 = ovN12 + ovF12;
        const ovPersentase = ovTarget > 0 ? parseFloat(((ovRealisasi / ovTarget) * 100).toFixed(2)) : 0;
        setKsaTotals({
            target: ovTarget, realisasi: ovRealisasi, persentase: ovPersentase,
            inkonsisten: ovInkonsisten, kode_12: totalKode12
        });
    };

    const executeLogic = async () => {
      if (!selectedYear) {
        setData([]); setKsaTotals(null); setLastUpdated(null); setIsLoading(false);
        setEffectiveDisplayMonth(requestedMonth);
        return;
      }

      setIsLoading(true); setError(null); setLastUpdated(null);

      let dataToProcess: KsaAmatanRow[] = [];
      let finalMonthForDisplay = requestedMonth;

      if (behavior === 'autoFallback' && requestedMonth && requestedMonth !== "Semua") {
        // 1. Coba fetch data untuk bulan yang diminta (bulan ini)
        dataToProcess = await fetchDataForMonth(selectedYear, requestedMonth);

        // 2. Jika kosong, coba fetch untuk bulan lalu
        if (dataToProcess.length === 0) {
          const currentMonthNum = parseInt(requestedMonth);
          const previousMonthNum = currentMonthNum === 1 ? 12 : currentMonthNum - 1;
          // TODO: Jika fallback ke Des dari Jan, idealnya tahun juga mundur. Untuk saat ini, asumsi dalam tahun yang sama.
          finalMonthForDisplay = String(previousMonthNum);
          dataToProcess = await fetchDataForMonth(selectedYear, finalMonthForDisplay);
        } else {
          finalMonthForDisplay = requestedMonth;
        }
      } else {
        // Behavior 'directFetch' atau "Semua" bulan
        dataToProcess = await fetchDataForMonth(selectedYear, requestedMonth);
        finalMonthForDisplay = requestedMonth;
      }
      
      processRawData(dataToProcess);
      setEffectiveDisplayMonth(finalMonthForDisplay); // Set bulan yang datanya ditampilkan

      setIsLoading(false);
    };

    executeLogic().catch(err => {
      console.error("Error fetching KSA data:", err);
      setError((err as Error).message || 'Gagal mengambil data KSA.');
      setData([]); setKsaTotals(null);
      setEffectiveDisplayMonth(requestedMonth); // Kembali ke permintaan awal jika error
      setIsLoading(false);
    });

  }, [selectedYear, requestedMonth, behavior, supabase]); // Tambahkan behavior & supabase ke dependencies

  return { data, ksaTotals, isLoading, error, lastUpdated, effectiveDisplayMonth };
};