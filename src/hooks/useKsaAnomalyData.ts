// Lokasi: src/hooks/useKsaAnomalyData.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useYear } from '@/context/YearContext';
import { useKsaEvaluasiFilter } from '@/context/KsaEvaluasiFilterContext';

// Definisikan tipe data sesuai output dari fungsi RPC kita
export interface AnomalyData {
  id_subsegmen: string;
  kabupaten: string;
  bulan_anomali: number;
  kode_anomali: string;
  deskripsi: string;
  urutan_fase: string;
}

// Hook utama
export const useKsaAnomalyData = () => {
  const { supabase } = useAuth();
  const { selectedYear } = useYear();
  // Ambil filter kabupaten dari context yang sudah ada
  const { selectedKabupaten } = useKsaEvaluasiFilter(); 

  const [anomalies, setAnomalies] = useState<AnomalyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // Jangan fetch jika filter belum siap
    if (!selectedYear || !selectedKabupaten) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: rpcError } = await supabase.rpc('find_ksa_phase_anomalies', {
        p_year: selectedYear,
        p_kabupaten: selectedKabupaten,
      });

      if (rpcError) throw rpcError;

      setAnomalies(data || []);
    } catch (err: unknown) {
      console.error("Error fetching KSA anomalies:", err);
      setError("Gagal memuat data anomali dari server.");
    } finally {
      setIsLoading(false);
    }
  }, [supabase, selectedYear, selectedKabupaten]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Kembalikan juga fungsi untuk memuat ulang data jika diperlukan
  return { anomalies, isLoading, error, refetch: fetchData };
};