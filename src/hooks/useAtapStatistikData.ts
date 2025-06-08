// Lokasi: src/hooks/useAtapStatistikData.ts
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext'; // <-- BARU: Impor useAuth

interface AtapStatistikFilters {
  tahun: number;
  bulan: string;
  indikatorId: string;
  level: 'provinsi' | 'kabupaten';
}

export interface AtapDataPoint {
  id_indikator: number;
  indikator: string;
  satuan: string | null;
  deskripsi: string | null;
  tahun: number;
  bulan: number | null;
  kode_kab: string | null;
  nilai: number | null;
  level_data: string;
  level_wilayah: string;
  kode_wilayah: string;
}

export function useAtapStatistikData(filters: AtapStatistikFilters) {
  const { supabase } = useAuth(); // <-- BARU: Ambil koneksi Supabase dari context
  const [data, setData] = useState<AtapDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!filters.indikatorId) {
      setData([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('laporan_atap_lengkap')
        .select('*')
        .eq('tahun', filters.tahun)
        .eq('id_indikator', parseInt(filters.indikatorId));

      if (filters.level === 'provinsi') {
        query = query
            .eq('level_wilayah', 'provinsi')
            .not('bulan', 'is', null)
            .order('bulan', { ascending: true });
      } else {
        query = query
            .eq('level_wilayah', 'kabupaten')
            .order('kode_wilayah', { ascending: true });
        if (filters.bulan === 'tahunan') {
            query = query.is('bulan', null);
        } else {
            query = query.eq('bulan', parseInt(filters.bulan));
        }
      }

      const { data: resultData, error: resultError } = await query;

      if (resultError) {
        console.error('Error fetching ATAP statistik data:', resultError);
        setError(resultError.message);
        setData([]);
      } else {
        setData(resultData as AtapDataPoint[]);
      }
      
      setLoading(false);
    };

    fetchData();
  }, [filters.tahun, filters.bulan, filters.indikatorId, filters.level, supabase]);

  return { data, loading, error };
}