/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import type { SektorItem } from '@/app/(dashboard)/bahan-produksi/page';
import { useAuth } from '@/context/AuthContext'; // 1. Impor useAuth

export function useBahanProduksiData() {
  const { supabase } = useAuth(); // 2. Dapatkan klien Supabase dari konteks Auth

  const [data, setData] = useState<SektorItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Pastikan supabase client sudah tersedia sebelum menjalankan kueri
    if (!supabase) return;

    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        // 3. Ganti 'fetch' dengan kueri Supabase langsung
        const { data: result, error: queryError } = await supabase
          .from('sektors')
          .select('*, links(*)')
          .order('urutan', { ascending: true })
          .order('urutan', { foreignTable: 'links', ascending: true });

        if (queryError) {
          throw queryError;
        }

        setData(result || []);

      } catch (err: any) {
        console.error("Error fetching bahan produksi data directly:", err);
        setError(err.message || 'Gagal mengambil data.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [supabase]); // 4. Tambahkan supabase sebagai dependensi

  return { data, isLoading, error };
}