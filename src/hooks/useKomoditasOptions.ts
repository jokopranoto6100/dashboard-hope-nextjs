// src/hooks/useKomoditasOptions.ts
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useYear } from '@/context/YearContext';

export interface KomoditasOption {
  value: string;
  label: string;
  count: number;
}

export const useKomoditasOptions = () => {
  const { supabase } = useAuth();
  const { selectedYear } = useYear();
  const [komoditasOptions, setKomoditasOptions] = useState<KomoditasOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKomoditasOptions = async () => {
      if (!selectedYear) {
        setKomoditasOptions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Query untuk mendapatkan semua komoditas yang tersedia di tahun tertentu
        const { data, error } = await supabase
          .from('ubinan_raw')
          .select('komoditas')
          .eq('tahun', selectedYear.toString())
          .not('komoditas', 'is', null)
          .not('r701', 'is', null)
          .not('r702', 'is', null);

        if (error) throw error;

        // Grouping dan counting komoditas
        const komoditasMap = new Map<string, number>();
        data.forEach(row => {
          const komoditas = row.komoditas?.trim();
          if (komoditas) {
            komoditasMap.set(komoditas, (komoditasMap.get(komoditas) || 0) + 1);
          }
        });

        // Convert ke array dan sort berdasarkan nama
        const options: KomoditasOption[] = Array.from(komoditasMap.entries())
          .map(([value, count]) => ({
            value,
            label: value,
            count
          }))
          .sort((a, b) => a.label.localeCompare(b.label));

        setKomoditasOptions(options);
      } catch (err) {
        console.error('Error fetching komoditas options:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch komoditas options');
        setKomoditasOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKomoditasOptions();
  }, [supabase, selectedYear]);

  return {
    komoditasOptions,
    isLoading,
    error
  };
};
