/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import type { SektorItem } from '@/app/(dashboard)/bahan-produksi/page';
import { useAuth } from '@/context/AuthContext';

export function useBahanProduksiData() {
  const { supabase } = useAuth();

  const [data, setData] = useState<SektorItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0); // ✅ TAMBAHKAN: Key untuk trigger refresh

  // ✅ TAMBAHKAN: Memoized fetch function
  const fetchData = useCallback(async () => {
    if (!supabase) return;

    setIsLoading(true);
    setError(null);

    try {
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
  }, [supabase]);

  // ✅ TAMBAHKAN: Manual refresh function
  const refresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  // ✅ PERBAIKI: useEffect dengan dependency yang tepat
  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]); // ✅ Include refreshKey untuk trigger refresh

  // ✅ PERFORMANCE: Real-time subscription untuk auto-sync (enabled karena full client-side)
  useEffect(() => {
    if (!supabase) return;

    // Subscribe ke perubahan tabel sektors
    const sektorsChannel = supabase
      .channel('sektors-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen semua events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'sektors'
        },
        () => {
          // Auto-refresh ketika ada perubahan
          refresh();
        }
      )
      .subscribe();

    // Subscribe ke perubahan tabel links
    const linksChannel = supabase
      .channel('links-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'links'
        },
        () => {
          // Auto-refresh ketika ada perubahan
          refresh();
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      supabase.removeChannel(sektorsChannel);
      supabase.removeChannel(linksChannel);
    };
  }, [supabase, refresh]);

  return { 
    data, 
    isLoading, 
    error, 
    refresh // ✅ Export refresh function
  };
}