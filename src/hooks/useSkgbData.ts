"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useYear } from '@/context/YearContext';

export interface SkgbPengeringanData {
  id: number;
  kdprov: number | null;
  nmprov: string | null;
  kdkab: string | null;
  nmkab: string | null;
  kdkec: string | null;
  nmkec: string | null;
  lokasi: string | null;
  idsubsegmen: string | null;
  nks: number | null;
  fase_amatan: number | null;
  x: number | null;
  y: number | null;
  bulan_panen: string | null;
  flag_sampel: string | null;
  petugas: string | null;
  email_petugas: string | null;
  status_pendataan: string | null;
  date_modified: string | null;
  created_at: string | null;
}

export interface SkgbRpcResult {
  kabupaten: string;
  kode_kab: string;
  target_utama: number;
  cadangan: number;
  realisasi: number;
  persentase: number;
  jumlah_petugas: number;
}

export interface SkgbDetailData {
  kecamatan: string;
  kode_kec: string;
  lokasi: string;
  target_utama: number;
  cadangan: number;
  realisasi: number;
  persentase: number;
}

export interface SkgbDistrictData {
  kabupaten: string;
  kode_kab: string;
  target_utama: number;
  cadangan: number;
  realisasi: number;
  persentase: number;
  jumlah_petugas: number;
}

export interface SkgbSummaryTotals {
  target_utama: number;
  cadangan: number;
  realisasi: number;
  persentase: number;
}

export interface SkgbKabupatenSummary {
  total_kecamatan_u: number;
  total_kecamatan_c: number;
  total_desa_u: number;
  total_desa_c: number;
  target_utama: number;
  cadangan: number;
  realisasi: number;
  persentase: number;
  total_petugas: number;
}

export interface SkgbMonitoringHookResult {
  districtData: SkgbDistrictData[];
  totals: SkgbSummaryTotals | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  kegiatanId: string | null;
  refetch: () => Promise<void>;
}

export function useSkgbData(): SkgbMonitoringHookResult {
  const { supabase } = useAuth();
  const { selectedYear } = useYear();
  
  const [districtData, setDistrictData] = useState<SkgbDistrictData[]>([]);
  const [totals, setTotals] = useState<SkgbSummaryTotals | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [kegiatanId, setKegiatanId] = useState<string | null>(null);

  // Hardcoded data jumlah petugas per kabupaten (data riil berdasarkan lapangan)
  const petugasData: Record<string, number> = {
    '6101': 5,  // Banda Aceh
    '6102': 5,  // Sabang
    '6103': 5,  // Aceh Selatan
    '6104': 4,  // Aceh Tenggara
    '6105': 2,  // Aceh Timur
    '6106': 5,  // Aceh Tengah
    '6107': 2,  // Aceh Barat
    '6108': 1,  // Aceh Besar
    '6109': 2,  // Pidie
    '6110': 2,  // Bireuen
    '6111': 2,  // Aceh Utara
    '6112': 3,  // Aceh Barat Daya
    '6171': 0,  // Kota Banda Aceh
    '6172': 3   // Kota Sabang
  };

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setKegiatanId(null); // Reset kegiatan ID

      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      // Use hardcoded SKGB kegiatan ID (like ubinan monitoring pattern)
      const hardcodedKegiatanId = 'b0b0b0b0-0002-4002-8002-000000000002';
      setKegiatanId(hardcodedKegiatanId);
      
      // Note: Using hardcoded ID because SKGB kegiatan might not exist in database yet
      // or has different naming convention

      // Menggunakan RPC function untuk mendapatkan data SKGB yang sudah diproses
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_skgb_monitoring_data', {
        p_tahun: selectedYear
      });

      if (rpcError) {
        throw rpcError;
      }

      if (rpcData && rpcData.length > 0) {
        // Data dari RPC sudah dalam format yang diinginkan
        const processedData: SkgbDistrictData[] = rpcData.map((item: SkgbRpcResult) => ({
          kabupaten: item.kabupaten || 'Unknown',
          kode_kab: item.kode_kab || 'Unknown',
          target_utama: item.target_utama || 0,
          cadangan: item.cadangan || 0,
          realisasi: item.realisasi || 0,
          persentase: item.persentase || 0,
          jumlah_petugas: petugasData[item.kode_kab] || 0
        }));

        // Sort ascending by kode_kab
        processedData.sort((a, b) => a.kode_kab.localeCompare(b.kode_kab));

        // Calculate totals
        const totalTargetUtama = processedData.reduce((sum, item) => sum + item.target_utama, 0);
        const totalCadangan = processedData.reduce((sum, item) => sum + item.cadangan, 0);
        const totalRealisasi = processedData.reduce((sum, item) => sum + item.realisasi, 0);
        const overallPersentase = totalTargetUtama > 0 ? (totalRealisasi / totalTargetUtama) * 100 : 0;

        const totalsData: SkgbSummaryTotals = {
          target_utama: totalTargetUtama,
          cadangan: totalCadangan,
          realisasi: totalRealisasi,
          persentase: overallPersentase
        };

        setDistrictData(processedData);
        setTotals(totalsData);

        // Set last updated timestamp (assuming RPC returns this info or use current time)
        setLastUpdated(new Date().toLocaleString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Asia/Jakarta'
        }) + ' WIB');
      } else {
        // No data found
        setDistrictData([]);
        setTotals(null);
        setLastUpdated(null);
      }
      
    } catch (err) {
      console.error('Error fetching SKGB data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      // Set empty data on error
      setDistrictData([]);
      setTotals(null);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);  // Debug log untuk return values
  
  return {
    districtData,
    totals,
    isLoading,
    error,
    lastUpdated,
    kegiatanId,
    refetch: fetchData
  };
}

// Hook untuk mendapatkan data detail berdasarkan kabupaten
export function useSkgbDetailData(kodeKab: string | null) {
  const { supabase } = useAuth();
  const { selectedYear } = useYear();
  const [detailData, setDetailData] = useState<SkgbDetailData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetailData = useCallback(async () => {
    if (!kodeKab || !supabase) {
      setDetailData([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Menggunakan RPC function untuk detail data berdasarkan kabupaten
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_skgb_detail_by_kabupaten', {
        p_kode_kab: kodeKab,
        p_tahun: selectedYear
      });

      if (rpcError) {
        throw rpcError;
      }

      setDetailData(rpcData || []);
    } catch (err) {
      console.error('Error fetching SKGB detail data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setDetailData([]);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, kodeKab, selectedYear]);

  useEffect(() => {
    fetchDetailData();
  }, [fetchDetailData]);

  return {
    detailData,
    isLoading,
    error,
    refetch: fetchDetailData
  };
}

// Hook untuk mendapatkan summary data berdasarkan kabupaten  
export function useSkgbSummaryByKabupaten(kodeKab: string | null) {
  const { supabase } = useAuth();
  const { selectedYear } = useYear();
  const [summaryData, setSummaryData] = useState<SkgbKabupatenSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hardcoded data jumlah petugas per kabupaten (same as main hook)
  const petugasData: Record<string, number> = {
    '6101': 5,  // Banda Aceh
    '6102': 5,  // Sabang
    '6103': 5,  // Aceh Selatan
    '6104': 4,  // Aceh Tenggara
    '6105': 2,  // Aceh Timur
    '6106': 5,  // Aceh Tengah
    '6107': 2,  // Aceh Barat
    '6108': 1,  // Aceh Besar
    '6109': 2,  // Pidie
    '6110': 2,  // Bireuen
    '6111': 2,  // Aceh Utara
    '6112': 3,  // Aceh Barat Daya
    '6171': 0,  // Kota Banda Aceh
    '6172': 3   // Kota Sabang
  };

  const fetchSummaryData = useCallback(async () => {
    if (!kodeKab || !supabase) {
      setSummaryData(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);


      // Try RPC function first, fallback to direct query if RPC doesn't exist
      let rpcData, rpcError;
      
      try {
        // Menggunakan RPC function untuk summary data berdasarkan kabupaten
        const rpcResult = await supabase.rpc('get_skgb_summary_by_kabupaten_v2', {
          p_kode_kab: kodeKab,
          p_tahun: selectedYear
        });
        rpcData = rpcResult.data;
        rpcError = rpcResult.error;
        
        // If RPC error indicates function doesn't exist, use fallback
        if (rpcError && (rpcError.message?.includes('function') || rpcError.code === '42883')) {
          throw new Error('RPC_NOT_FOUND');
        }
        
        if (rpcError) {
          throw rpcError;
        }
      } catch {
        // Fallback: Use direct query instead of RPC
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('skgb_pengeringan')
          .select('kdkec, lokasi, flag_sampel, status_pendataan, created_at')
          .eq('kdkab', kodeKab);

        if (fallbackError) {
          console.error('🔧 SKGB Summary - Fallback query error:', fallbackError);
          throw fallbackError;
        }


        // Filter by year manually since we can't use EXTRACT in client
        const filteredData = fallbackData?.filter(item => {
          if (!item.created_at) return false;
          const year = new Date(item.created_at).getFullYear();
          return year === selectedYear;
        }) || [];


        // Process data manually
        const kecamatanStatsU = new Map<string, number>();
        const kecamatanStatsC = new Map<string, number>();
        const desaStatsU = new Map<string, number>();
        const desaStatsC = new Map<string, number>();
        let targetUtama = 0;
        let cadangan = 0;
        let realisasi = 0;

        filteredData.forEach(item => {
          if (item.flag_sampel === 'U') {
            // Count records per kecamatan and desa for flag U
            kecamatanStatsU.set(item.kdkec, (kecamatanStatsU.get(item.kdkec) || 0) + 1);
            desaStatsU.set(item.lokasi, (desaStatsU.get(item.lokasi) || 0) + 1);
            targetUtama++;
            if (item.status_pendataan === 'Selesai Didata') {
              realisasi++;
            }
          }
          if (item.flag_sampel === 'C') {
            // Count records per kecamatan and desa for flag C
            kecamatanStatsC.set(item.kdkec, (kecamatanStatsC.get(item.kdkec) || 0) + 1);
            desaStatsC.set(item.lokasi, (desaStatsC.get(item.lokasi) || 0) + 1);
            cadangan++;
          }
        });

        const persentase = targetUtama > 0 ? (realisasi / targetUtama) * 100 : 0;

        rpcData = [{
          total_kecamatan_u: kecamatanStatsU.size, // Kecamatan yang memiliki minimal 1 flag U
          total_kecamatan_c: kecamatanStatsC.size, // Kecamatan yang memiliki minimal 1 flag C
          total_desa_u: desaStatsU.size, // Desa yang memiliki minimal 1 flag U
          total_desa_c: desaStatsC.size, // Desa yang memiliki minimal 1 flag C
          target_utama: targetUtama,
          cadangan: cadangan,
          realisasi: realisasi,
          persentase: Math.round(persentase * 100) / 100,
          total_petugas: 0 // Will be overridden
        }];
        rpcError = null;
        
      }

      if (rpcError) {
        console.error('🔧 SKGB Summary - RPC Error:', rpcError);
        throw rpcError;
      }

      if (rpcData?.[0]) {
        // Override total_petugas with hardcoded data
        const summaryWithPetugas = {
          ...rpcData[0],
          total_petugas: petugasData[kodeKab] || 0
        };
        setSummaryData(summaryWithPetugas);
      } else {
        setSummaryData(null);
      }
    } catch (err) {
      console.error('🔧 SKGB Summary - Error fetching SKGB summary data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setSummaryData(null);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, kodeKab, selectedYear]);

  useEffect(() => {
    fetchSummaryData();
  }, [fetchSummaryData]);

  return {
    summaryData,
    isLoading,
    error,
    refetch: fetchSummaryData
  };
}
