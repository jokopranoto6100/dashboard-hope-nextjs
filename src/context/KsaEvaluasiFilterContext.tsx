// Lokasi: src/context/KsaEvaluasiFilterContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { createClientComponentSupabaseClient } from '@/lib/supabase';
import { useYear } from './YearContext';

type KsaType = 'Padi' | 'Jagung';
type KabupatenType = string;

interface KsaEvaluasiFilterContextType {
  selectedKsaType: KsaType;
  setSelectedKsaType: (type: KsaType) => void;
  selectedKabupaten: KabupatenType;
  setSelectedKabupaten: (kab: KabupatenType) => void;
  availableKabupaten: KabupatenType[];
  isLoadingFilters: boolean;
}

const KsaEvaluasiFilterContext = createContext<KsaEvaluasiFilterContextType | undefined>(undefined);

export const KsaEvaluasiFilterProvider = ({ children }: { children: ReactNode }) => {
  const supabase = createClientComponentSupabaseClient();
  const { selectedYear } = useYear();

  const [selectedKsaType, setSelectedKsaType] = useState<KsaType>('Padi');
  const [selectedKabupaten, setSelectedKabupaten] = useState<KabupatenType>('semua');
  const [availableKabupaten, setAvailableKabupaten] = useState<KabupatenType[]>([]);
  const [isLoadingFilters, setIsLoadingFilters] = useState<boolean>(true);

  const fetchKabupatenOptions = useCallback(async (year: number) => {
    if (!year) return;
    setIsLoadingFilters(true);
    try {
      const { data, error } = await supabase.rpc('get_ksa_distinct_kabupaten', { p_year: year });
      if (error) throw error;
      setAvailableKabupaten(data || []);
    } catch (error) {
      console.error("Error fetching KSA kabupaten options via RPC:", error);
      setAvailableKabupaten([]);
    } finally {
      setIsLoadingFilters(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (selectedYear) {
      fetchKabupatenOptions(selectedYear);
    }
  }, [selectedYear, fetchKabupatenOptions]);

  return (
    <KsaEvaluasiFilterContext.Provider
      value={{
        selectedKsaType,
        setSelectedKsaType,
        selectedKabupaten,
        setSelectedKabupaten,
        availableKabupaten,
        isLoadingFilters,
      }}
    >
      {children}
    </KsaEvaluasiFilterContext.Provider>
  );
};

export const useKsaEvaluasiFilter = (): KsaEvaluasiFilterContextType => {
  const context = useContext(KsaEvaluasiFilterContext);
  if (context === undefined) {
    throw new Error('useKsaEvaluasiFilter must be used within a KsaEvaluasiFilterProvider');
  }
  return context;
};