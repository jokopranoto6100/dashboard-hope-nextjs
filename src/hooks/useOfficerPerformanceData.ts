// Lokasi: src/hooks/useOfficerPerformanceData.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useYear } from '@/context/YearContext';
import { useKsaEvaluasiFilter } from '@/context/KsaEvaluasiFilterContext';

export interface OfficerPerformanceData {
  nama_petugas: string;
  kabupaten: string;
  bulan: number;
  total_entri: number;
  total_anomali: number;
  tingkat_anomali: number;
  durasi_hari: number;
  durasi_detik_presisi: number; // Tambahkan ini
  tanggal_mulai: string;
  tanggal_selesai: string;
  rincian_anomali: Record<string, number>;
}

// Hook sekarang hanya bergantung pada filter yang dikirimkan
export const useOfficerPerformanceData = (selectedMonth: string) => {
  const { supabase } = useAuth();
  const { selectedYear } = useYear();
  const { selectedKabupaten } = useKsaEvaluasiFilter();
  
  const [performanceData, setPerformanceData] = useState<OfficerPerformanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // Guard clause untuk memastikan semua filter siap
    if (!selectedYear || !selectedKabupaten || !selectedMonth) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('get_officer_performance', {
        p_year: selectedYear,
        p_kabupaten: selectedKabupaten,
        p_bulan: Number(selectedMonth) // Kirim bulan yang dipilih
      });

      if (rpcError) throw rpcError;
      setPerformanceData(data || []);

    } catch (err: any) {
      console.error("Error fetching officer performance:", err);
      setError("Gagal memuat data kinerja petugas dari server.");
    } finally {
      setIsLoading(false);
    }
  }, [supabase, selectedYear, selectedKabupaten, selectedMonth]); // dependensi diperbarui

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { performanceData, isLoading, error };
};