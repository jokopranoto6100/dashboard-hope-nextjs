// Lokasi: src/hooks/useKsaMonitoringData.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useYear } from '@/context/YearContext';
import { LeaderboardEntry } from '@/app/(dashboard)/monitoring/ksa/LeaderboardCard';

// Interface dari file Anda
interface KsaAmatanRow { id: number; id_segmen: string | null; subsegmen: string | null; nama: string | null; n: number | null; amatan: string | null; status: string | null; evaluasi: string | null; tanggal: string; flag_kode_12: string | null; note: string | null; kode_kab: string | null; kode_kec: string | null; kabupaten: string | null; bulan: number | null; tahun: number | null; }
export interface StatusValue { count: number; percentage: number; }
export interface ProcessedKsaDistrictData { kabupaten: string; kode_kab: string; target: number; realisasi: number; persentase: number; inkonsisten: number; kode_12: number; statuses?: Record<string, StatusValue>; }
export interface KsaDistrictTotals { target: number; realisasi: number; persentase: number; inkonsisten: number; kode_12: number; statuses?: Record<string, StatusValue>; }
export interface ProcessedKsaNamaData { nama: string; target: number; realisasi: number; persentase: number; inkonsisten: number; kode_12: number; statuses?: Record<string, StatusValue>; }
export interface KsaNamaTotals { target: number; realisasi: number; persentase: number; inkonsisten: number; kode_12: number; statuses?: Record<string, StatusValue>; }

export interface KsaMonitoringHookResult {
    districtLevelData: ProcessedKsaDistrictData[];
    districtTotals: KsaDistrictTotals | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: string | null;
    displayMonth: string | undefined;
    setDisplayMonth: React.Dispatch<React.SetStateAction<string | undefined>>;
    uniqueStatusNames: string[];
    namaLevelData: ProcessedKsaNamaData[];
    namaLevelTotals: KsaNamaTotals | null;
    setSelectedKabupatenCode: React.Dispatch<React.SetStateAction<string | null>>;
    leaderboardData: LeaderboardEntry[];
    kegiatanId: string | null;
}

export const useKsaMonitoringData = (): KsaMonitoringHookResult => {
    const { supabase } = useAuth();
    const { selectedYear } = useYear();
  
    const [displayMonth, setDisplayMonth] = useState<string | undefined>(undefined);
    const [districtLevelData, setDistrictLevelData] = useState<ProcessedKsaDistrictData[]>([]);
    const [districtTotals, setDistrictTotals] = useState<KsaDistrictTotals | null>(null);
    const [selectedKabupatenCode, setSelectedKabupatenCode] = useState<string | null>(null);
    const [namaLevelData, setNamaLevelData] = useState<ProcessedKsaNamaData[]>([]);
    const [namaLevelTotals, setNamaLevelTotals] = useState<KsaNamaTotals | null>(null);
    const [allRawDataCache, setAllRawDataCache] = useState<KsaAmatanRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [uniqueStatusNames, setUniqueStatusNames] = useState<string[]>([]);
    const [kegiatanId, setKegiatanId] = useState<string | null>(null);
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    
    const processNamaLevelData = useCallback((rawDataFilteredByKab: KsaAmatanRow[], currentUniqueStatuses: string[]) => {
      if (!rawDataFilteredByKab || rawDataFilteredByKab.length === 0) { setNamaLevelData([]); setNamaLevelTotals(null); return; }
      const groupedMap = new Map<string, { targetCount: number; realisasiCount: number; inkonsistenCount: number; nIs12Count: number; flagKode12Count: number; statusCounts: Record<string, number>; totalEntriesWithStatus: number; }>();
      let kabTarget = 0, kabRealisasi = 0, kabInkonsisten = 0, kabN12 = 0, kabF12 = 0;
      const kabOverallStatusCounts: Record<string, number> = {};
      let kabOverallTotalEntriesWithStatus = 0;
      rawDataFilteredByKab.forEach(item => { const namaKey = item.nama || "N/A"; if (!groupedMap.has(namaKey)) { groupedMap.set(namaKey, { targetCount: 0, realisasiCount: 0, inkonsistenCount: 0, nIs12Count: 0, flagKode12Count: 0, statusCounts: {}, totalEntriesWithStatus: 0, }); } const group = groupedMap.get(namaKey)!; if (item.subsegmen !== null && item.subsegmen.trim() !== '') { group.targetCount++; kabTarget++; } if (item.n !== null && item.n !== undefined) { group.realisasiCount++; kabRealisasi++; if (item.n === 12) { group.nIs12Count++; kabN12++; } } if (item.evaluasi === 'Inkonsisten') { group.inkonsistenCount++; kabInkonsisten++; } if (item.flag_kode_12 !== null && item.flag_kode_12.trim() !== '') { group.flagKode12Count++; kabF12++; } if (item.status && item.status.trim() !== '') { const currentStatus = item.status.trim(); group.statusCounts[currentStatus] = (group.statusCounts[currentStatus] || 0) + 1; group.totalEntriesWithStatus++; kabOverallStatusCounts[currentStatus] = (kabOverallStatusCounts[currentStatus] || 0) + 1; kabOverallTotalEntriesWithStatus++; } });
      const processedArray: ProcessedKsaNamaData[] = Array.from(groupedMap.entries()).map(([nama, grp]) => { const statusesForGroup: Record<string, StatusValue> = {}; currentUniqueStatuses.forEach(statusKey => { const count = grp.statusCounts[statusKey] || 0; statusesForGroup[statusKey] = { count: count, percentage: grp.totalEntriesWithStatus > 0 ? parseFloat(((count / grp.totalEntriesWithStatus) * 100).toFixed(2)) : 0 }; }); return { nama: nama, target: grp.targetCount, realisasi: grp.realisasiCount, persentase: grp.targetCount > 0 ? parseFloat(((grp.realisasiCount / grp.targetCount) * 100).toFixed(2)) : 0, inkonsisten: grp.inkonsistenCount, kode_12: grp.nIs12Count + grp.flagKode12Count, statuses: statusesForGroup, }; }).sort((a, b) => a.nama.localeCompare(b.nama));
      setNamaLevelData(processedArray);
      const kabOverallStatuses: Record<string, StatusValue> = {};
      currentUniqueStatuses.forEach(statusKey => { const count = kabOverallStatusCounts[statusKey] || 0; kabOverallStatuses[statusKey] = { count: count, percentage: kabOverallTotalEntriesWithStatus > 0 ? parseFloat(((count / kabOverallTotalEntriesWithStatus) * 100).toFixed(2)) : 0 }; });
      const kabTotalKode12 = kabN12 + kabF12;
      const kabOvPersentase = kabTarget > 0 ? parseFloat(((kabRealisasi / kabTarget) * 100).toFixed(2)) : 0;
      setNamaLevelTotals({ target: kabTarget, realisasi: kabRealisasi, persentase: kabOvPersentase, inkonsisten: kabInkonsisten, kode_12: kabTotalKode12, statuses: kabOverallStatuses, });
    }, []);

    const processDistrictData = useCallback((rawData: KsaAmatanRow[], currentUniqueStatuses: string[]) => {
      if (!rawData || rawData.length === 0) { setDistrictLevelData([]); setDistrictTotals(null); return; }
      const groupedMap = new Map<string, { kode_kab: string; targetCount: number; realisasiCount: number; inkonsistenCount: number; nIs12Count: number; flagKode12Count: number; statusCounts: Record<string, number>; totalEntriesWithStatus: number; }>();
      let ovTarget = 0, ovRealisasi = 0, ovInkonsisten = 0, ovN12 = 0, ovF12 = 0;
      const overallStatusCounts: Record<string, number> = {};
      let overallTotalEntriesWithStatus = 0;
      rawData.forEach(item => { if (!item.kabupaten || !item.kode_kab) return; if (!groupedMap.has(item.kabupaten)) { groupedMap.set(item.kabupaten, { kode_kab: item.kode_kab, targetCount: 0, realisasiCount: 0, inkonsistenCount: 0, nIs12Count: 0, flagKode12Count: 0, statusCounts: {}, totalEntriesWithStatus: 0, }); } const group = groupedMap.get(item.kabupaten)!; if (item.subsegmen !== null && item.subsegmen.trim() !== '') { group.targetCount++; ovTarget++; } if (item.n !== null && item.n !== undefined) { group.realisasiCount++; ovRealisasi++; if (item.n === 12) { group.nIs12Count++; ovN12++; } } if (item.evaluasi === 'Inkonsisten') { group.inkonsistenCount++; ovInkonsisten++; } if (item.flag_kode_12 !== null && item.flag_kode_12.trim() !== '') { group.flagKode12Count++; ovF12++; } if (item.status && item.status.trim() !== '') { const currentStatus = item.status.trim(); group.statusCounts[currentStatus] = (group.statusCounts[currentStatus] || 0) + 1; group.totalEntriesWithStatus++; overallStatusCounts[currentStatus] = (overallStatusCounts[currentStatus] || 0) + 1; overallTotalEntriesWithStatus++; } });
      const processedArray: ProcessedKsaDistrictData[] = Array.from(groupedMap.entries()).map(([kab, grp]) => { const statusesForGroup: Record<string, StatusValue> = {}; currentUniqueStatuses.forEach(statusKey => { const count = grp.statusCounts[statusKey] || 0; statusesForGroup[statusKey] = { count: count, percentage: grp.totalEntriesWithStatus > 0 ? parseFloat(((count / grp.totalEntriesWithStatus) * 100).toFixed(2)) : 0 }; }); return { kabupaten: kab, kode_kab: grp.kode_kab, target: grp.targetCount, realisasi: grp.realisasiCount, persentase: grp.targetCount > 0 ? parseFloat(((grp.realisasiCount / grp.targetCount) * 100).toFixed(2)) : 0, inkonsisten: grp.inkonsistenCount, kode_12: grp.nIs12Count + grp.flagKode12Count, statuses: statusesForGroup, }; }).sort((a, b) => a.kode_kab.localeCompare(b.kode_kab));
      setDistrictLevelData(processedArray);
      const overallStatuses: Record<string, StatusValue> = {};
      currentUniqueStatuses.forEach(statusKey => { const count = overallStatusCounts[statusKey] || 0; overallStatuses[statusKey] = { count: count, percentage: overallTotalEntriesWithStatus > 0 ? parseFloat(((count / overallTotalEntriesWithStatus) * 100).toFixed(2)) : 0 }; });
      const totalKode12 = ovN12 + ovF12;
      const ovPersentase = ovTarget > 0 ? parseFloat(((ovRealisasi / ovTarget) * 100).toFixed(2)) : 0;
      setDistrictTotals({ target: ovTarget, realisasi: ovRealisasi, persentase: ovPersentase, inkonsisten: ovInkonsisten, kode_12: totalKode12, statuses: overallStatuses, });
    }, []);

    const extractUniqueStatusesAndDate = useCallback((rawData: KsaAmatanRow[]) => {
      let maxTs: Date | null = null;
      const discoveredStatuses = new Set<string>();
      rawData.forEach(item => {
          if (item.tanggal) { const currentTs = new Date(item.tanggal); if (!maxTs || currentTs > maxTs) maxTs = currentTs; }
          if (item.status && item.status.trim() !== '') { discoveredStatuses.add(item.status.trim()); }
      });
      setLastUpdated(maxTs ? (maxTs as Date).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }) + ' WIB' : null);
      const sortedUniqueStatuses = Array.from(discoveredStatuses).sort();
      setUniqueStatusNames(sortedUniqueStatuses);
      return sortedUniqueStatuses;
    }, []);

    useEffect(() => {
      const findInitialMonth = async () => {
        if (!supabase || !selectedYear) { setIsLoading(false); setDisplayMonth(undefined); return; };
        setIsLoading(true); setError(null);
        const { data, error: dbError } = await supabase.from('ksa_amatan').select('bulan').eq('tahun', selectedYear).not('bulan', 'is', null).order('bulan', { ascending: false }).limit(1).single();
        if (dbError && dbError.code !== 'PGRST116') { setError("Gagal menentukan bulan awal: " + dbError.message); setIsLoading(false); return; }
        if (data && data.bulan) { setDisplayMonth(String(data.bulan)); } 
        else { setDisplayMonth(String(new Date().getMonth() + 1)); }
      };
      findInitialMonth();
    }, [selectedYear, supabase]);

    useEffect(() => {
        const executeFetch = async () => {
            if (!supabase || !selectedYear || !displayMonth) return;
            setIsLoading(true); setError(null); setKegiatanId(null);
            setLeaderboardData([]);

            try {
                const [kegiatanResult, ksaDataResult, leaderboardResult] = await Promise.all([
                    supabase.from('kegiatan').select('id').eq('nama_kegiatan', 'Kerangka Sampel Area').single(),
                    (async () => {
                        let rawData: KsaAmatanRow[] = [];
                        const selectColumns = ['kabupaten', 'kode_kab', 'subsegmen', 'n', 'evaluasi', 'flag_kode_12', 'tanggal', 'tahun', 'bulan', 'status', 'nama'];
                        let query = supabase.from('ksa_amatan').select(selectColumns.join(',')).eq('tahun', selectedYear);
                        if (displayMonth !== "Semua") { query = query.eq('bulan', parseInt(displayMonth)); }
                        let currentPage = 0; const itemsPerPage = 1000;
                        while(true) {
                            const { data: pageData, error: dbError } = await query.range(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage - 1);
                            if (dbError) throw dbError;
                            if (pageData) rawData = rawData.concat(pageData as unknown as KsaAmatanRow[]);
                            if (!pageData || pageData.length < itemsPerPage) break;
                            currentPage++;
                        }
                        return rawData;
                    })(),
                    supabase.rpc('get_ksa_monthly_leaderboard', {
                        p_tahun: selectedYear,
                        p_bulan: parseInt(displayMonth)
                    })
                ]);

                if (kegiatanResult.error) console.error("Gagal mengambil ID kegiatan KSA:", kegiatanResult.error.message);
                else setKegiatanId(kegiatanResult.data?.id || null);

                const rawData = ksaDataResult;
                setAllRawDataCache(rawData);
                const currentUniqueStatuses = extractUniqueStatusesAndDate(rawData);
                processDistrictData(rawData, currentUniqueStatuses);

                if (leaderboardResult.error) {
                    console.error("Gagal mengambil data leaderboard KSA:", leaderboardResult.error.message);
                } else {
                    setLeaderboardData(leaderboardResult.data || []);
                }

            } catch (err) { setError((err as Error).message || 'Gagal mengambil data KSA.');
            } finally { setIsLoading(false); }
        };
        executeFetch();
    }, [displayMonth, selectedYear, supabase, extractUniqueStatusesAndDate, processDistrictData]);

    useEffect(() => {
        if (allRawDataCache.length > 0 && selectedKabupatenCode) {
            const filteredByKab = allRawDataCache.filter(item => item.kode_kab === selectedKabupatenCode);
            processNamaLevelData(filteredByKab, uniqueStatusNames);
        } else {
            setNamaLevelData([]); setNamaLevelTotals(null);
        }
    }, [allRawDataCache, selectedKabupatenCode, uniqueStatusNames, processNamaLevelData]);

    return { 
        districtLevelData, districtTotals, isLoading, error, lastUpdated, 
        displayMonth, setDisplayMonth, uniqueStatusNames,
        namaLevelData, namaLevelTotals, 
        setSelectedKabupatenCode,
        kegiatanId,
        leaderboardData
    };
};