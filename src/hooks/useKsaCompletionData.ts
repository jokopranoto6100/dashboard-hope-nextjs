// Lokasi: src/hooks/useKsaCompletionData.ts

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useYear } from '@/context/YearContext';

// Definisikan tipe data untuk hasil pivot, tambahkan kode_kab
export interface CompletionPivotData {
  kode_kab: string;
  kabupaten: string;
  // `monthly_counts` adalah objek seperti { "1": 10, "5": 25 }
  monthly_counts: Record<string, number>;
}

export const useKsaCompletionData = () => {
  const { supabase } = useAuth();
  const { selectedYear } = useYear();

  const [data, setData] = useState<CompletionPivotData[]>([]);
  const [availableMonths, setAvailableMonths] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedYear) return;

      setIsLoading(true);
      setError(null);

      try {
        // Panggil kedua RPC secara bersamaan untuk efisiensi
        const [pivotResult, monthsResult] = await Promise.all([
          supabase.rpc('get_completion_pivot_by_month', { p_year: selectedYear }),
          supabase.rpc('get_available_completion_months', { p_year: selectedYear })
        ]);

        // Tangani error dari RPC
        if (pivotResult.error) throw pivotResult.error;
        if (monthsResult.error) throw monthsResult.error;

        // Set data pivot
        setData(pivotResult.data || []);

        // Proses dan set bulan yang tersedia, lalu urutkan
        const months = monthsResult.data?.map((m: { bulan: number }) => m.bulan).sort((a: number, b: number) => a - b) || [];
        setAvailableMonths(months);

      } catch (err: any) {
        console.error("Error fetching KSA completion data:", err);
        setError("Gagal memuat data kelengkapan amatan.");
        setData([]);
        setAvailableMonths([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, supabase]);

  return { data, availableMonths, isLoading, error };
};