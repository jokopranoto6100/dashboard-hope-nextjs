// src/hooks/usePalawijaMonitoringData.ts
import { useState, useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";
import { toast } from 'sonner';

// Impor tipe dari lokasi baru di dalam folder fitur
import { PalawijaDataRow, PalawijaTotals } from '@/app/(dashboard)/monitoring/ubinan/types';

const KAB_CODE_TO_NAME: { [key: string]: string } = {
  '1': 'Sambas',
  '2': 'Bengkayang',
  '3': 'Landak',
  '4': 'Mempawah',
  '5': 'Sanggau',
  '6': 'Ketapang',
  '7': 'Sintang',
  '8': 'Kapuas Hulu',
  '9': 'Sekadau',
  '10': 'Melawi',
  '11': 'Kayong Utara',
  '12': 'Kubu Raya',
  '71': 'Pontianak',
  '72': 'Singkawang',
};

// Definisikan tipe untuk return value hook ini
interface PalawijaMonitoringDataHook {
  processedPalawijaData: PalawijaDataRow[] | null;
  palawijaTotals: PalawijaTotals | null;
  loadingPalawija: boolean;
  errorPalawija: string | null;
  lastUpdatePalawija: string | null;
}

export const usePalawijaMonitoringData = (selectedYear: number, selectedSubround: string): PalawijaMonitoringDataHook => {
  const { supabase } = useAuth();
  
  const [processedPalawijaData, setProcessedPalawijaData] = useState<PalawijaDataRow[] | null>(null);
  const [palawijaTotals, setPalawijaTotals] = useState<PalawijaTotals | null>(null);
  const [loadingPalawija, setLoadingPalawija] = useState(true);
  const [errorPalawija, setErrorPalawija] = useState<string | null>(null);
  const [lastUpdatePalawija, setLastUpdatePalawija] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndProcessPalawijaData = async () => {
      setLoadingPalawija(true);
      setErrorPalawija(null);
      setLastUpdatePalawija(null);

      let allRawPalawijaData: any[] = [];
      let currentPage = 0;
      const itemsPerPage = 1000;

      const selectColumns = [
        'kab',
        'prioritas',
        'r701',
        'validasi',
        'komoditas',
        'tahun',
        'subround',
        'uploaded_at'
      ];

      while (true) {
        let queryPalawija = supabase
          .from('ubinan_raw')
          .select(selectColumns.join(','));

        queryPalawija = queryPalawija.eq('tahun', selectedYear);
        if (selectedSubround !== 'all') {
          queryPalawija = queryPalawija.eq('subround', parseInt(selectedSubround));
        }
        queryPalawija = queryPalawija.not('komoditas', 'ilike', '%padi%');

        const { data, error } = await queryPalawija
          .range(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage - 1);

        if (error) {
          setErrorPalawija(error.message);
          toast.error('Gagal memuat data Ubinan Palawija', { description: error.message });
          setLoadingPalawija(false);
          return;
        }
        if (data) allRawPalawijaData = allRawPalawijaData.concat(data);
        if (!data || data.length < itemsPerPage) break;
        currentPage++;
      }

      const groupedData: {
        [key: string]: {
          nmkab: string;
          kab_sort_key: string;
          target: number;
          realisasi: number;
          clean: number;
          warning: number;
          error: number;
        }
      } = {};

      let totalTarget = 0;
      let totalRealisasi = 0;
      let totalClean = 0;
      let totalWarning = 0;
      let totalError = 0;
      let maxTimestamp: Date | null = null;

      if (allRawPalawijaData) {
        allRawPalawijaData.forEach(row => {
          const kabValue = row.kab;
          let displayName: string;
          let groupAndSortKey: string;

          const kabCodeString = (kabValue !== null && kabValue !== undefined) ? String(kabValue).trim() : '';

          if (kabCodeString && KAB_CODE_TO_NAME[kabCodeString]) {
            displayName = KAB_CODE_TO_NAME[kabCodeString];
            groupAndSortKey = kabCodeString;
          } else if (kabCodeString) {
            displayName = `Kabupaten/Kota (Kode: ${kabCodeString})`;
            groupAndSortKey = kabCodeString;
          } else {
            displayName = "Kabupaten Tidak Diketahui";
            groupAndSortKey = "zzzz_UnknownKab";
          }
          
          if (!groupedData[groupAndSortKey]) {
            groupedData[groupAndSortKey] = {
              nmkab: displayName,
              kab_sort_key: groupAndSortKey,
              target: 0,
              realisasi: 0,
              clean: 0,
              warning: 0,
              error: 0,
            };
          }

          if (row.prioritas === "UTAMA") {
            groupedData[groupAndSortKey].target += 1;
            totalTarget += 1;
          }

          if (row.r701 !== null && row.r701 !== undefined && String(row.r701).trim() !== '') {
            groupedData[groupAndSortKey].realisasi += 1;
            totalRealisasi += 1;

            if (row.validasi === 'CLEAN') {
              groupedData[groupAndSortKey].clean += 1;
              totalClean += 1;
            } else if (row.validasi === 'WARNING') {
              groupedData[groupAndSortKey].warning += 1;
              totalWarning += 1;
            } else if (row.validasi === 'ERROR') {
              groupedData[groupAndSortKey].error += 1;
              totalError += 1;
            }
          }
          
          if (row.uploaded_at) {
            const currentTimestamp = new Date(row.uploaded_at);
            if (!maxTimestamp || currentTimestamp > maxTimestamp) maxTimestamp = currentTimestamp;
          }
        });
      }

      const finalProcessedData = Object.values(groupedData).map(item => ({
        ...item,
        persentase: item.target > 0 ? ((item.realisasi / item.target) * 100).toFixed(2) : "0.00"
      })).sort((a, b) => {
        const fallbackSortString = "zzzz_UnknownKab";

        const isAFallback = a.kab_sort_key === fallbackSortString;
        const isBFallback = b.kab_sort_key === fallbackSortString;

        if (isAFallback && isBFallback) return 0;
        if (isAFallback) return 1;
        if (isBFallback) return -1;

        const numA = parseInt(a.kab_sort_key, 10);
        const numB = parseInt(b.kab_sort_key, 10);

        if (isNaN(numA) && isNaN(numB)) return a.kab_sort_key.localeCompare(b.kab_sort_key);
        if (isNaN(numA)) return 1;
        if (isNaN(numB)) return -1;

        return numA - numB;
      });

      const totalPersentase = totalTarget > 0 ? ((totalRealisasi / totalTarget) * 100) : 0;

      setPalawijaTotals({
        target: totalTarget,
        realisasi: totalRealisasi,
        clean: totalClean,
        warning: totalWarning,
        error: totalError,
        persentase: parseFloat(totalPersentase.toFixed(2))
      });
      setProcessedPalawijaData(finalProcessedData);
      setLoadingPalawija(false);

      if (maxTimestamp) {
        setLastUpdatePalawija((maxTimestamp as Date).toLocaleString('id-ID', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        }));
      } else {
        const anyTimestamp = allRawPalawijaData.find(d => d.uploaded_at)?.uploaded_at;
        if (anyTimestamp) {
            setLastUpdatePalawija(new Date(anyTimestamp).toLocaleString('id-ID', {
                year: 'numeric', month: 'long', day: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            }));
        } else {
            setLastUpdatePalawija('N/A');
        }
      }
    };

    fetchAndProcessPalawijaData();
  }, [selectedYear, selectedSubround, supabase]);

  return { processedPalawijaData, palawijaTotals, loadingPalawija, errorPalawija, lastUpdatePalawija };
};