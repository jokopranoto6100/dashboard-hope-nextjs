/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";
import { toast } from 'sonner';
import { PalawijaDataRow, PalawijaTotals } from '@/app/(dashboard)/monitoring/ubinan/types';

// Helper function untuk mengubah format nama Kabupaten
const toTitleCase = (str: string) => {
  if (!str) return '';
  return str.toLowerCase().split(' ').map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
};

// DIUBAH: Definisikan tipe return value hook dengan tambahan kegiatanId
interface PalawijaMonitoringDataHook {
  processedPalawijaData: PalawijaDataRow[] | null;
  palawijaTotals: PalawijaTotals | null;
  loadingPalawija: boolean;
  errorPalawija: string | null;
  lastUpdatePalawija: string | null;
  kegiatanId: string | null; // BARU
}

export const usePalawijaMonitoringData = (selectedYear: number, selectedSubround: string): PalawijaMonitoringDataHook => {
  const { supabase } = useAuth();
  
  const [processedPalawijaData, setProcessedPalawijaData] = useState<PalawijaDataRow[] | null>(null);
  const [palawijaTotals, setPalawijaTotals] = useState<PalawijaTotals | null>(null);
  const [loadingPalawija, setLoadingPalawija] = useState(true);
  const [errorPalawija, setErrorPalawija] = useState<string | null>(null);
  const [lastUpdatePalawija, setLastUpdatePalawija] = useState<string | null>(null);
  const [kegiatanId, setKegiatanId] = useState<string | null>(null); // BARU: State untuk ID

  useEffect(() => {
    if (!supabase) return;

    const fetchAndProcessPalawijaData = async () => {
      setLoadingPalawija(true);
      setErrorPalawija(null);
      setLastUpdatePalawija(null);
      setKegiatanId(null); // BARU: Reset ID

      let allRawData: any[] = [];
      let currentPage = 0;
      const itemsPerPage = 1000;

      // DIUBAH: Kolom disesuaikan dengan 'ubinan_dashboard'
      const selectColumns = [
        'nmkab', 'kab', 'jenis_sampel', 'r701', 'validasi', 'komoditas', 'tahun', 'subround', 'timestamp_refresh', 'kegiatan_id'
      ];

      while (true) {
        // DIUBAH: Fetch dari 'ubinan_dashboard', bukan 'ubinan_raw'
        let query = supabase
          .from('ubinan_dashboard')
          .select(selectColumns.join(','));

        query = query.eq('tahun', selectedYear);
        if (selectedSubround !== 'all') {
          query = query.eq('subround', parseInt(selectedSubround));
        }
        
        // DIUBAH: Filter menjadi lebih spesifik untuk mengecualikan Padi
        query = query.not('komoditas', 'in', '("1 - Padi Sawah", "3 - Padi Ladang")');

        const { data, error } = await query
          .range(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage - 1);

        if (error) {
          setErrorPalawija(error.message);
          toast.error('Gagal memuat data Ubinan Palawija', { description: error.message });
          setLoadingPalawija(false);
          return;
        }
        if (data) allRawData = allRawData.concat(data);
        if (!data || data.length < itemsPerPage) break;
        currentPage++;
      }

      // BARU: Ambil kegiatan_id dari baris data pertama
      if (allRawData && allRawData.length > 0) {
        setKegiatanId(allRawData[0].kegiatan_id);
      }

      const groupedData: { [key: string]: PalawijaDataRow } = {};
      let totalTarget = 0, totalRealisasi = 0, totalClean = 0, totalWarning = 0, totalError = 0;
      let maxTimestamp: Date | null = null;

      allRawData.forEach(row => {
        // DIUBAH: Logika grouping disederhanakan, tidak perlu mapping manual KAB_CODE_TO_NAME
        const groupKey = row.kab || 'unknown';
        if (!groupedData[groupKey]) {
          groupedData[groupKey] = {
            nmkab: toTitleCase(String(row.nmkab || 'Kabupaten Tidak Diketahui').replace(/KABUPATEN\s|KOTA\s/g, '').trim()),
            kab_sort_key: String(row.kab || 'zzzz').trim(),
            target: 0, realisasi: 0, clean: 0, warning: 0, error: 0, persentase: 0,
          };
        }
        const group = groupedData[groupKey];

        // DIUBAH: Menggunakan 'jenis_sampel' untuk konsistensi
        if (row.jenis_sampel === "U") {
          group.target++;
          totalTarget++;
        }

        if (row.r701 !== null) {
          group.realisasi++;
          totalRealisasi++;

          // Asumsi 'validasi' bernilai 'CLEAN', 'WARNING', 'ERROR'
          if (row.validasi === 'CLEAN') { group.clean++; totalClean++; }
          else if (row.validasi === 'WARNING') { group.warning++; totalWarning++; }
          else if (row.validasi === 'ERROR') { group.error++; totalError++; }
        }
        
        if (row.timestamp_refresh) {
          const ts = new Date(row.timestamp_refresh);
          if (!maxTimestamp || ts > ts) maxTimestamp = ts;
        }
      });

      const finalProcessedData = Object.values(groupedData).map(item => ({
        ...item,
        persentase: item.target > 0 ? (item.realisasi / item.target) * 100 : 0
      })).sort((a, b) => a.kab_sort_key.localeCompare(b.kab_sort_key));

      const totalPersentase = totalTarget > 0 ? (totalRealisasi / totalTarget) * 100 : 0;

      setPalawijaTotals({
        target: totalTarget, realisasi: totalRealisasi, clean: totalClean,
        warning: totalWarning, error: totalError, persentase: totalPersentase
      });
      setProcessedPalawijaData(finalProcessedData);
      setLoadingPalawija(false);

      if (maxTimestamp) {
        setLastUpdatePalawija((maxTimestamp as Date).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'medium' }));
      } else {
        setLastUpdatePalawija('N/A');
      }
    };

    fetchAndProcessPalawijaData();
  }, [selectedYear, selectedSubround, supabase]);

  // DIUBAH: Kembalikan kegiatanId
  return { processedPalawijaData, palawijaTotals, loadingPalawija, errorPalawija, lastUpdatePalawija, kegiatanId };
};