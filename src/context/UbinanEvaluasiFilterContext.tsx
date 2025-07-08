// src/context/UbinanEvaluasiFilterContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { createClientComponentSupabaseClient } from '@/lib/supabase';
import { useYear } from './YearContext';
import { Tables } from '@/lib/database.types';

type RawSubroundType = Tables<'ubinan_raw'>['subround'];
type RawKomoditasType = Tables<'ubinan_raw'>['komoditas'];

type SelectableSubroundType = number;
type SelectableKomoditasType = string;

interface UbinanEvaluasiFilterContextType {
  selectedSubround: SelectableSubroundType | 'all';
  setSelectedSubround: (subround: SelectableSubroundType | 'all') => void;
  availableSubrounds: SelectableSubroundType[];
  selectedKomoditas: SelectableKomoditasType | null;
  setSelectedKomoditas: (komoditas: SelectableKomoditasType | null) => void;
  availableKomoditas: SelectableKomoditasType[];
  isLoadingFilters: boolean;
  refreshFilters: () => void;
}

const UbinanEvaluasiFilterContext = createContext<UbinanEvaluasiFilterContextType | undefined>(undefined);

const ITEMS_PER_FILTER_QUERY = 1000; // Untuk paginasi pengambilan opsi filter

export const UbinanEvaluasiFilterProvider = ({ children }: { children: ReactNode }) => {
  const supabase = createClientComponentSupabaseClient();
  const { selectedYear } = useYear();

  const [selectedSubround, setSelectedSubround] = useState<SelectableSubroundType | 'all'>('all');
  const [availableSubrounds, setAvailableSubrounds] = useState<SelectableSubroundType[]>([]);
  const [selectedKomoditas, setSelectedKomoditas] = useState<SelectableKomoditasType | null>(null);
  const [availableKomoditas, setAvailableKomoditas] = useState<SelectableKomoditasType[]>([]);
  const [isLoadingFilters, setIsLoadingFilters] = useState<boolean>(true);

  const fetchFilterOptions = useCallback(async (year: number) => {
    if (!year) return;
    setIsLoadingFilters(true);

    try {
      const allPossibleSubrounds: (RawSubroundType)[] = [];
      const allPossibleKomoditas: (RawKomoditasType)[] = [];
      let currentPage = 0;
      let hasMoreData = true;

      // Paginasi untuk mengambil semua kemungkinan subround dan komoditas
      while (hasMoreData) {
        const { from, to } = {
          from: currentPage * ITEMS_PER_FILTER_QUERY,
          to: (currentPage + 1) * ITEMS_PER_FILTER_QUERY - 1,
        };

        // Ambil subround dan komoditas sekaligus dalam satu query per page
        const { data: pageData, error: pageError } = await supabase
          .from('ubinan_raw')
          .select('subround, komoditas')
          .eq('tahun', year)
          .range(from, to);

        if (pageError) throw pageError;

        if (pageData && pageData.length > 0) {
          pageData.forEach(item => {
            if (item.subround !== null) allPossibleSubrounds.push(item.subround as RawSubroundType);
            if (item.komoditas !== null) allPossibleKomoditas.push(item.komoditas as RawKomoditasType);
          });
        }

        if (!pageData || pageData.length < ITEMS_PER_FILTER_QUERY) {
          hasMoreData = false;
        }
        currentPage++;
      }
      
      const uniqueSubrounds = [
        ...new Set(allPossibleSubrounds.filter((sr): sr is SelectableSubroundType => sr !== null))
      ].sort((a, b) => a - b);
      setAvailableSubrounds(uniqueSubrounds);

      const uniqueKomoditas = [
        ...new Set(allPossibleKomoditas.filter((k): k is SelectableKomoditasType => k !== null))
      ].sort();
      setAvailableKomoditas(uniqueKomoditas);
      
      if (uniqueKomoditas.length > 0) {
        if (!selectedKomoditas || !uniqueKomoditas.includes(selectedKomoditas)) {
          setSelectedKomoditas(uniqueKomoditas[0]);
        }
      } else {
        setSelectedKomoditas(null);
      }

    } catch (error) {
      console.error("Error fetching ubinan filter options:", error);
      setAvailableSubrounds([]);
      setAvailableKomoditas([]);
      setSelectedKomoditas(null);
    } finally {
      setIsLoadingFilters(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, selectedYear, selectedKomoditas]); // `selectedYear` dependency akan memicu fetch ulang

  useEffect(() => {
    if (selectedYear) {
      fetchFilterOptions(selectedYear);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]); 

  const refreshFilters = useCallback(() => {
    if (selectedYear) {
      fetchFilterOptions(selectedYear);
    }
  }, [selectedYear, fetchFilterOptions]);

  return (
    <UbinanEvaluasiFilterContext.Provider
      value={{
        selectedSubround,
        setSelectedSubround,
        availableSubrounds,
        selectedKomoditas,
        setSelectedKomoditas,
        availableKomoditas,
        isLoadingFilters,
        refreshFilters,
      }}
    >
      {children}
    </UbinanEvaluasiFilterContext.Provider>
  );
};

export const useUbinanEvaluasiFilter = (): UbinanEvaluasiFilterContextType => {
  const context = useContext(UbinanEvaluasiFilterContext);
  if (context === undefined) {
    throw new Error('useUbinanEvaluasiFilter must be used within a UbinanEvaluasiFilterProvider');
  }
  return context;
};