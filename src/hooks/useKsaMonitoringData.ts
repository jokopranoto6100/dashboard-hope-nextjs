// src/hooks/useKsaMonitoringData.ts
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useYear } from '@/context/YearContext';

interface KsaAmatanRow {
  id: number; id_segmen: string | null; subsegmen: string | null; nama: string | null;
  n: number | null; amatan: string | null; status: string | null; // Kolom status
  evaluasi: string | null; tanggal: string; flag_kode_12: string | null;
  note: string | null; kode_kab: string | null; kode_kec: string | null;
  kabupaten: string | null; bulan: number | null; tahun: number | null;
}

export interface StatusValue {
    count: number;
    percentage: number;
}

// Renamed for clarity
export interface ProcessedKsaDistrictData {
  kabupaten: string; kode_kab: string; target: number; realisasi: number;
  persentase: number; inkonsisten: number; kode_12: number;
  statuses?: Record<string, StatusValue>;
}

// Renamed for clarity
export interface KsaDistrictTotals {
  target: number; realisasi: number; persentase: number;
  inkonsisten: number; kode_12: number;
  statuses?: Record<string, StatusValue>;
}

// New interface for 'nama' level data
export interface ProcessedKsaNamaData {
  nama: string; // The 'nama' field from ksa_amatan
  target: number;
  realisasi: number;
  persentase: number;
  inkonsisten: number;
  kode_12: number;
  statuses?: Record<string, StatusValue>;
}

// New interface for 'nama' level totals (within a selected district)
export interface KsaNamaTotals {
  target: number;
  realisasi: number;
  persentase: number;
  inkonsisten: number;
  kode_12: number;
  statuses?: Record<string, StatusValue>;
}


type FetchBehavior = 'autoFallback' | 'directFetch';

export const useKsaMonitoringData = (
  requestedMonth: string | undefined,
  behavior: FetchBehavior = 'directFetch'
) => {
    const { supabase } = useAuth();
    const { selectedYear } = useYear();
  
  // Renamed states for district level
  const [districtLevelData, setDistrictLevelData] = useState<ProcessedKsaDistrictData[]>([]);
  const [districtTotals, setDistrictTotals] = useState<KsaDistrictTotals | null>(null);
  
  // New states for 'nama' level
  const [selectedKabupatenCode, setSelectedKabupatenCode] = useState<string | null>(null);
  const [namaLevelData, setNamaLevelData] = useState<ProcessedKsaNamaData[]>([]);
  const [namaLevelTotals, setNamaLevelTotals] = useState<KsaNamaTotals | null>(null);

  const [allRawDataCache, setAllRawDataCache] = useState<KsaAmatanRow[]>([]); // Cache raw data

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [effectiveDisplayMonth, setEffectiveDisplayMonth] = useState<string | undefined>(requestedMonth);
  const [uniqueStatusNames, setUniqueStatusNames] = useState<string[]>([]);

  // Move processNamaLevelData outside of useEffect so it's available in both effects
  const processNamaLevelData = (rawDataFilteredByKab: KsaAmatanRow[], currentUniqueStatuses: string[]) => {
      if (!rawDataFilteredByKab || rawDataFilteredByKab.length === 0) {
          setNamaLevelData([]); setNamaLevelTotals(null); return;
      }

      const groupedMap = new Map<string, { // Group by 'nama'
          targetCount: number; realisasiCount: number;
          inkonsistenCount: number; nIs12Count: number; flagKode12Count: number;
          statusCounts: Record<string, number>;
          totalEntriesWithStatus: number;
      }>();

      let kabTarget = 0, kabRealisasi = 0, kabInkonsisten = 0, kabN12 = 0, kabF12 = 0;
      const kabOverallStatusCounts: Record<string, number> = {};
      let kabOverallTotalEntriesWithStatus = 0;

      rawDataFilteredByKab.forEach(item => {
          const namaKey = item.nama || "N/A"; // Handle null 'nama'
          if (!groupedMap.has(namaKey)) {
              groupedMap.set(namaKey, {
                  targetCount: 0, realisasiCount: 0,
                  inkonsistenCount: 0, nIs12Count: 0, flagKode12Count: 0,
                  statusCounts: {}, totalEntriesWithStatus: 0,
              });
          }
          const group = groupedMap.get(namaKey)!;

          if (item.subsegmen !== null && item.subsegmen.trim() !== '') { group.targetCount++; kabTarget++; }
          if (item.n !== null && item.n !== undefined) {
              group.realisasiCount++; kabRealisasi++;
              if (item.n === 12) { group.nIs12Count++; kabN12++; }
          }
          if (item.evaluasi === 'Inkonsisten') { group.inkonsistenCount++; kabInkonsisten++; }
          if (item.flag_kode_12 !== null && item.flag_kode_12.trim() !== '') { group.flagKode12Count++; kabF12++; }

          if (item.status && item.status.trim() !== '') {
              const currentStatus = item.status.trim();
              group.statusCounts[currentStatus] = (group.statusCounts[currentStatus] || 0) + 1;
              group.totalEntriesWithStatus++;
              kabOverallStatusCounts[currentStatus] = (kabOverallStatusCounts[currentStatus] || 0) + 1;
              kabOverallTotalEntriesWithStatus++;
          }
      });

      const processedArray: ProcessedKsaNamaData[] = Array.from(groupedMap.entries()).map(([nama, grp]) => {
          const statusesForGroup: Record<string, StatusValue> = {};
          currentUniqueStatuses.forEach(statusKey => {
              const count = grp.statusCounts[statusKey] || 0;
              statusesForGroup[statusKey] = {
                  count: count,
                  percentage: grp.totalEntriesWithStatus > 0 ? parseFloat(((count / grp.totalEntriesWithStatus) * 100).toFixed(2)) : 0
              };
          });
          return {
              nama: nama, target: grp.targetCount, realisasi: grp.realisasiCount,
              persentase: grp.targetCount > 0 ? parseFloat(((grp.realisasiCount / grp.targetCount) * 100).toFixed(2)) : 0,
              inkonsisten: grp.inkonsistenCount, kode_12: grp.nIs12Count + grp.flagKode12Count,
              statuses: statusesForGroup,
          };
      }).sort((a, b) => a.nama.localeCompare(b.nama)); // Sort by 'nama'
      setNamaLevelData(processedArray);

      const kabOverallStatuses: Record<string, StatusValue> = {};
      currentUniqueStatuses.forEach(statusKey => {
          const count = kabOverallStatusCounts[statusKey] || 0;
          kabOverallStatuses[statusKey] = {
              count: count,
              percentage: kabOverallTotalEntriesWithStatus > 0 ? parseFloat(((count / kabOverallTotalEntriesWithStatus) * 100).toFixed(2)) : 0
          };
      });
      const kabTotalKode12 = kabN12 + kabF12;
      const kabOvPersentase = kabTarget > 0 ? parseFloat(((kabRealisasi / kabTarget) * 100).toFixed(2)) : 0;
      setNamaLevelTotals({
          target: kabTarget, realisasi: kabRealisasi, persentase: kabOvPersentase,
          inkonsisten: kabInkonsisten, kode_12: kabTotalKode12,
          statuses: kabOverallStatuses,
      });
  };

  useEffect(() => {
    const fetchDataForMonth = async (year: number, monthStr: string | undefined): Promise<KsaAmatanRow[]> => {
        let rawData: KsaAmatanRow[] = [];
        const selectColumns = ['kabupaten', 'kode_kab', 'subsegmen', 'n', 'evaluasi', 'flag_kode_12', 'tanggal', 'tahun', 'bulan', 'status', 'nama']; // Added 'nama'
        
        let query = supabase.from('ksa_amatan').select(selectColumns.join(',')).eq('tahun', year);
        if (monthStr && monthStr !== "Semua") {
            query = query.eq('bulan', parseInt(monthStr));
        }

        let currentPage = 0; const itemsPerPage = 1000;
        while(true) {
            const { data: pageData, error: dbError } = await query.range(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage - 1);
            if (dbError) throw dbError;
            if (pageData) rawData = rawData.concat(pageData as unknown as KsaAmatanRow[]);
            if (!pageData || pageData.length < itemsPerPage) break;
            currentPage++;
        }
        setAllRawDataCache(rawData); // Cache the fetched raw data
        return rawData;
    };

    const processDistrictData = (rawData: KsaAmatanRow[], currentUniqueStatuses: string[]) => {
        if (!rawData || rawData.length === 0) {
            setDistrictLevelData([]); setDistrictTotals(null); return;
        }

        const groupedMap = new Map<string, {
            kode_kab: string; targetCount: number; realisasiCount: number;
            inkonsistenCount: number; nIs12Count: number; flagKode12Count: number;
            statusCounts: Record<string, number>;
            totalEntriesWithStatus: number;
        }>();

        let ovTarget = 0, ovRealisasi = 0, ovInkonsisten = 0, ovN12 = 0, ovF12 = 0;
        const overallStatusCounts: Record<string, number> = {};
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

        const processedArray: ProcessedKsaDistrictData[] = Array.from(groupedMap.entries()).map(([kab, grp]) => {
            const statusesForGroup: Record<string, StatusValue> = {};
            currentUniqueStatuses.forEach(statusKey => {
                const count = grp.statusCounts[statusKey] || 0;
                statusesForGroup[statusKey] = {
                    count: count,
                    percentage: grp.totalEntriesWithStatus > 0 ? parseFloat(((count / grp.totalEntriesWithStatus) * 100).toFixed(2)) : 0
                };
            });
            return {
                kabupaten: kab, kode_kab: grp.kode_kab, target: grp.targetCount, realisasi: grp.realisasiCount,
                persentase: grp.targetCount > 0 ? parseFloat(((grp.realisasiCount / grp.targetCount) * 100).toFixed(2)) : 0,
                inkonsisten: grp.inkonsistenCount, kode_12: grp.nIs12Count + grp.flagKode12Count,
                statuses: statusesForGroup,
            };
        }).sort((a, b) => a.kode_kab.localeCompare(b.kode_kab));
        setDistrictLevelData(processedArray);

        const overallStatuses: Record<string, StatusValue> = {};
        currentUniqueStatuses.forEach(statusKey => {
            const count = overallStatusCounts[statusKey] || 0;
            overallStatuses[statusKey] = {
                count: count,
                percentage: overallTotalEntriesWithStatus > 0 ? parseFloat(((count / overallTotalEntriesWithStatus) * 100).toFixed(2)) : 0
            };
        });
        const totalKode12 = ovN12 + ovF12;
        const ovPersentase = ovTarget > 0 ? parseFloat(((ovRealisasi / ovTarget) * 100).toFixed(2)) : 0;
        setDistrictTotals({
            target: ovTarget, realisasi: ovRealisasi, persentase: ovPersentase,
            inkonsisten: ovInkonsisten, kode_12: totalKode12,
            statuses: overallStatuses,
        });
    };

    const extractUniqueStatusesAndDate = (rawData: KsaAmatanRow[]) => {
        let maxTs: Date | null = null;
        const discoveredStatuses = new Set<string>();
        rawData.forEach(item => {
            if (item.tanggal) {
                const currentTs = new Date(item.tanggal);
                if (!maxTs || currentTs > maxTs) maxTs = currentTs;
            }
            if (item.status && item.status.trim() !== '') {
                discoveredStatuses.add(item.status.trim());
            }
        });
        setLastUpdated(maxTs ? (maxTs as Date).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'long'}) : null);
        const sortedUniqueStatuses = Array.from(discoveredStatuses).sort();
        setUniqueStatusNames(sortedUniqueStatuses);
        return sortedUniqueStatuses;
    };

    const executeLogic = async () => {
      if (!selectedYear) {
        setDistrictLevelData([]); setDistrictTotals(null);
        setNamaLevelData([]); setNamaLevelTotals(null);
        setLastUpdated(null); setIsLoading(false);
        setEffectiveDisplayMonth(requestedMonth); setUniqueStatusNames([]);
        setAllRawDataCache([]);
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
                // Simple fallback, doesn't consider year boundaries for December -> January of next year.
                // Assumes previous month is in the same year.
                const previousMonthNum = currentMonthNum === 1 ? 12 : currentMonthNum - 1; 
                finalMonthForDisplay = String(previousMonthNum);
                // For fallback, we might also need to adjust the year if currentMonth is January
                // but that logic is not present, assuming same year for simplicity based on existing code
                dataToProcess = await fetchDataForMonth(selectedYear, finalMonthForDisplay);
            } else {
                finalMonthForDisplay = requestedMonth;
            }
        } else {
            dataToProcess = await fetchDataForMonth(selectedYear, requestedMonth);
            finalMonthForDisplay = requestedMonth;
        }
        
        const currentUniqueStatuses = extractUniqueStatusesAndDate(dataToProcess);
        processDistrictData(dataToProcess, currentUniqueStatuses);
        // Nama level data will be processed via useEffect watching allRawDataCache and selectedKabupatenCode
        setEffectiveDisplayMonth(finalMonthForDisplay);

      } catch (err) {
        console.error("Error fetching KSA data:", err);
        setError((err as Error).message || 'Gagal mengambil data KSA.');
        setDistrictLevelData([]); setDistrictTotals(null);
        setNamaLevelData([]); setNamaLevelTotals(null);
        setUniqueStatusNames([]); setAllRawDataCache([]);
        setEffectiveDisplayMonth(requestedMonth);
      } finally {
        setIsLoading(false);
      }
    };
    executeLogic();

  }, [selectedYear, requestedMonth, behavior, supabase]); // Removed selectedKabupatenCode from here

  // Effect to process namaLevelData when raw data or selected kabupaten changes
  useEffect(() => {
    if (allRawDataCache.length > 0 && selectedKabupatenCode) {
      const filteredByKab = allRawDataCache.filter(item => item.kode_kab === selectedKabupatenCode);
      processNamaLevelData(filteredByKab, uniqueStatusNames); // uniqueStatusNames should be available from the main processing
    } else {
      setNamaLevelData([]); // Clear nama level data if no kab selected or no raw data
      setNamaLevelTotals(null);
    }
  }, [allRawDataCache, selectedKabupatenCode, uniqueStatusNames]); // Add uniqueStatusNames


  return { 
    districtLevelData, 
    districtTotals, 
    isLoading, 
    error, 
    lastUpdated, 
    effectiveDisplayMonth, 
    uniqueStatusNames,
    namaLevelData,       // Expose nama level data
    namaLevelTotals,     // Expose nama level totals
    setSelectedKabupatenCode // Expose setter for selected kabupaten
  };
};