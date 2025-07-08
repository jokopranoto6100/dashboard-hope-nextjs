/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useAuth } from "@/context/AuthContext";

// Impor tipe dari lokasi baru di dalam folder fitur
import { PadiDataRow, PadiTotals } from '@/app/(dashboard)/monitoring/ubinan/types';

const toTitleCase = (str: string) => {
  if (!str) return '';
  return str.toLowerCase().split(' ').map((word) => {
    if (word.length === 0) return '';
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
};

const mapStatusToGroup = (rawStatus: string): 'Approved' | 'Rejected' | 'Submitted' | 'Lainnya' => {
  const lowerCaseStatus = rawStatus.toLowerCase();

  if (lowerCaseStatus.includes('approved') || lowerCaseStatus.includes('selesai') || lowerCaseStatus.includes('lengkap')) {
    return 'Approved';
  }
  if (lowerCaseStatus.includes('rejected') || lowerCaseStatus.includes('gagal')) {
    return 'Rejected';
  }
  if (lowerCaseStatus.includes('submitted') || lowerCaseStatus.includes('pencacah')) {
    return 'Submitted';
  }
  
  return 'Lainnya'; // Fallback untuk status yang tidak terduga
};

// DIUBAH: Definisikan tipe untuk return value hook ini dengan tambahan kegiatanId
interface PadiMonitoringDataHook {
  processedPadiData: PadiDataRow[] | null;
  padiTotals: PadiTotals | null;
  loadingPadi: boolean;
  errorPadi: string | null;
  lastUpdate: string | null;
  uniqueStatusNames?: string[];
  kegiatanId: string | null; // BARU
}

export const usePadiMonitoringData = (selectedYear: number, selectedSubround: string): PadiMonitoringDataHook => {
  const { supabase } = useAuth();

  const [processedPadiData, setProcessedPadiData] = useState<PadiDataRow[] | null>(null);
  const [padiTotals, setPadiTotals] = useState<PadiTotals | null>(null);
  const [loadingPadi, setLoadingPadi] = useState(true);
  const [errorPadi, setErrorPadi] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [uniqueStatusNames, setUniqueStatusNames] = useState<string[] | undefined>(undefined);
  const [kegiatanId, setKegiatanId] = useState<string | null>(null); // BARU: State untuk menyimpan ID kegiatan

  useEffect(() => {
    if (!supabase) return;

    const fetchAndProcessPadiData = async () => {
      setLoadingPadi(true);
      setErrorPadi(null);
      setLastUpdate(null);
      setUniqueStatusNames(undefined);
      setKegiatanId(null); // BARU: Reset ID setiap kali fetch

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

      // DIUBAH: Tambahkan 'kegiatan_id' ke kolom yang dipilih, hapus 'komoditas' karena semua data sudah padi
      const selectColumns = [
        'nmkab', 'jenis_sampel', 'r701', 'tahun', 'subround', 'kab', 'anomali', 'timestamp_refresh',
        'status', 'kegiatan_id',
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

        // DIHAPUS: Filter komoditas karena semua data di ubinan_dashboard adalah padi

        const { data, error } = await queryPadi
          .range(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage - 1);

        if (error) {
          setErrorPadi(error.message);
          setLoadingPadi(false);
          return;
        }
        if (data) allRawPadiData = allRawPadiData.concat(data);
        if (!data || data.length < itemsPerPage) break;
        currentPage++;
      }

      // BARU: Ambil kegiatan_id dari baris data pertama (semua akan sama)
      if (allRawPadiData && allRawPadiData.length > 0) {
        setKegiatanId(allRawPadiData[0].kegiatan_id);
        
        // DEBUG: Log untuk melihat data yang diambil
        console.log(`[DEBUG] Padi monitoring - Tahun ${selectedYear}:`, {
          totalRows: allRawPadiData.length,
          dataSource: 'ubinan_dashboard',
          sampleData: allRawPadiData.slice(0, 5).map(row => ({
            jenis_sampel: row.jenis_sampel,
            r701: row.r701,
            status: row.status,
            nmkab: row.nmkab
          })),
          jenissSampelDistribution: {
            utama: allRawPadiData.filter(row => row.jenis_sampel === 'U').length,
            cadangan: allRawPadiData.filter(row => row.jenis_sampel === 'C').length,
            lainnya: allRawPadiData.filter(row => row.jenis_sampel !== 'U' && row.jenis_sampel !== 'C').length
          }
        });
      } else {
        console.log(`[DEBUG] Padi monitoring - Tahun ${selectedYear}: Tidak ada data padi valid ditemukan`);
      }

      // --- Sisa dari logika pemrosesan Anda tidak berubah ---
      const rawPadiData = allRawPadiData;
      const groupedData: {
        [key: string]: PadiDataRow
      } = {};

      let totalTargetUtama = 0;
      let totalCadangan = 0;
      let totalRealisasi = 0;
      let totalLewatPanen = 0;
      let totalFaseGeneratif = 0;
      let totalFaseGeneratif_G1 = 0;
      let totalFaseGeneratif_G2 = 0;
      let totalFaseGeneratif_G3 = 0;
      let totalAnomali = 0;
      let maxTimestamp: Date | null = null;
      const aggregatedStatuses: { [key: string]: number } = {}; 

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
                          faseGeneratif_G1: 0, faseGeneratif_G2: 0, faseGeneratif_G3: 0,
                          statuses: {},
                          persentase: 0
                      };
                  }

                  if (row.jenis_sampel === "U") {
                      groupedData[originalNmkab].targetUtama += 1; totalTargetUtama += 1;
                  }
                  if (row.jenis_sampel === "C") {
                      groupedData[originalNmkab].cadangan += 1; totalCadangan += 1;
                  }

                  if (row.r701 !== null && row.r701 !== undefined && String(row.r701).trim() !== '') {
                      groupedData[originalNmkab].realisasi += 1; 
                      totalRealisasi += 1;

                      if (row.status && typeof row.status === 'string' && String(row.status).trim() !== '') {
                          const rawStatus = String(row.status).trim();
                          const groupedStatus = mapStatusToGroup(rawStatus);
                          groupedData[originalNmkab].statuses[groupedStatus] = (groupedData[originalNmkab].statuses[groupedStatus] || 0) + 1;
                          aggregatedStatuses[groupedStatus] = (aggregatedStatuses[groupedStatus] || 0) + 1;
                      }
                  }


                  lewatPanenColumns.forEach(col => {
                    if (row[col] === 1) {
                      groupedData[originalNmkab].lewatPanen += 1; totalLewatPanen += 1;
                    }
                  });

                  const faseGeneratifValue = row[lastMonthColumn];
                  if (faseGeneratifValue !== null && faseGeneratifValue !== undefined) {
                      const strValue = String(faseGeneratifValue).trim();
                      if (strValue === '3.1') {
                          groupedData[originalNmkab].faseGeneratif_G1! += 1; totalFaseGeneratif_G1 += 1;
                          groupedData[originalNmkab].faseGeneratif! += 1; totalFaseGeneratif += 1;
                      } else if (strValue === '3.2') {
                          groupedData[originalNmkab].faseGeneratif_G2! += 1; totalFaseGeneratif_G2 += 1;
                          groupedData[originalNmkab].faseGeneratif! += 1; totalFaseGeneratif += 1;
                      } else if (strValue === '3.3') {
                          groupedData[originalNmkab].faseGeneratif_G3! += 1; totalFaseGeneratif_G3 += 1;
                          groupedData[originalNmkab].faseGeneratif! += 1; totalFaseGeneratif += 1;
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
          persentase: item.targetUtama > 0 ? ((item.realisasi / item.targetUtama) * 100) : 0
      }));

      const totalPersentase = totalTargetUtama > 0 ? ((totalRealisasi / totalTargetUtama) * 100) : 0;

      setPadiTotals({
          targetUtama: totalTargetUtama, cadangan: totalCadangan, realisasi: totalRealisasi,
          lewatPanen: totalLewatPanen, faseGeneratif: totalFaseGeneratif,
          faseGeneratif_G1: totalFaseGeneratif_G1,
          faseGeneratif_G2: totalFaseGeneratif_G2,
          faseGeneratif_G3: totalFaseGeneratif_G3,
          anomali: totalAnomali,
          persentase: totalPersentase,
          statuses: aggregatedStatuses 
      });
      setProcessedPadiData(finalProcessedData.sort((a, b) => a.kab_sort_key.localeCompare(b.kab_sort_key)));
      setUniqueStatusNames(Object.keys(aggregatedStatuses).sort()); 
      setLoadingPadi(false);

      if (maxTimestamp) {
        setLastUpdate((maxTimestamp as Date).toLocaleString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta'
        }) + ' WIB');
      } else {
        setLastUpdate('N/A');
      }
    };

    fetchAndProcessPadiData();
  }, [selectedYear, selectedSubround, supabase]);

  // DIUBAH: Kembalikan kegiatanId dalam objek return
  return { processedPadiData, padiTotals, loadingPadi, errorPadi, lastUpdate, uniqueStatusNames, kegiatanId };
};