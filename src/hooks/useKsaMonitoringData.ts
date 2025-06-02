// src/hooks/useKsaMonitoringData.ts
import { useState, useEffect, useContext } from 'react';
import { createClientComponentSupabaseClient } from '@/lib/supabase';
import { useYear } from '@/context/YearContext';

// ... (Interface KsaAmatanRow, ProcessedKsaData, KsaTotals tetap sama) ...
interface KsaAmatanRow {
  id: number;
  id_segmen: string | null;
  subsegmen: string | null;
  nama: string | null;
  n: number | null; // float4
  amatan: string | null;
  status: string | null;
  evaluasi: string | null;
  tanggal: string; // timestamp
  flag_kode_12: string | null;
  note: string | null;
  kode_kab: string | null;
  kode_kec: string | null;
  kabupaten: string | null;
  bulan: number | null;
  tahun: number | null;
}

export interface ProcessedKsaData {
  kabupaten: string;
  kode_kab: string;
  target: number;
  realisasi: number;
  persentase: number;
  inkonsisten: number;
  kode_12: number;
}

export interface KsaTotals {
    target: number;
    realisasi: number;
    persentase: number;
    inkonsisten: number;
    kode_12: number;
}


export const useKsaMonitoringData = (selectedMonthParams?: string) => {
  const supabase = createClientComponentSupabaseClient();
  const { selectedYear } = useYear();
  const [data, setData] = useState<ProcessedKsaData[]>([]);
  const [totals, setTotals] = useState<KsaTotals | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedYear) {
        setData([]);
        setTotals(null);
        setLastUpdated(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setLastUpdated(null);

      try {
        let allRawKsaData: KsaAmatanRow[] = [];
        let currentPage = 0;
        const itemsPerPage = 1000;

        const selectColumns = [
          'kabupaten',
          'kode_kab',
          'subsegmen', // Pastikan subsegmen diambil
          'n',
          'evaluasi',
          'flag_kode_12',
          'tanggal',
          'tahun',
          'bulan'
        ];

        while (true) {
          let query = supabase
            .from('ksa_amatan')
            .select(selectColumns.join(','))
            .eq('tahun', selectedYear);

          if (selectedMonthParams && selectedMonthParams !== "Semua") {
            query = query.eq('bulan', parseInt(selectedMonthParams));
          }
          
          const { data: pageData, error: dbError } = await query
            .range(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage - 1)
            .order('tanggal', { ascending: false });

          if (dbError) {
            throw dbError;
          }

          if (pageData) {
            allRawKsaData = allRawKsaData.concat(pageData as KsaAmatanRow[]);
          }

          if (!pageData || pageData.length < itemsPerPage) {
            break; 
          }
          currentPage++;
        }

        if (!allRawKsaData || allRawKsaData.length === 0) {
          setData([]);
          setTotals(null);
          setIsLoading(false);
          return;
        }
        
        let maxTimestamp: Date | null = null;
        allRawKsaData.forEach(item => {
            if (item.tanggal) {
                const currentTimestamp = new Date(item.tanggal);
                if (!maxTimestamp || currentTimestamp > maxTimestamp) {
                    maxTimestamp = currentTimestamp;
                }
            }
        });
        setLastUpdated(maxTimestamp ? maxTimestamp.toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'long'}) : null);

        // Modifikasi di sini untuk penghitungan Target
        const groupedDataMap = new Map<string, {
          kode_kab: string;
          // subsegmenSet: Set<string>; // Tidak lagi menggunakan Set untuk target
          targetCount: number; // Mengganti subsegmenSet dengan targetCount
          realisasiCount: number;
          inkonsistenCount: number;
          nIs12Count: number;
          flagKode12Count: number;
        }>();

        allRawKsaData.forEach((item: KsaAmatanRow) => {
          if (!item.kabupaten || !item.kode_kab) return; 

          if (!groupedDataMap.has(item.kabupaten)) {
            groupedDataMap.set(item.kabupaten, {
              kode_kab: item.kode_kab,
              targetCount: 0, // Inisialisasi targetCount
              realisasiCount: 0,
              inkonsistenCount: 0,
              nIs12Count: 0,
              flagKode12Count: 0,
            });
          }

          const group = groupedDataMap.get(item.kabupaten)!;

          // Hitung sebagai target jika kolom subsegmen memiliki isian (tidak null dan tidak string kosong)
          if (item.subsegmen !== null && item.subsegmen.trim() !== '') {
            group.targetCount++;
          }

          if (item.n !== null && item.n !== undefined) { 
            group.realisasiCount++;
            if (item.n === 12) {
              group.nIs12Count++;
            }
          }
          if (item.evaluasi === 'Inkonsisten') { 
            group.inkonsistenCount++;
          }
          if (item.flag_kode_12 !== null && item.flag_kode_12 !== undefined && item.flag_kode_12.trim() !== '') { 
            group.flagKode12Count++;
          }
        });
        
        const processedDataArray: ProcessedKsaData[] = Array.from(groupedDataMap.entries()).map(([kabupaten, group]) => {
          const target = group.targetCount; // Menggunakan targetCount
          const realisasi = group.realisasiCount;
          const persentase = target > 0 ? parseFloat(((realisasi / target) * 100).toFixed(2)) : 0;
          const kode_12 = group.nIs12Count + group.flagKode12Count; 

          return {
            kabupaten,
            kode_kab: group.kode_kab,
            target, // Target yang sudah diperbaiki
            realisasi,
            persentase,
            inkonsisten: group.inkonsistenCount,
            kode_12,
          };
        }).sort((a, b) => a.kode_kab.localeCompare(b.kode_kab)); 

        setData(processedDataArray);

        const overallTotals = processedDataArray.reduce((acc, curr) => {
            acc.target += curr.target;
            acc.realisasi += curr.realisasi;
            acc.inkonsisten += curr.inkonsisten;
            acc.kode_12 += curr.kode_12;
            return acc;
        }, { target: 0, realisasi: 0, persentase: 0, inkonsisten: 0, kode_12: 0 } as KsaTotals);
        
        overallTotals.persentase = overallTotals.target > 0 ? parseFloat(((overallTotals.realisasi / overallTotals.target) * 100).toFixed(2)) : 0;
        setTotals(overallTotals);

      } catch (err: any) {
        console.error("Error fetching KSA data:", err);
        setError(err.message || 'Gagal mengambil data KSA.');
        setData([]);
        setTotals(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, selectedMonthParams, supabase]);

  return { data, totals, isLoading, error, lastUpdated };
};