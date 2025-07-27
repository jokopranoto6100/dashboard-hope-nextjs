// src/hooks/useUbinanCharacteristics.ts

import { useState, useEffect } from 'react';
import { createClientComponentSupabaseClient } from '@/lib/supabase';
import { 
  UbinanCharacteristicsData, 
  CharacteristicsSummary, 
  CharacteristicsAggregated,
  LUAS_LAHAN_ORDER,
  JENIS_LAHAN_ORDER,
  YA_TIDAK_ORDER,
  BANTUAN_PUPUK_ORDER
} from '@/app/(dashboard)/evaluasi/ubinan/karakteristik/types';

interface UseUbinanCharacteristicsProps {
  tahun: number | null;
  komoditas: string;
  subround: string;
  kabupaten?: number | 'all';
}

export function useUbinanCharacteristics({
  tahun,
  komoditas,
  subround,
  kabupaten = 'all'
}: UseUbinanCharacteristicsProps) {
  const [data, setData] = useState<CharacteristicsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function untuk aggregasi data
  const aggregateData = (rawData: UbinanCharacteristicsData[], field: keyof UbinanCharacteristicsData, customOrder?: string[]): CharacteristicsAggregated[] => {
    const counts = rawData.reduce((acc, item) => {
      const key = String(item[field]);
      if (key === 'N/A' || key === 'Tidak Diketahui') return acc; // Skip N/A values
      acc[key] = (acc[key] || 0) + item.jumlah_sampel;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    
    let entries = Object.entries(counts).map(([label, count]) => ({
      label,
      value: count,
      percentage: total > 0 ? (count / total) * 100 : 0,
      count
    }));

    // Apply custom ordering if provided
    if (customOrder) {
      const ordered = customOrder
        .map(label => entries.find(entry => entry.label === label))
        .filter(Boolean) as CharacteristicsAggregated[];
      
      // Add any remaining entries not in custom order
      const remaining = entries.filter(entry => !customOrder.includes(entry.label));
      entries = [...ordered, ...remaining];
    }

    return entries;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!tahun || !komoditas) {
        setData(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const supabase = createClientComponentSupabaseClient();
        const kabFilter = kabupaten === 'all' ? null : kabupaten;
        
        const { data: rawData, error: rpcError } = await supabase.rpc(
          'get_ubinan_characteristics_data',
          {
            tahun_val: tahun,
            komoditas_val: `%${komoditas}%`, // Tambahkan wildcard untuk pattern matching
            subround_filter: subround,
            kab_filter: kabFilter
          }
        );

        if (rpcError) {
          throw new Error(`Database error: ${rpcError.message}`);
        }

        if (!rawData || rawData.length === 0) {
          setData({
            luasLahan: [],
            jenisLahan: [],
            caraPenanaman: [],
            jajarLegowo: [],
            jenisVarietas: [],
            penggunaanPupuk: [],
            bantuanBenih: [],
            bantuanPupuk: [],
            anggotaPoktan: [],
            totalSampel: 0,
            rataRataLuas: 0
          });
          return;
        }

        // Aggregate data for each characteristic
        const aggregatedData: CharacteristicsSummary = {
          luasLahan: aggregateData(rawData, 'luas_lahan_kategori', LUAS_LAHAN_ORDER),
          jenisLahan: aggregateData(rawData, 'jenis_lahan', JENIS_LAHAN_ORDER),
          caraPenanaman: aggregateData(rawData, 'cara_penanaman'),
          jajarLegowo: aggregateData(rawData, 'jajar_legowo', YA_TIDAK_ORDER),
          jenisVarietas: aggregateData(rawData, 'jenis_varietas'),
          penggunaanPupuk: aggregateData(rawData, 'menggunakan_pupuk'),
          bantuanBenih: aggregateData(rawData, 'bantuan_benih', YA_TIDAK_ORDER),
          bantuanPupuk: aggregateData(rawData, 'bantuan_pupuk', BANTUAN_PUPUK_ORDER),
          anggotaPoktan: aggregateData(rawData, 'anggota_poktan', YA_TIDAK_ORDER),
          totalSampel: rawData.reduce((sum: number, item: UbinanCharacteristicsData) => sum + item.jumlah_sampel, 0),
          rataRataLuas: rawData.reduce((sum: number, item: UbinanCharacteristicsData) => sum + (item.rata_rata_luas * item.jumlah_sampel), 0) / 
                       rawData.reduce((sum: number, item: UbinanCharacteristicsData) => sum + item.jumlah_sampel, 0)
        };

        setData(aggregatedData);
      } catch (err) {
        console.error('Error fetching ubinan characteristics:', err);
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat mengambil data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [tahun, komoditas, subround, kabupaten]);

  return { data, isLoading, error };
}
