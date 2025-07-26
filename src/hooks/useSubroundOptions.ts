// src/hooks/useSubroundOptions.ts
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useYear } from '@/context/YearContext';

export interface SubroundOption {
  value: string;
  label: string;
  count: number;
}

export const useSubroundOptions = (selectedKomoditas: string) => {
  const { supabase } = useAuth();
  const { selectedYear } = useYear();
  const [subroundOptions, setSubroundOptions] = useState<SubroundOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubroundOptions = async () => {
      if (!selectedYear || !selectedKomoditas) {
        setSubroundOptions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Query untuk mendapatkan semua subround yang tersedia untuk komoditas dan tahun tertentu
        const { data, error } = await supabase
          .from('ubinan_raw')
          .select('subround')
          .eq('tahun', selectedYear.toString())
          .like('komoditas', `%${selectedKomoditas}%`)
          .not('subround', 'is', null)
          .not('r701', 'is', null)
          .not('r702', 'is', null);

        if (error) throw error;

        // Grouping dan counting subround
        const subroundMap = new Map<string, number>();
        data.forEach(row => {
          const subround = row.subround?.toString().trim();
          if (subround) {
            subroundMap.set(subround, (subroundMap.get(subround) || 0) + 1);
          }
        });

        // Convert ke array dan sort berdasarkan nomor subround
        const options: SubroundOption[] = [
          {
            value: 'all',
            label: 'Semua Subround',
            count: Array.from(subroundMap.values()).reduce((sum, count) => sum + count, 0)
          },
          ...Array.from(subroundMap.entries())
            .map(([value, count]) => ({
              value,
              label: `Subround ${value}`,
              count
            }))
            .sort((a, b) => parseInt(a.value) - parseInt(b.value))
        ];

        setSubroundOptions(options);
      } catch (err) {
        console.error('Error fetching subround options:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch subround options');
        setSubroundOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubroundOptions();
  }, [supabase, selectedYear, selectedKomoditas]);

  return {
    subroundOptions,
    isLoading,
    error
  };
};
