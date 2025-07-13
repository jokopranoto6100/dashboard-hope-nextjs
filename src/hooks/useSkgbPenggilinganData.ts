"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useYear } from '@/context/YearContext';

export interface SkgbPenggilinganRawData {
  id: number;
  kdprov: string | null;
  nmprov: string | null;
  kdkab: string | null;
  nmkab: string | null;
  kdkec: string | null;
  nmkec: string | null;
  kddesa: string | null;
  nmdesa: string | null;
  id_sbr: string | null;
  nks: string | null;
  nama_usaha: string | null;
  narahubung: string | null;
  telp: string | null;
  alamat_usaha: string | null;
  x: number | null;
  y: number | null;
  skala_usaha: string | null;
  flag_sampel: string | null;
  petugas: string | null;
  email_petugas: string | null;
  status_pendataan: string | null;
  date_modified: string | null;
  created_at: string | null;
  tahun: number | null;
}

export interface SkgbPenggilinganRpcResult {
  kabupaten: string;
  kode_kab: string;
  target_utama: number;
  cadangan: number;
  realisasi: number;
  persentase: number;
  jumlah_petugas: number;
}

export interface SkgbPenggilinganDetailData {
  kecamatan: string;
  kode_kec: string;
  desa: string;          // NEW: nmdesa (different from pengeringan)
  kode_desa: string;     // NEW: kddesa
  target_utama: number;
  cadangan: number;
  realisasi: number;
  persentase: number;
}

export interface SkgbPenggilinganDistrictData {
  kabupaten: string;
  kode_kab: string;
  target_utama: number;
  cadangan: number;
  realisasi: number;
  persentase: number;
  jumlah_petugas: number;
}

export interface SkgbPenggilinganSummaryTotals {
  target_utama: number;
  cadangan: number;
  realisasi: number;
  persentase: number;
}

export interface SkgbPenggilinganKabupatenSummary {
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

export interface SkgbPenggilinganMonitoringHookResult {
  districtData: SkgbPenggilinganDistrictData[];
  totals: SkgbPenggilinganSummaryTotals | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  kegiatanId: string | null;
  refetch: () => Promise<void>;
}

export function useSkgbPenggilinganData(enabled: boolean = true): SkgbPenggilinganMonitoringHookResult {
  const { supabase } = useAuth();
  const { selectedYear } = useYear();
  
  const [districtData, setDistrictData] = useState<SkgbPenggilinganDistrictData[]>([]);
  const [totals, setTotals] = useState<SkgbPenggilinganSummaryTotals | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [kegiatanId, setKegiatanId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // Performance optimization: Skip fetch if not enabled
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setKegiatanId(null);

      if (!supabase) {
        throw new Error('Sistem tidak tersedia. Silakan refresh halaman.');
      }

      // Use same kegiatan ID as pengeringan (as per specification)
      const hardcodedKegiatanId = 'b0b0b0b0-0002-4002-8002-000000000002';
      setKegiatanId(hardcodedKegiatanId);
      
      // Menggunakan RPC function untuk mendapatkan data SKGB Penggilingan yang sudah diproses
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_skgb_penggilingan_monitoring_data', {
        p_tahun: selectedYear
      });

      if (rpcError) {
        // Enhanced error handling with user-friendly messages
        let errorMessage = 'Gagal mengambil data SKGB Penggilingan';
        if (rpcError.message?.includes('network')) {
          errorMessage = 'Koneksi bermasalah. Periksa jaringan internet Anda.';
        } else if (rpcError.message?.includes('permission')) {
          errorMessage = 'Anda tidak memiliki akses untuk melihat data ini.';
        } else if (rpcError.message?.includes('timeout')) {
          errorMessage = 'Permintaan timeout. Silakan coba lagi.';
        }
        throw new Error(errorMessage);
      }

      if (rpcData && rpcData.length > 0) {
        // Data dari RPC sudah dalam format yang diinginkan
        const processedData: SkgbPenggilinganDistrictData[] = rpcData.map((item: SkgbPenggilinganRpcResult) => ({
          kabupaten: item.kabupaten || 'Unknown',
          kode_kab: item.kode_kab || 'Unknown',
          target_utama: item.target_utama || 0,
          cadangan: item.cadangan || 0,
          realisasi: item.realisasi || 0,
          persentase: item.persentase || 0,
          jumlah_petugas: item.jumlah_petugas || 0 // RPC sudah include petugas mapping
        }));

        // Sort ascending by kode_kab
        processedData.sort((a, b) => a.kode_kab.localeCompare(b.kode_kab));

        // Calculate totals
        const totalTargetUtama = processedData.reduce((sum, item) => sum + item.target_utama, 0);
        const totalCadangan = processedData.reduce((sum, item) => sum + item.cadangan, 0);
        const totalRealisasi = processedData.reduce((sum, item) => sum + item.realisasi, 0);
        const overallPersentase = totalTargetUtama > 0 ? (totalRealisasi / totalTargetUtama) * 100 : 0;

        const totalsData: SkgbPenggilinganSummaryTotals = {
          target_utama: totalTargetUtama,
          cadangan: totalCadangan,
          realisasi: totalRealisasi,
          persentase: overallPersentase
        };

        setDistrictData(processedData);
        setTotals(totalsData);

        // Set last updated timestamp
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
      console.error('Error fetching SKGB Penggilingan data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui';
      setError(errorMessage);
      // Set empty data on error
      setDistrictData([]);
      setTotals(null);
    } finally {
      setIsLoading(false);
    }
  }, [supabase, selectedYear, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Debug log untuk return values

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
export function useSkgbPenggilinganDetailData(kodeKab: string | null) {
  const { supabase } = useAuth();
  const { selectedYear } = useYear();
  const [detailData, setDetailData] = useState<SkgbPenggilinganDetailData[]>([]);
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
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_skgb_penggilingan_detail_by_kabupaten', {
        p_kode_kab: kodeKab,
        p_tahun: selectedYear
      });

      if (rpcError) {
        // Enhanced error handling with user-friendly messages
        let errorMessage = 'Gagal mengambil detail data SKGB Penggilingan';
        if (rpcError.message?.includes('network')) {
          errorMessage = 'Koneksi bermasalah. Periksa jaringan internet Anda.';
        } else if (rpcError.message?.includes('permission')) {
          errorMessage = 'Anda tidak memiliki akses untuk melihat data ini.';
        } else if (rpcError.message?.includes('timeout')) {
          errorMessage = 'Permintaan timeout. Silakan coba lagi.';
        }
        throw new Error(errorMessage);
      }

      setDetailData(rpcData || []);
    } catch (err) {
      console.error('Error fetching SKGB Penggilingan detail data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui';
      setError(errorMessage);
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
export function useSkgbPenggilinganSummaryByKabupaten(kodeKab: string | null) {
  const { supabase } = useAuth();
  const { selectedYear } = useYear();
  const [summaryData, setSummaryData] = useState<SkgbPenggilinganKabupatenSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        const rpcResult = await supabase.rpc('get_skgb_penggilingan_summary_by_kabupaten', {
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
          // Enhanced error handling
          let errorMessage = 'Gagal mengambil ringkasan data SKGB Penggilingan';
          if (rpcError.message?.includes('network')) {
            errorMessage = 'Koneksi bermasalah. Periksa jaringan internet Anda.';
          } else if (rpcError.message?.includes('permission')) {
            errorMessage = 'Anda tidak memiliki akses untuk melihat data ini.';
          }
          throw new Error(errorMessage);
        }
      } catch {
        // Fallback: Use direct query instead of RPC
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('skgb_penggilingan')
          .select('kdkec, kddesa, nmdesa, flag_sampel, status_pendataan, tahun')
          .eq('kdkab', kodeKab)
          .eq('tahun', selectedYear);

        if (fallbackError) {
          console.error('🔧 SKGB Penggilingan Summary - Fallback query error:', fallbackError);
          throw fallbackError;
        }


        // Process data manually
        const kecamatanStatsU = new Map<string, number>();
        const kecamatanStatsC = new Map<string, number>();
        const desaStatsU = new Map<string, number>();
        const desaStatsC = new Map<string, number>();
        let targetUtama = 0;
        let cadangan = 0;
        let realisasi = 0;

        fallbackData?.forEach(item => {
          if (item.flag_sampel === 'U') {
            // Count records per kecamatan and desa for flag U
            kecamatanStatsU.set(item.kdkec, (kecamatanStatsU.get(item.kdkec) || 0) + 1);
            desaStatsU.set(item.kddesa, (desaStatsU.get(item.kddesa) || 0) + 1);
            targetUtama++;
            if (item.status_pendataan === 'Selesai Didata') {
              realisasi++;
            }
          }
          if (item.flag_sampel === 'C') {
            // Count records per kecamatan and desa for flag C
            kecamatanStatsC.set(item.kdkec, (kecamatanStatsC.get(item.kdkec) || 0) + 1);
            desaStatsC.set(item.kddesa, (desaStatsC.get(item.kddesa) || 0) + 1);
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
        console.error('🔧 SKGB Penggilingan Summary - RPC Error:', rpcError);
        throw rpcError;
      }

      if (rpcData?.[0]) {
        setSummaryData(rpcData[0]);
      } else {
        setSummaryData(null);
      }
    } catch (err) {
      console.error('🔧 SKGB Penggilingan Summary - Error fetching SKGB summary data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui';
      setError(errorMessage);
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
