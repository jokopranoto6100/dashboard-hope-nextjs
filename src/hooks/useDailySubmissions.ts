// Lokasi: src/hooks/useDailySubmissions.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useYear } from '@/context/YearContext';
import { useKsaEvaluasiFilter } from '@/context/KsaEvaluasiFilterContext';

export interface DailySubmissionData {
  tanggal_amatan: string;
  jumlah_entri: number;
}

export const useDailySubmissions = (selectedMonth: string) => {
  const { supabase } = useAuth();
  const { selectedYear } = useYear();
  const { selectedKabupaten } = useKsaEvaluasiFilter();

  const [dailyData, setDailyData] = useState<DailySubmissionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!selectedYear || !selectedKabupaten || !selectedMonth) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('get_daily_submission_counts', {
        p_year: selectedYear,
        p_kabupaten: selectedKabupaten,
        p_bulan: Number(selectedMonth)
      });
      if (rpcError) throw rpcError;
      setDailyData(data || []);
    } catch (err: unknown) {
      console.error("Error fetching daily submissions:", err);
      setError("Gagal memuat data submisi harian.");
    } finally {
      setIsLoading(false);
    }
  }, [supabase, selectedYear, selectedKabupaten, selectedMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { dailyData, isLoading, error };
};