// src/hooks/usePadiMonitoringData.ts
import { useState, useEffect } from 'react';
import { createClientComponentSupabaseClient } from '@/lib/supabase';
import { toast } from 'sonner';

// Helper untuk mengubah string menjadi Title Case
const toTitleCase = (str: string) => {
  return str.toLowerCase().split(' ').map((word) => {
    if (word.length === 0) return '';
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
};

interface PadiMonitoringDataHook {
  processedPadiData: any[] | null;
  padiTotals: { targetUtama: number; cadangan: number; realisasi: number; lewatPanen: number; faseGeneratif: number; anomali: number; persentase: number; } | null;
  loadingPadi: boolean;
  errorPadi: string | null;
  lastUpdate: string | null; // Tambahkan state untuk last update
}

export const usePadiMonitoringData = (selectedYear: number, selectedSubround: string): PadiMonitoringDataHook => {
  const supabase = createClientComponentSupabaseClient();

  const [processedPadiData, setProcessedPadiData] = useState<any[] | null>(null);
  const [padiTotals, setPadiTotals] = useState<{ targetUtama: number; cadangan: number; realisasi: number; lewatPanen: number; faseGeneratif: number; anomali: number; persentase: number; } | null>(null);
  const [loadingPadi, setLoadingPadi] = useState(true);
  const [errorPadi, setErrorPadi] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null); // State untuk last update

  useEffect(() => {
    const fetchAndProcessPadiData = async () => {
      setLoadingPadi(true);
      setErrorPadi(null);
      setLastUpdate(null); // Reset last update

      // --- Logika untuk mendapatkan bulan lalu dan kolom fase generatif ---
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth(); // 0-indexed (Jan=0, May=4)
      const lastMonth = currentMonth === 0 ? 12 : currentMonth; // Jika Januari, bulan lalu adalah 12 (Desember)
      const lastMonthColumn = String(lastMonth); // Kolom di database (misal "4" untuk April)

      // --- Kolom lewat_panen_X yang relevan berdasarkan subround ---
      let lewatPanenColumns: string[] = [];
      if (selectedSubround === '1') {
        lewatPanenColumns = ['lewat_panen_1', 'lewat_panen_2', 'lewat_panen_3', 'lewat_panen_4'];
      } else if (selectedSubround === '2') {
        lewatPanenColumns = ['lewat_panen_5', 'lewat_panen_6', 'lewat_panen_7', 'lewat_panen_8'];
      } else if (selectedSubround === '3') {
        lewatPanenColumns = ['lewat_panen_9', 'lewat_panen_10', 'lewat_panen_11', 'lewat_panen_12'];
      } else { // 'all' subrounds
        lewatPanenColumns = Array.from({ length: 12 }, (_, i) => `lewat_panen_${i + 1}`);
      }

      let allRawPadiData: any[] = [];
      let currentPage = 0;
      const itemsPerPage = 1000;

      // Kolom yang akan diambil dari database
      const selectColumns = [
        'nmkab', 'jenis_sampel', 'r701', 'tahun', 'subround', 'kab', 'anomali', 'timestamp_refresh',
        lastMonthColumn, // Kolom dinamis untuk fase generatif
        ...lewatPanenColumns, // Kolom dinamis untuk lewat panen
      ];

      // LOGIKA PAGINASI UNTUK MENGAMBIL SEMUA DATA Ubinan Padi
      while (true) {
        let queryPadi = supabase
          .from('ubinan_dashboard')
          .select(selectColumns.join(',')); // Gabungkan nama kolom

        queryPadi = queryPadi.eq('tahun', selectedYear);
        if (selectedSubround !== 'all') {
          queryPadi = queryPadi.eq('subround', parseInt(selectedSubround));
        }

        const { data, error } = await queryPadi
          .range(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage - 1);

        if (error) {
          setErrorPadi(error.message);
          toast.error('Gagal memuat data Ubinan Padi', { description: error.message });
          setLoadingPadi(false);
          return;
        }

        if (data) {
          allRawPadiData = allRawPadiData.concat(data);
        }

        if (!data || data.length < itemsPerPage) {
          break;
        }
        currentPage++;
      }

      const rawPadiData = allRawPadiData;

      const groupedData: { [key: string]: { nmkab: string; kab_sort_key: string; targetUtama: number; cadangan: number; realisasi: number; lewatPanen: number; faseGeneratif: number; anomali: number; } } = {};

      let totalTargetUtama = 0;
      let totalCadangan = 0;
      let totalRealisasi = 0;
      let totalLewatPanen = 0;
      let totalFaseGeneratif = 0;
      let totalAnomali = 0;
      let maxTimestamp: Date | null = null;

      if (rawPadiData) {
          rawPadiData.forEach(row => {
              const originalNmkab = row.nmkab;
              let cleanedNmkab = originalNmkab;
              if (typeof originalNmkab === 'string') {
                  cleanedNmkab = originalNmkab.replace(/KABUPATEN\s/g, '').replace(/KOTA\s/g, '').trim();
                  cleanedNmkab = toTitleCase(cleanedNmkab);
              }

              const kabSortKeyValue = row.kab && typeof row.kab === 'string' ? row.kab.trim() : '';

              if (originalNmkab && typeof originalNmkab === 'string' && originalNmkab.trim() !== '') {
                  if (!groupedData[originalNmkab]) {
                      groupedData[originalNmkab] = { 
                          nmkab: cleanedNmkab, 
                          kab_sort_key: kabSortKeyValue, 
                          targetUtama: 0, 
                          cadangan: 0, 
                          realisasi: 0,
                          lewatPanen: 0, // Inisialisasi
                          faseGeneratif: 0, // Inisialisasi
                          anomali: 0, // Inisialisasi
                      };
                  }

                  if (row.jenis_sampel === "U") {
                      groupedData[originalNmkab].targetUtama += 1;
                      totalTargetUtama += 1;
                  }
                  if (row.jenis_sampel === "C") {
                      groupedData[originalNmkab].cadangan += 1;
                      totalCadangan += 1;
                  }

                  if (row.r701 !== null && row.r701 !== undefined && String(row.r701).trim() !== '') {
                      groupedData[originalNmkab].realisasi += 1;
                      totalRealisasi += 1;
                  }

                  // --- Perhitungan Lewat Panen ---
                  lewatPanenColumns.forEach(col => {
                    if (row[col] === 1) { // Asumsi value 1 berarti 'lewat panen'
                      groupedData[originalNmkab].lewatPanen += 1;
                      totalLewatPanen += 1;
                    }
                  });

                  // --- Perhitungan Fase Generatif ---
                  const faseGeneratifValue = row[lastMonthColumn];
                  if (faseGeneratifValue !== null && faseGeneratifValue !== undefined) {
                      const strValue = String(faseGeneratifValue).trim();
                      if (strValue === '3.1' || strValue === '3.2' || strValue === '3.3') {
                          groupedData[originalNmkab].faseGeneratif += 1;
                          totalFaseGeneratif += 1;
                      }
                  }

                  // --- Perhitungan Anomali ---
                  if (row.anomali !== null && row.anomali !== undefined && String(row.anomali).trim() !== '') {
                      groupedData[originalNmkab].anomali += 1;
                      totalAnomali += 1;
                  }

                  // --- Cari Max Timestamp Refresh ---
                  if (row.timestamp_refresh) {
                    const currentTimestamp = new Date(row.timestamp_refresh);
                    if (!maxTimestamp || currentTimestamp > maxTimestamp) {
                      maxTimestamp = currentTimestamp;
                    }
                  }
              }
          });
      }

      const finalProcessedData = Object.values(groupedData).map(item => {
          const persentase = item.targetUtama > 0
              ? ((item.realisasi / item.targetUtama) * 100)
              : 0;
          return {
              ...item,
              persentase: persentase.toFixed(2)
          };
      }).sort((a, b) => {
          if (a.kab_sort_key && b.kab_sort_key) {
              return a.kab_sort_key.localeCompare(b.kab_sort_key);
          }
          return 0;
      });

      const totalPersentase = totalTargetUtama > 0
          ? ((totalRealisasi / totalTargetUtama) * 100).toFixed(2)
          : '0.00';

      setPadiTotals({
          targetUtama: totalTargetUtama,
          cadangan: totalCadangan,
          realisasi: totalRealisasi,
          lewatPanen: totalLewatPanen, // Set total
          faseGeneratif: totalFaseGeneratif, // Set total
          anomali: totalAnomali, // Set total
          persentase: parseFloat(totalPersentase)
      });
      setProcessedPadiData(finalProcessedData);
      setLoadingPadi(false);

      if (maxTimestamp) {
        setLastUpdate(maxTimestamp.toLocaleString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }));
      } else {
        setLastUpdate('N/A');
      }
    };

    fetchAndProcessPadiData();
  }, [selectedYear, selectedSubround, supabase]); // Dependency array

  return { processedPadiData, padiTotals, loadingPadi, errorPadi, lastUpdate };
};