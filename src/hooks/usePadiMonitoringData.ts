// src/hooks/usePadiMonitoringData.ts
import { useState, useEffect } from 'react';
import { createClientComponentSupabaseClient } from '@/lib/supabase';
import { toast } from 'sonner';

const toTitleCase = (str: string) => {
  return str.toLowerCase().split(' ').map((word) => {
    if (word.length === 0) return '';
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
};

// Perbarui interface untuk PadiTotals
interface PadiTotals {
  targetUtama: number;
  cadangan: number;
  realisasi: number;
  lewatPanen: number;
  faseGeneratif: number;
  faseGeneratif_G1: number; // Tambahan G1
  faseGeneratif_G2: number; // Tambahan G2
  faseGeneratif_G3: number; // Tambahan G3
  anomali: number;
  persentase: number;
}

interface PadiMonitoringDataHook {
  processedPadiData: any[] | null;
  padiTotals: PadiTotals | null;
  loadingPadi: boolean;
  errorPadi: string | null;
  lastUpdate: string | null;
}

export const usePadiMonitoringData = (selectedYear: number, selectedSubround: string): PadiMonitoringDataHook => {
  const supabase = createClientComponentSupabaseClient();

  const [processedPadiData, setProcessedPadiData] = useState<any[] | null>(null);
  const [padiTotals, setPadiTotals] = useState<PadiTotals | null>(null);
  const [loadingPadi, setLoadingPadi] = useState(true);
  const [errorPadi, setErrorPadi] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndProcessPadiData = async () => {
      setLoadingPadi(true);
      setErrorPadi(null);
      setLastUpdate(null);

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const lastMonth = currentMonth === 0 ? 12 : currentMonth;
      const lastMonthColumn = String(lastMonth);

      let lewatPanenColumns: string[] = [];
      if (selectedSubround === '1') {
        lewatPanenColumns = ['lewat_panen_1', 'lewat_panen_2', 'lewat_panen_3', 'lewat_panen_4'];
      } else if (selectedSubround === '2') {
        lewatPanenColumns = ['lewat_panen_5', 'lewat_panen_6', 'lewat_panen_7', 'lewat_panen_8'];
      } else if (selectedSubround === '3') {
        lewatPanenColumns = ['lewat_panen_9', 'lewat_panen_10', 'lewat_panen_11', 'lewat_panen_12'];
      } else {
        lewatPanenColumns = Array.from({ length: 12 }, (_, i) => `lewat_panen_${i + 1}`);
      }

      let allRawPadiData: any[] = [];
      let currentPage = 0;
      const itemsPerPage = 1000;

      const selectColumns = [
        'nmkab', 'jenis_sampel', 'r701', 'tahun', 'subround', 'kab', 'anomali', 'timestamp_refresh',
        lastMonthColumn,
        ...lewatPanenColumns,
      ];

      while (true) {
        let queryPadi = supabase
          .from('ubinan_dashboard')
          .select(selectColumns.join(','));

        queryPadi = queryPadi.eq('tahun', selectedYear);
        if (selectedSubround !== 'all') {
          queryPadi = queryPadi.eq('subround', parseInt(selectedSubround));
        }

        const { data, error } = await queryPadi
          .range(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage - 1);

        if (error) {
          setErrorPadi(error.message);
          // toast.error('Gagal memuat data Ubinan Padi', { description: error.message }); // Non-aktifkan jika toast tidak diimpor di page.tsx
          setLoadingPadi(false);
          return;
        }
        if (data) allRawPadiData = allRawPadiData.concat(data);
        if (!data || data.length < itemsPerPage) break;
        currentPage++;
      }

      const rawPadiData = allRawPadiData;
      // Perbarui tipe groupedData
      const groupedData: {
        [key: string]: {
          nmkab: string; kab_sort_key: string; targetUtama: number; cadangan: number; realisasi: number;
          lewatPanen: number; faseGeneratif: number; anomali: number;
          faseGeneratif_G1: number; faseGeneratif_G2: number; faseGeneratif_G3: number; // Tambahan
        }
      } = {};

      let totalTargetUtama = 0;
      let totalCadangan = 0;
      let totalRealisasi = 0;
      let totalLewatPanen = 0;
      let totalFaseGeneratif = 0;
      let totalFaseGeneratif_G1 = 0; // Tambahan
      let totalFaseGeneratif_G2 = 0; // Tambahan
      let totalFaseGeneratif_G3 = 0; // Tambahan
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
                          nmkab: cleanedNmkab, kab_sort_key: kabSortKeyValue, targetUtama: 0, cadangan: 0, realisasi: 0,
                          lewatPanen: 0, faseGeneratif: 0, anomali: 0,
                          faseGeneratif_G1: 0, faseGeneratif_G2: 0, faseGeneratif_G3: 0, // Inisialisasi
                      };
                  }

                  if (row.jenis_sampel === "U") {
                      groupedData[originalNmkab].targetUtama += 1; totalTargetUtama += 1;
                  }
                  if (row.jenis_sampel === "C") {
                      groupedData[originalNmkab].cadangan += 1; totalCadangan += 1;
                  }
                  if (row.r701 !== null && row.r701 !== undefined && String(row.r701).trim() !== '') {
                      groupedData[originalNmkab].realisasi += 1; totalRealisasi += 1;
                  }

                  lewatPanenColumns.forEach(col => {
                    if (row[col] === 1) {
                      groupedData[originalNmkab].lewatPanen += 1; totalLewatPanen += 1;
                    }
                  });

                  const faseGeneratifValue = row[lastMonthColumn];
                  if (faseGeneratifValue !== null && faseGeneratifValue !== undefined) {
                      const strValue = String(faseGeneratifValue).trim();
                      // Hitung total faseGeneratif dan G1, G2, G3
                      if (strValue === '3.1') {
                          groupedData[originalNmkab].faseGeneratif_G1 += 1; totalFaseGeneratif_G1 += 1;
                          groupedData[originalNmkab].faseGeneratif += 1; totalFaseGeneratif += 1;
                      } else if (strValue === '3.2') {
                          groupedData[originalNmkab].faseGeneratif_G2 += 1; totalFaseGeneratif_G2 += 1;
                          groupedData[originalNmkab].faseGeneratif += 1; totalFaseGeneratif += 1;
                      } else if (strValue === '3.3') {
                          groupedData[originalNmkab].faseGeneratif_G3 += 1; totalFaseGeneratif_G3 += 1;
                          groupedData[originalNmkab].faseGeneratif += 1; totalFaseGeneratif += 1;
                      }
                  }

                  if (row.anomali !== null && row.anomali !== undefined && String(row.anomali).trim() !== '') {
                      groupedData[originalNmkab].anomali += 1; totalAnomali += 1;
                  }

                  if (row.timestamp_refresh) {
                    const currentTimestamp = new Date(row.timestamp_refresh);
                    if (!maxTimestamp || currentTimestamp > maxTimestamp) maxTimestamp = currentTimestamp;
                  }
              }
          });
      }

      const finalProcessedData = Object.values(groupedData).map(item => ({
          ...item,
          persentase: item.targetUtama > 0 ? ((item.realisasi / item.targetUtama) * 100).toFixed(2) : "0.00"
      })).sort((a, b) => a.kab_sort_key.localeCompare(b.kab_sort_key));

      const totalPersentase = totalTargetUtama > 0 ? ((totalRealisasi / totalTargetUtama) * 100) : 0;

      setPadiTotals({
          targetUtama: totalTargetUtama, cadangan: totalCadangan, realisasi: totalRealisasi,
          lewatPanen: totalLewatPanen, faseGeneratif: totalFaseGeneratif,
          faseGeneratif_G1: totalFaseGeneratif_G1, // Set total G1
          faseGeneratif_G2: totalFaseGeneratif_G2, // Set total G2
          faseGeneratif_G3: totalFaseGeneratif_G3, // Set total G3
          anomali: totalAnomali, persentase: parseFloat(totalPersentase.toFixed(2))
      });
      setProcessedPadiData(finalProcessedData);
      setLoadingPadi(false);

      if (maxTimestamp) {
        setLastUpdate(maxTimestamp.toLocaleString('id-ID', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        }));
      } else {
        setLastUpdate('N/A');
      }
    };
    fetchAndProcessPadiData();
  }, [selectedYear, selectedSubround, supabase]);

  return { processedPadiData, padiTotals, loadingPadi, errorPadi, lastUpdate };
};