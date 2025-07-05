/* eslint-disable @typescript-eslint/no-explicit-any */
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

// DIUBAH: Definisikan tipe untuk return value hook ini
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
    const fetchAndProcessPalawijaData = async () => {
      setLoadingPalawija(true);
      setErrorPalawija(null);
      setLastUpdatePalawija(null);
      setKegiatanId(null); // BARU: Reset ID setiap kali fetch

      let allRawPalawijaData: any[] = [];
      let currentPage = 0;
      const itemsPerPage = 1000;

      // DIUBAH: Tambahkan 'kegiatan_id' ke kolom yang di-select
      const selectColumns = [
        'kab',
        'prioritas',
        'r701',
        'validasi',
        'komoditas',
        'tahun',
        'subround',
        'uploaded_at',
        'kegiatan_id' 
      ];

      while (true) {
        let queryPalawija = supabase
          .from('ubinan_raw')
          .select(selectColumns.join(','));

        queryPalawija = queryPalawija.eq('tahun', selectedYear);
        if (selectedSubround !== 'all') {
          queryPalawija = queryPalawija.eq('subround', parseInt(selectedSubround));
        }
        
        // DIUBAH: Filter menjadi lebih spesifik dan konsisten
        queryPalawija = queryPalawija.not('komoditas', 'in', '("1 - Padi Sawah", "3 - Padi Ladang")');

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
      
      // BARU: Ambil kegiatan_id dari baris data pertama
      if (allRawPalawijaData && allRawPalawijaData.length > 0) {
        setKegiatanId(allRawPalawijaData[0].kegiatan_id);
      }

      const groupedData: { [key: string]: any } = {};
      let totalTarget = 0, totalRealisasi = 0, totalClean = 0, totalWarning = 0, totalError = 0;
      let maxTimestamp: Date | null = null;

      if (allRawPalawijaData) {
        allRawPalawijaData.forEach(row => {
          // ... logika grouping Anda tidak berubah ...
          const kabValue = row.kab;
          let displayName: string, groupAndSortKey: string;
          const kabCodeString = (kabValue !== null && kabValue !== undefined) ? String(kabValue).trim() : '';
          if (kabCodeString && KAB_CODE_TO_NAME[kabCodeString]) { displayName = KAB_CODE_TO_NAME[kabCodeString]; groupAndSortKey = kabCodeString; }
          else if (kabCodeString) { displayName = `Kabupaten/Kota (Kode: ${kabCodeString})`; groupAndSortKey = kabCodeString; }
          else { displayName = "Kabupaten Tidak Diketahui"; groupAndSortKey = "zzzz_UnknownKab"; }
          if (!groupedData[groupAndSortKey]) { groupedData[groupAndSortKey] = { nmkab: displayName, kab_sort_key: groupAndSortKey, target: 0, realisasi: 0, clean: 0, warning: 0, error: 0, }; }
          if (row.prioritas === "UTAMA") { groupedData[groupAndSortKey].target++; totalTarget++; }
          if (row.r701 !== null && String(row.r701).trim() !== '') {
            groupedData[groupAndSortKey].realisasi++; totalRealisasi++;
            if (row.validasi === 'CLEAN') { groupedData[groupAndSortKey].clean++; totalClean++; }
            else if (row.validasi === 'WARNING') { groupedData[groupAndSortKey].warning++; totalWarning++; }
            else if (row.validasi === 'ERROR') { groupedData[groupAndSortKey].error++; totalError++; }
          }
          if (row.uploaded_at) { const ts = new Date(row.uploaded_at); if (!maxTimestamp || ts > maxTimestamp) maxTimestamp = ts; }
        });
      }

      const finalProcessedData = Object.values(groupedData).map(item => ({
        ...item,
        // Biarkan persentase sebagai number untuk konsistensi
        persentase: item.target > 0 ? ((item.realisasi / item.target) * 100) : 0
      })).sort((a, b) => {
        // ... logika sorting Anda tidak berubah ...
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
        persentase: totalPersentase // Dibiarkan sebagai number
      });
      
      // DIUBAH: Hapus langkah konversi ke string, langsung set data dengan persentase numerik
      setProcessedPalawijaData(finalProcessedData as PalawijaDataRow[]);
      setLoadingPalawija(false);

      if (maxTimestamp) {
        setLastUpdatePalawija((maxTimestamp as Date).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }) + ' WIB');
      } else {
        const anyTimestamp = allRawPalawijaData.find(d => d.uploaded_at)?.uploaded_at;
        if (anyTimestamp) { setLastUpdatePalawija(new Date(anyTimestamp).toLocaleString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })); }
        else { setLastUpdatePalawija('N/A'); }
      }
    };

    fetchAndProcessPalawijaData();
  }, [selectedYear, selectedSubround, supabase]);

  // DIUBAH: Kembalikan kegiatanId
  return { processedPalawijaData, palawijaTotals, loadingPalawija, errorPalawija, lastUpdatePalawija, kegiatanId };
};