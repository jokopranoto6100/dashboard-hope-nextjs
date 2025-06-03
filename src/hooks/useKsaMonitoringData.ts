// src/hooks/useKsaMonitoringData.ts
import { useState, useEffect, useContext } from 'react';
import { createClientComponentSupabaseClient } from '@/lib/supabase';
import { useYear } from '@/context/YearContext';

interface KsaAmatanRow {
  id: number; id_segmen: string | null; subsegmen: string | null; nama: string | null;
  n: number | null; amatan: string | null; status: string | null; // Kolom status
  evaluasi: string | null; tanggal: string; flag_kode_12: string | null;
  note: string | null; kode_kab: string | null; kode_kec: string | null;
  kabupaten: string | null; bulan: number | null; tahun: number | null;
}

// Struktur untuk menyimpan nilai per status (jumlah dan persentase)
export interface StatusValue {
    count: number;
    percentage: number; // Persentase relatif terhadap total entri YANG MEMILIKI STATUS di grup tersebut
}

export interface ProcessedKsaData {
  kabupaten: string; kode_kab: string; target: number; realisasi: number;
  persentase: number; inkonsisten: number; kode_12: number;
  // Menggunakan Record<string, StatusValue> untuk menyimpan data per status secara dinamis
  // Contoh: statuses['Selesai'] = { count: 10, percentage: 50.00 }
  statuses?: Record<string, StatusValue>;
}

export interface KsaTotals {
  target: number; realisasi: number; persentase: number;
  inkonsisten: number; kode_12: number;
  // Total untuk setiap status
  statuses?: Record<string, StatusValue>;
}

type FetchBehavior = 'autoFallback' | 'directFetch';

export const useKsaMonitoringData = (
  requestedMonth: string | undefined,
  behavior: FetchBehavior = 'directFetch'
) => {
  const supabase = createClientComponentSupabaseClient();
  const { selectedYear } = useYear();
  const [data, setData] = useState<ProcessedKsaData[]>([]);
  const [ksaTotals, setKsaTotals] = useState<KsaTotals | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [effectiveDisplayMonth, setEffectiveDisplayMonth] = useState<string | undefined>(requestedMonth);
  // State baru untuk menyimpan nama-nama status unik yang ditemukan
  const [uniqueStatusNames, setUniqueStatusNames] = useState<string[]>([]);

  useEffect(() => {
    const fetchDataForMonth = async (year: number, monthStr: string | undefined): Promise<KsaAmatanRow[]> => {
        let allRawData: KsaAmatanRow[] = [];
        // Pastikan 'status' selalu ada dalam selectColumns
        const selectColumns = ['kabupaten', 'kode_kab', 'subsegmen', 'n', 'evaluasi', 'flag_kode_12', 'tanggal', 'tahun', 'bulan', 'status'];
        
        if (!monthStr || monthStr === "Semua") {
            let currentPage = 0; const itemsPerPage = 1000;
            while(true) {
                const { data: pageData, error: dbError } = await supabase.from('ksa_amatan').select(selectColumns.join(',')).eq('tahun', year).range(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage - 1);
                if (dbError) throw dbError;
                if (pageData) allRawData = allRawData.concat(pageData as unknown as KsaAmatanRow[]);
                if (!pageData || pageData.length < itemsPerPage) break;
                currentPage++;
            }
        } else {
            const monthNum = parseInt(monthStr);
            let currentPage = 0; const itemsPerPage = 1000;
            while(true) {
                const { data: pageData, error: dbError } = await supabase.from('ksa_amatan').select(selectColumns.join(',')).eq('tahun', year).eq('bulan', monthNum).range(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage - 1);
                if (dbError) throw dbError;
                if (pageData) allRawData = allRawData.concat(pageData as unknown as KsaAmatanRow[]);
                if (!pageData || pageData.length < itemsPerPage) break;
                currentPage++;
            }
        }
        return allRawData;
    };

    const processRawData = (rawData: KsaAmatanRow[]) => {
        if (!rawData || rawData.length === 0) {
            setData([]); setKsaTotals(null); setUniqueStatusNames([]); return;
        }
        
        let maxTs: Date | null = null;
        const discoveredStatuses = new Set<string>(); // Untuk menemukan status unik

        rawData.forEach(item => {
            if (item.tanggal) {
                const currentTs = new Date(item.tanggal);
                if (!maxTs || currentTs > maxTs) maxTs = currentTs;
            }
            if (item.status && item.status.trim() !== '') {
                discoveredStatuses.add(item.status.trim());
            }
        });
        setLastUpdated(maxTs ? maxTs.toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'long'}) : null);
        const sortedUniqueStatuses = Array.from(discoveredStatuses).sort();
        setUniqueStatusNames(sortedUniqueStatuses); // Simpan status unik yang sudah diurutkan

        const groupedMap = new Map<string, {
            kode_kab: string; targetCount: number; realisasiCount: number;
            inkonsistenCount: number; nIs12Count: number; flagKode12Count: number;
            statusCounts: Record<string, number>; // Hitungan per status
            totalEntriesWithStatus: number; // Penyebut untuk persentase status
        }>();

        let ovTarget = 0, ovRealisasi = 0, ovInkonsisten = 0, ovN12 = 0, ovF12 = 0;
        const overallStatusCounts: Record<string, number> = {}; // Untuk total keseluruhan per status
        let overallTotalEntriesWithStatus = 0;

        rawData.forEach(item => {
            if (!item.kabupaten || !item.kode_kab) return;
            if (!groupedMap.has(item.kabupaten)) {
                groupedMap.set(item.kabupaten, {
                    kode_kab: item.kode_kab, targetCount: 0, realisasiCount: 0,
                    inkonsistenCount: 0, nIs12Count: 0, flagKode12Count: 0,
                    statusCounts: {}, totalEntriesWithStatus: 0,
                });
            }
            const group = groupedMap.get(item.kabupaten)!;

            if (item.subsegmen !== null && item.subsegmen.trim() !== '') { group.targetCount++; ovTarget++; }
            if (item.n !== null && item.n !== undefined) {
                group.realisasiCount++; ovRealisasi++;
                if (item.n === 12) { group.nIs12Count++; ovN12++; }
            }
            // Menggunakan 'Inkonsisten' (huruf I besar) sesuai file terakhir Anda
            if (item.evaluasi === 'Inkonsisten') { group.inkonsistenCount++; ovInkonsisten++; } 
            if (item.flag_kode_12 !== null && item.flag_kode_12.trim() !== '') { group.flagKode12Count++; ovF12++; }

            if (item.status && item.status.trim() !== '') {
                const currentStatus = item.status.trim();
                group.statusCounts[currentStatus] = (group.statusCounts[currentStatus] || 0) + 1;
                group.totalEntriesWithStatus++;
                
                overallStatusCounts[currentStatus] = (overallStatusCounts[currentStatus] || 0) + 1;
                overallTotalEntriesWithStatus++;
            }
        });

        const processedArray: ProcessedKsaData[] = Array.from(groupedMap.entries()).map(([kab, grp]) => {
            const statusesForGroup: Record<string, StatusValue> = {};
            if (grp.totalEntriesWithStatus > 0) {
                sortedUniqueStatuses.forEach(statusKey => { // Iterasi berdasarkan status unik yang ditemukan
                    const count = grp.statusCounts[statusKey] || 0;
                    statusesForGroup[statusKey] = {
                        count: count,
                        percentage: parseFloat(((count / grp.totalEntriesWithStatus) * 100).toFixed(2))
                    };
                });
            } else { // Jika tidak ada entri dengan status, pastikan semua status unik ada dengan nilai 0
                 sortedUniqueStatuses.forEach(statusKey => {
                    statusesForGroup[statusKey] = { count: 0, percentage: 0 };
                });
            }

            return {
                kabupaten: kab, kode_kab: grp.kode_kab, target: grp.targetCount, realisasi: grp.realisasiCount,
                persentase: grp.targetCount > 0 ? parseFloat(((grp.realisasiCount / grp.targetCount) * 100).toFixed(2)) : 0,
                inkonsisten: grp.inkonsistenCount, kode_12: grp.nIs12Count + grp.flagKode12Count,
                statuses: statusesForGroup,
            };
        }).sort((a, b) => a.kode_kab.localeCompare(b.kode_kab));
        setData(processedArray);

        const overallStatuses: Record<string, StatusValue> = {};
        if (overallTotalEntriesWithStatus > 0) {
            sortedUniqueStatuses.forEach(statusKey => {
                const count = overallStatusCounts[statusKey] || 0;
                overallStatuses[statusKey] = {
                    count: count,
                    percentage: parseFloat(((count / overallTotalEntriesWithStatus) * 100).toFixed(2))
                };
            });
        } else {
             sortedUniqueStatuses.forEach(statusKey => {
                overallStatuses[statusKey] = { count: 0, percentage: 0 };
            });
        }

        const totalKode12 = ovN12 + ovF12;
        const ovPersentase = ovTarget > 0 ? parseFloat(((ovRealisasi / ovTarget) * 100).toFixed(2)) : 0;
        setKsaTotals({
            target: ovTarget, realisasi: ovRealisasi, persentase: ovPersentase,
            inkonsisten: ovInkonsisten, kode_12: totalKode12,
            statuses: overallStatuses,
        });
    };
    
    const executeLogic = async () => { /* ... (logika executeLogic tetap sama) ... */ 
      if (!selectedYear) {
        setData([]); setKsaTotals(null); setLastUpdated(null); setIsLoading(false);
        setEffectiveDisplayMonth(requestedMonth); setUniqueStatusNames([]);
        return;
      }
      setIsLoading(true); setError(null); setLastUpdated(null);
      let dataToProcess: KsaAmatanRow[] = [];
      let finalMonthForDisplay = requestedMonth;

      try {
        if (behavior === 'autoFallback' && requestedMonth && requestedMonth !== "Semua") {
            dataToProcess = await fetchDataForMonth(selectedYear, requestedMonth);
            if (dataToProcess.length === 0) {
                const currentMonthNum = parseInt(requestedMonth);
                const previousMonthNum = currentMonthNum === 1 ? 12 : currentMonthNum - 1;
                finalMonthForDisplay = String(previousMonthNum);
                dataToProcess = await fetchDataForMonth(selectedYear, finalMonthForDisplay);
            } else {
                finalMonthForDisplay = requestedMonth;
            }
        } else {
            dataToProcess = await fetchDataForMonth(selectedYear, requestedMonth);
            finalMonthForDisplay = requestedMonth;
        }
        processRawData(dataToProcess);
        setEffectiveDisplayMonth(finalMonthForDisplay);
      } catch (err) {
        console.error("Error fetching KSA data:", err);
        setError((err as Error).message || 'Gagal mengambil data KSA.');
        setData([]); setKsaTotals(null); setUniqueStatusNames([]);
        setEffectiveDisplayMonth(requestedMonth);
      } finally {
        setIsLoading(false);
      }
    };
    executeLogic();

  }, [selectedYear, requestedMonth, behavior, supabase]);

  // Kembalikan uniqueStatusNames
  return { data, ksaTotals, isLoading, error, lastUpdated, effectiveDisplayMonth, uniqueStatusNames };
};