// Lokasi: src/hooks/useKsaJagungMonitoringData.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useYear } from '@/context/YearContext';
import { LeaderboardEntry } from '@/app/(dashboard)/monitoring/ksa-jagung/LeaderboardCard';

// Interface untuk data jagung - perbedaan utama: flag_kode_98 instead of flag_kode_12
interface KsaJagungAmatanRow { 
  id: number; 
  id_segmen: string | null; 
  subsegmen: string | null; 
  nama: string | null; 
  n: number | null; 
  amatan: string | null; 
  status: string | null; 
  evaluasi: string | null; 
  tanggal: string; 
  flag_kode_98: string | null;  // PERBEDAAN: flag_kode_98 instead of flag_kode_12
  note: string | null; 
  kode_kab: string | null; 
  kode_kec: string | null; 
  kabupaten: string | null; 
  bulan: number | null; 
  tahun: number | null; 
  uploaded_at: string | null;
}

export interface StatusValue { 
  count: number; 
  percentage: number; 
}

export interface ProcessedKsaJagungDistrictData { 
  kabupaten: string; 
  kode_kab: string; 
  target: number; 
  realisasi: number; 
  persentase: number; 
  inkonsisten: number; 
  kode_98: number;  // PERBEDAAN: kode_98 instead of kode_12
  statuses?: Record<string, StatusValue>; 
}

export interface KsaJagungDistrictTotals { 
  target: number; 
  realisasi: number; 
  persentase: number; 
  inkonsisten: number; 
  kode_98: number;  // PERBEDAAN: kode_98 instead of kode_12
  statuses?: Record<string, StatusValue>; 
}

export interface ProcessedKsaJagungNamaData { 
  nama: string; 
  target: number; 
  realisasi: number; 
  persentase: number; 
  inkonsisten: number; 
  kode_98: number;  // PERBEDAAN: kode_98 instead of kode_12
  statuses?: Record<string, StatusValue>; 
}

export interface KsaJagungNamaTotals { 
  target: number; 
  realisasi: number; 
  persentase: number; 
  inkonsisten: number; 
  kode_98: number;  // PERBEDAAN: kode_98 instead of kode_12
  statuses?: Record<string, StatusValue>; 
}

export interface KsaJagungMonitoringHookResult {
    districtLevelData: ProcessedKsaJagungDistrictData[];
    districtTotals: KsaJagungDistrictTotals | null;
    isLoading: boolean;
    error: string | null;
    lastUpdated: string | null;
    displayMonth: string | undefined;
    setDisplayMonth: React.Dispatch<React.SetStateAction<string | undefined>>;
    uniqueStatusNames: string[];
    namaLevelData: ProcessedKsaJagungNamaData[];
    namaLevelTotals: KsaJagungNamaTotals | null;
    setSelectedKabupatenCode: React.Dispatch<React.SetStateAction<string | null>>;
    leaderboardData: LeaderboardEntry[];
    kegiatanId: string | null;
}

export const useKsaJagungMonitoringData = (): KsaJagungMonitoringHookResult => {
    const { supabase } = useAuth();
    const { selectedYear } = useYear();
  
    const [displayMonth, setDisplayMonth] = useState<string | undefined>(undefined);
    const [districtLevelData, setDistrictLevelData] = useState<ProcessedKsaJagungDistrictData[]>([]);
    const [districtTotals, setDistrictTotals] = useState<KsaJagungDistrictTotals | null>(null);
    const [selectedKabupatenCode, setSelectedKabupatenCode] = useState<string | null>(null);
    const [namaLevelData, setNamaLevelData] = useState<ProcessedKsaJagungNamaData[]>([]);
    const [namaLevelTotals, setNamaLevelTotals] = useState<KsaJagungNamaTotals | null>(null);
    const [allRawDataCache, setAllRawDataCache] = useState<KsaJagungAmatanRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [uniqueStatusNames, setUniqueStatusNames] = useState<string[]>([]);
    const [kegiatanId, setKegiatanId] = useState<string | null>(null);
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    
    const processNamaLevelData = useCallback((rawDataFilteredByKab: KsaJagungAmatanRow[], currentUniqueStatuses: string[]) => {
      if (!rawDataFilteredByKab || rawDataFilteredByKab.length === 0) { 
        setNamaLevelData([]); 
        setNamaLevelTotals(null); 
        return; 
      }
      
      const groupedMap = new Map<string, { 
        targetCount: number; 
        realisasiCount: number; 
        inkonsistenCount: number; 
        nIs98Count: number;  // PERBEDAAN: nIs98Count instead of nIs12Count
        flagKode98Count: number;  // PERBEDAAN: flagKode98Count instead of flagKode12Count
        statusCounts: Record<string, number>; 
        totalEntriesWithStatus: number; 
      }>();
      
      let kabTarget = 0, kabRealisasi = 0, kabInkonsisten = 0, kabN98 = 0, kabF98 = 0;
      const kabOverallStatusCounts: Record<string, number> = {};
      let kabOverallTotalEntriesWithStatus = 0;
      
      rawDataFilteredByKab.forEach(item => { 
        const namaKey = item.nama || "N/A"; 
        if (!groupedMap.has(namaKey)) { 
          groupedMap.set(namaKey, { 
            targetCount: 0, 
            realisasiCount: 0, 
            inkonsistenCount: 0, 
            nIs98Count: 0,  // PERBEDAAN: nIs98Count
            flagKode98Count: 0,  // PERBEDAAN: flagKode98Count
            statusCounts: {}, 
            totalEntriesWithStatus: 0, 
          }); 
        } 
        
        const group = groupedMap.get(namaKey)!; 
        
        if (item.subsegmen !== null && item.subsegmen.trim() !== '') { 
          group.targetCount++; 
          kabTarget++; 
        } 
        
        if (item.n !== null && item.n !== undefined) { 
          group.realisasiCount++; 
          kabRealisasi++; 
          // PERBEDAAN: Check for n === 98 instead of n === 12
          if (item.n === 98) { 
            group.nIs98Count++; 
            kabN98++; 
          } 
        } 
        
        if (item.evaluasi === 'Inkonsisten') { 
          group.inkonsistenCount++; 
          kabInkonsisten++; 
        } 
        
        // PERBEDAAN: Check flag_kode_98 instead of flag_kode_12
        if (item.flag_kode_98 !== null && item.flag_kode_98.trim() !== '') { 
          group.flagKode98Count++; 
          kabF98++; 
        } 
        
        if (item.status && item.status.trim() !== '') { 
          const currentStatus = item.status.trim(); 
          group.statusCounts[currentStatus] = (group.statusCounts[currentStatus] || 0) + 1; 
          group.totalEntriesWithStatus++; 
          kabOverallStatusCounts[currentStatus] = (kabOverallStatusCounts[currentStatus] || 0) + 1; 
          kabOverallTotalEntriesWithStatus++; 
        } 
      });
      
      const processedArray: ProcessedKsaJagungNamaData[] = Array.from(groupedMap.entries()).map(([nama, grp]) => { 
        const statusesForGroup: Record<string, StatusValue> = {};
        currentUniqueStatuses.forEach(statusKey => { 
          const count = grp.statusCounts[statusKey] || 0; 
          statusesForGroup[statusKey] = { 
            count: count, 
            percentage: grp.totalEntriesWithStatus > 0 ? parseFloat(((count / grp.totalEntriesWithStatus) * 100).toFixed(2)) : 0 
          }; 
        }); 
        
        return { 
          nama: nama, 
          target: grp.targetCount, 
          realisasi: grp.realisasiCount, 
          persentase: grp.targetCount > 0 ? parseFloat(((grp.realisasiCount / grp.targetCount) * 100).toFixed(2)) : 0, 
          inkonsisten: grp.inkonsistenCount, 
          kode_98: grp.nIs98Count + grp.flagKode98Count,  // PERBEDAAN: kode_98
          statuses: statusesForGroup, 
        }; 
      }).sort((a, b) => a.nama.localeCompare(b.nama));
      
      setNamaLevelData(processedArray);
      
      const kabOverallStatuses: Record<string, StatusValue> = {};
      currentUniqueStatuses.forEach(statusKey => { 
        const count = kabOverallStatusCounts[statusKey] || 0; 
        kabOverallStatuses[statusKey] = { 
          count: count, 
          percentage: kabOverallTotalEntriesWithStatus > 0 ? parseFloat(((count / kabOverallTotalEntriesWithStatus) * 100).toFixed(2)) : 0 
        }; 
      });
      
      const kabTotalKode98 = kabN98 + kabF98;  // PERBEDAAN: kode_98
      const kabOvPersentase = kabTarget > 0 ? parseFloat(((kabRealisasi / kabTarget) * 100).toFixed(2)) : 0;
      
      setNamaLevelTotals({ 
        target: kabTarget, 
        realisasi: kabRealisasi, 
        persentase: kabOvPersentase, 
        inkonsisten: kabInkonsisten, 
        kode_98: kabTotalKode98,  // PERBEDAAN: kode_98
        statuses: kabOverallStatuses, 
      });
    }, []);

    const processDistrictData = useCallback((rawData: KsaJagungAmatanRow[], currentUniqueStatuses: string[]) => {
      if (!rawData || rawData.length === 0) { 
        setDistrictLevelData([]); 
        setDistrictTotals(null); 
        return; 
      }
      
      const groupedMap = new Map<string, { 
        kode_kab: string; 
        targetCount: number; 
        realisasiCount: number; 
        inkonsistenCount: number; 
        nIs98Count: number;  // PERBEDAAN: nIs98Count
        flagKode98Count: number;  // PERBEDAAN: flagKode98Count
        statusCounts: Record<string, number>; 
        totalEntriesWithStatus: number; 
      }>();
      
      let ovTarget = 0, ovRealisasi = 0, ovInkonsisten = 0, ovN98 = 0, ovF98 = 0;
      const overallStatusCounts: Record<string, number> = {};
      let overallTotalEntriesWithStatus = 0;
      
      rawData.forEach(item => { 
        if (!item.kabupaten || !item.kode_kab) return; 
        
        if (!groupedMap.has(item.kabupaten)) { 
          groupedMap.set(item.kabupaten, { 
            kode_kab: item.kode_kab, 
            targetCount: 0, 
            realisasiCount: 0, 
            inkonsistenCount: 0, 
            nIs98Count: 0,  // PERBEDAAN: nIs98Count
            flagKode98Count: 0,  // PERBEDAAN: flagKode98Count
            statusCounts: {}, 
            totalEntriesWithStatus: 0, 
          }); 
        } 
        
        const group = groupedMap.get(item.kabupaten)!; 
        
        if (item.subsegmen !== null && item.subsegmen.trim() !== '') { 
          group.targetCount++; 
          ovTarget++; 
        } 
        
        if (item.n !== null && item.n !== undefined) { 
          group.realisasiCount++; 
          ovRealisasi++; 
          // PERBEDAAN: Check for n === 98 instead of n === 12
          if (item.n === 98) { 
            group.nIs98Count++; 
            ovN98++; 
          } 
        } 
        
        if (item.evaluasi === 'Inkonsisten') { 
          group.inkonsistenCount++; 
          ovInkonsisten++; 
        } 
        
        // PERBEDAAN: Check flag_kode_98 instead of flag_kode_12
        if (item.flag_kode_98 !== null && item.flag_kode_98.trim() !== '') { 
          group.flagKode98Count++; 
          ovF98++; 
        } 
        
        if (item.status && item.status.trim() !== '') { 
          const currentStatus = item.status.trim(); 
          group.statusCounts[currentStatus] = (group.statusCounts[currentStatus] || 0) + 1; 
          group.totalEntriesWithStatus++; 
          overallStatusCounts[currentStatus] = (overallStatusCounts[currentStatus] || 0) + 1; 
          overallTotalEntriesWithStatus++; 
        } 
      });
      
      const processedArray: ProcessedKsaJagungDistrictData[] = Array.from(groupedMap.entries()).map(([kab, grp]) => { 
        const statusesForGroup: Record<string, StatusValue> = {};
        currentUniqueStatuses.forEach(statusKey => { 
          const count = grp.statusCounts[statusKey] || 0; 
          statusesForGroup[statusKey] = { 
            count: count, 
            percentage: grp.totalEntriesWithStatus > 0 ? parseFloat(((count / grp.totalEntriesWithStatus) * 100).toFixed(2)) : 0 
          }; 
        }); 
        
        return { 
          kabupaten: kab, 
          kode_kab: grp.kode_kab, 
          target: grp.targetCount, 
          realisasi: grp.realisasiCount, 
          persentase: grp.targetCount > 0 ? parseFloat(((grp.realisasiCount / grp.targetCount) * 100).toFixed(2)) : 0, 
          inkonsisten: grp.inkonsistenCount, 
          kode_98: grp.nIs98Count + grp.flagKode98Count,  // PERBEDAAN: kode_98
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
      
      const totalKode98 = ovN98 + ovF98;  // PERBEDAAN: kode_98
      const ovPersentase = ovTarget > 0 ? parseFloat(((ovRealisasi / ovTarget) * 100).toFixed(2)) : 0;
      
      setDistrictTotals({ 
        target: ovTarget, 
        realisasi: ovRealisasi, 
        persentase: ovPersentase, 
        inkonsisten: ovInkonsisten, 
        kode_98: totalKode98,  // PERBEDAAN: kode_98
        statuses: overallStatuses, 
      });
    }, []);

    const extractUniqueStatusesAndDate = useCallback((rawData: KsaJagungAmatanRow[]) => {
      let maxTs: Date | null = null;
      const discoveredStatuses = new Set<string>();
      
      rawData.forEach(item => {
          if (item.uploaded_at) { 
            const currentTs = new Date(item.uploaded_at); 
            if (!maxTs || currentTs > maxTs) maxTs = currentTs; 
          }
          if (item.status && item.status.trim() !== '') { 
            discoveredStatuses.add(item.status.trim()); 
          }
      });
      
      setLastUpdated(maxTs ? (maxTs as Date).toLocaleString('id-ID', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        timeZone: 'Asia/Jakarta' 
      }) + ' WIB' : null);
      
      const sortedUniqueStatuses = Array.from(discoveredStatuses).sort();
      setUniqueStatusNames(sortedUniqueStatuses);
      return sortedUniqueStatuses;
    }, []);

    useEffect(() => {
      const findInitialMonth = async () => {
        if (!supabase || !selectedYear) { 
          setIsLoading(false); 
          setDisplayMonth(undefined); 
          return; 
        }
        
        setIsLoading(true); 
        setError(null);
        
        // PERBEDAAN: Query dari tabel ksa_amatan_jagung instead of ksa_amatan
        const { data, error: dbError } = await supabase
          .from('ksa_amatan_jagung')
          .select('bulan')
          .eq('tahun', selectedYear)
          .not('bulan', 'is', null)
          .order('bulan', { ascending: false })
          .limit(1)
          .single();
        
        if (dbError && dbError.code !== 'PGRST116') { 
          setError("Gagal menentukan bulan awal: " + dbError.message); 
          setIsLoading(false); 
          return; 
        }
        
        if (data && data.bulan) { 
          setDisplayMonth(String(data.bulan)); 
        } else { 
          setDisplayMonth(String(new Date().getMonth() + 1)); 
        }
      };
      findInitialMonth();
    }, [selectedYear, supabase]);

    useEffect(() => {
        const executeFetch = async () => {
            if (!supabase || !selectedYear || !displayMonth) return;
            setIsLoading(true); 
            setError(null); 
            setKegiatanId(null);
            setLeaderboardData([]);

            try {
                const [kegiatanResult, ksaDataResult, leaderboardResult] = await Promise.all([
                    // PERBEDAAN: Mencari kegiatan dengan nama yang berbeda untuk jagung (fallback jika belum ada)
                    supabase.from('kegiatan').select('id').eq('nama_kegiatan', 'Kerangka Sampel Area Jagung').single()
                      .then(result => result.error && result.error.code === 'PGRST116' 
                        ? supabase.from('kegiatan').select('id').eq('nama_kegiatan', 'Kerangka Sampel Area').single()
                        : result),
                    (async () => {
                        let rawData: KsaJagungAmatanRow[] = [];
                        // PERBEDAAN: Query ke tabel ksa_amatan_jagung dan menggunakan flag_kode_98
                        const selectColumns = ['kabupaten', 'kode_kab', 'subsegmen', 'n', 'evaluasi', 'flag_kode_98', 'uploaded_at', 'tahun', 'bulan', 'status', 'nama'];
                        let query = supabase.from('ksa_amatan_jagung').select(selectColumns.join(',')).eq('tahun', selectedYear);
                        if (displayMonth !== "Semua") { 
                          query = query.eq('bulan', parseInt(displayMonth)); 
                        }
                        
                        let currentPage = 0; 
                        const itemsPerPage = 1000;
                        
                        while(true) {
                            const { data: pageData, error: dbError } = await query.range(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage - 1);
                            if (dbError) throw dbError;
                            if (pageData) rawData = rawData.concat(pageData as unknown as KsaJagungAmatanRow[]);
                            if (!pageData || pageData.length < itemsPerPage) break;
                            currentPage++;
                        }
                        return rawData;
                    })(),
                    // Fallback untuk leaderboard jika RPC belum ada
                    supabase.rpc('get_ksa_jagung_monthly_leaderboard', {
                        p_tahun: selectedYear,
                        p_bulan: parseInt(displayMonth)
                    }).then(result => {
                        if (result.error && result.error.code === '42883') {
                            // Function tidak ditemukan, return empty result
                            console.warn("RPC get_ksa_jagung_monthly_leaderboard belum tersedia");
                            return { data: [], error: null };
                        }
                        return result;
                    })
                ]);

                if (kegiatanResult.error) console.error("Gagal mengambil ID kegiatan KSA Jagung:", kegiatanResult.error.message);
                else setKegiatanId(kegiatanResult.data?.id || null);

                const rawData = ksaDataResult;
                setAllRawDataCache(rawData);
                const currentUniqueStatuses = extractUniqueStatusesAndDate(rawData);
                processDistrictData(rawData, currentUniqueStatuses);

                if (leaderboardResult.error) {
                    console.error("Gagal mengambil data leaderboard KSA Jagung:", leaderboardResult.error.message);
                    // Set empty leaderboard jika RPC belum ada
                    setLeaderboardData([]);
                } else {
                    setLeaderboardData(leaderboardResult.data || []);
                }

            } catch (err) { 
              setError((err as Error).message || 'Gagal mengambil data KSA Jagung.');
            } finally { 
              setIsLoading(false); 
            }
        };
        executeFetch();
    }, [displayMonth, selectedYear, supabase, extractUniqueStatusesAndDate, processDistrictData]);

    useEffect(() => {
        if (allRawDataCache.length > 0 && selectedKabupatenCode) {
            const filteredByKab = allRawDataCache.filter(item => item.kode_kab === selectedKabupatenCode);
            processNamaLevelData(filteredByKab, uniqueStatusNames);
        } else {
            setNamaLevelData([]); 
            setNamaLevelTotals(null);
        }
    }, [allRawDataCache, selectedKabupatenCode, uniqueStatusNames, processNamaLevelData]);

    return { 
        districtLevelData, 
        districtTotals, 
        isLoading, 
        error, 
        lastUpdated, 
        displayMonth, 
        setDisplayMonth, 
        uniqueStatusNames,
        namaLevelData, 
        namaLevelTotals, 
        setSelectedKabupatenCode,
        kegiatanId,
        leaderboardData
    };
};
