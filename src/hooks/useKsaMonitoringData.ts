// src/hooks/useKsaMonitoringData.ts
import { useState, useEffect, useContext } from 'react';
import { createClientComponentSupabaseClient } from '@/lib/supabase'; //
import { useYear } from '@/context/YearContext'; //

interface KsaAmatanRow {
  id: number;
  id_segmen: string | null;
  subsegmen: string | null;
  nama: string | null;
  n: number | null;
  amatan: string | null;
  status: string | null;
  evaluasi: string | null; //
  tanggal: string;
  flag_kode_12: string | null; //
  note: string | null;
  kode_kab: string | null; //
  kode_kec: string | null;
  kabupaten: string | null; //
  bulan: number | null; //
  tahun: number | null; //
}

export interface ProcessedKsaData {
  kabupaten: string;
  kode_kab: string;
  target: number; //
  realisasi: number; //
  persentase: number; //
  inkonsisten: number; //
  kode_12: number; //
}

export interface KsaTotals {
    target: number;
    realisasi: number;
    persentase: number;
    inkonsisten: number;
    kode_12: number;
}


export const useKsaMonitoringData = (selectedMonthParams?: string) => {
  const supabase = createClientComponentSupabaseClient(); //
  const { selectedYear } = useYear(); //
  const [data, setData] = useState<ProcessedKsaData[]>([]);
  const [ksaTotals, setKsaTotals] = useState<KsaTotals | null>(null); // Mengganti nama state totals
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedYear) {
        setData([]);
        setKsaTotals(null); // Menggunakan KsaTotals
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
        const itemsPerPage = 1000; //

        const selectColumns = [
          'kabupaten', 'kode_kab', 'subsegmen', 'n',
          'evaluasi', 'flag_kode_12', 'tanggal', 'tahun', 'bulan'
        ]; //

        while (true) {
          let query = supabase
            .from('ksa_amatan') //
            .select(selectColumns.join(',')) //
            .eq('tahun', selectedYear); //

          if (selectedMonthParams && selectedMonthParams !== "Semua") {
            query = query.eq('bulan', parseInt(selectedMonthParams)); //
          }
          
          const { data: pageData, error: dbError } = await query
            .range(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage - 1) //
            .order('tanggal', { ascending: false }); //

          if (dbError) {
            throw dbError;
          }

          if (pageData) {
            allRawKsaData = allRawKsaData.concat(pageData as KsaAmatanRow[]); //
          }

          if (!pageData || pageData.length < itemsPerPage) { //
            break; 
          }
          currentPage++; //
        }

        if (!allRawKsaData || allRawKsaData.length === 0) {
          setData([]);
          setKsaTotals(null); // Menggunakan KsaTotals
          setIsLoading(false);
          return;
        }
        
        let maxTimestamp: Date | null = null; //
        allRawKsaData.forEach(item => {
            if (item.tanggal) { //
                const currentTimestamp = new Date(item.tanggal); //
                if (!maxTimestamp || currentTimestamp > maxTimestamp) { //
                    maxTimestamp = currentTimestamp; //
                }
            }
        });
        setLastUpdated(maxTimestamp ? maxTimestamp.toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'long'}) : null); //

        const groupedDataMap = new Map<string, {
          kode_kab: string;
          targetCount: number;
          realisasiCount: number;
          inkonsistenCount: number;
          nIs12Count: number;
          flagKode12Count: number;
        }>();

        // Inisialisasi variabel untuk total keseluruhan
        let overallTarget = 0;
        let overallRealisasi = 0;
        let overallInkonsisten = 0;
        let overallKode12N = 0;
        let overallKode12Flag = 0;

        allRawKsaData.forEach((item: KsaAmatanRow) => {
          if (!item.kabupaten || !item.kode_kab) return; 

          if (!groupedDataMap.has(item.kabupaten)) {
            groupedDataMap.set(item.kabupaten, {
              kode_kab: item.kode_kab,
              targetCount: 0,
              realisasiCount: 0,
              inkonsistenCount: 0,
              nIs12Count: 0,
              flagKode12Count: 0,
            });
          }

          const group = groupedDataMap.get(item.kabupaten)!;

          if (item.subsegmen !== null && item.subsegmen.trim() !== '') { //
            group.targetCount++;
            overallTarget++; // Akumulasi total target
          }

          if (item.n !== null && item.n !== undefined) {  //
            group.realisasiCount++;
            overallRealisasi++; // Akumulasi total realisasi
            if (item.n === 12) { //
              group.nIs12Count++;
              overallKode12N++; // Akumulasi total untuk n=12
            }
          }
          // Pastikan menggunakan 'inkonsisten' (lowercase 'i') sesuai permintaan awal
          if (item.evaluasi === 'Inkonsisten') { //
            group.inkonsistenCount++;
            overallInkonsisten++; // Akumulasi total inkonsisten
          }
          if (item.flag_kode_12 !== null && item.flag_kode_12 !== undefined && item.flag_kode_12.trim() !== '') { //
            group.flagKode12Count++;
            overallKode12Flag++; // Akumulasi total untuk flag_kode_12
          }
        });
        
        const processedDataArray: ProcessedKsaData[] = Array.from(groupedDataMap.entries()).map(([kabupaten, group]) => {
          const target = group.targetCount; //
          const realisasi = group.realisasiCount; //
          const persentase = target > 0 ? parseFloat(((realisasi / target) * 100).toFixed(2)) : 0; //
          const kode_12 = group.nIs12Count + group.flagKode12Count; //

          return {
            kabupaten,
            kode_kab: group.kode_kab,
            target,
            realisasi,
            persentase,
            inkonsisten: group.inkonsistenCount, //
            kode_12,
          };
        }).sort((a, b) => a.kode_kab.localeCompare(b.kode_kab)); //

        setData(processedDataArray);

        const totalKode12 = overallKode12N + overallKode12Flag;
        const overallPersentase = overallTarget > 0 ? parseFloat(((overallRealisasi / overallTarget) * 100).toFixed(2)) : 0;

        setKsaTotals({ // Menggunakan KsaTotals
            target: overallTarget,
            realisasi: overallRealisasi,
            persentase: overallPersentase,
            inkonsisten: overallInkonsisten,
            kode_12: totalKode12
        });

      } catch (err: any) {
        console.error("Error fetching KSA data:", err);
        setError(err.message || 'Gagal mengambil data KSA.');
        setData([]);
        setKsaTotals(null); // Menggunakan KsaTotals
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, selectedMonthParams, supabase]); //

  return { data, totals: ksaTotals, isLoading, error, lastUpdated }; // Mengembalikan ksaTotals sebagai totals
};