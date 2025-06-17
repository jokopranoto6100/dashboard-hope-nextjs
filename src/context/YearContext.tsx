// src/context/YearContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { createClientComponentSupabaseClient } from '@/lib/supabase'; // BARU

// DIUBAH: Tambahkan availableYears ke dalam tipe
interface YearContextType {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  availableYears: number[]; // BARU
}

const YearContext = createContext<YearContextType | undefined>(undefined);

interface YearProviderProps {
  children: ReactNode;
}

export const YearProvider = ({ children }: YearProviderProps) => {
  const supabase = createClientComponentSupabaseClient(); // BARU
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  // BARU: State untuk menyimpan daftar tahun yang tersedia
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  // BARU: useEffect untuk mengambil data tahun dari database saat komponen dimuat
  useEffect(() => {
    const fetchAvailableYears = async () => {
      try {
        // Panggil RPC untuk mendapatkan tahun unik. Ini lebih efisien.
        // Anda perlu membuat fungsi RPC ini di Supabase.
        const { data, error } = await supabase.rpc('get_unique_years');

        if (error) {
          throw error;
        }

        if (data) {
          // Asumsi RPC mengembalikan array of objects, misal: [{tahun: 2023}, {tahun: 2024}]
          const years = data.map((item: any) => item.tahun).sort((a: number, b: number) => b - a);
          setAvailableYears(years);
        }
      } catch (error) {
        console.error("Error fetching unique years:", error);
        // Fallback jika gagal, setidaknya tahun ini tersedia
        setAvailableYears([new Date().getFullYear()]);
      }
    };

    fetchAvailableYears();
  }, [supabase]);

  return (
    // DIUBAH: Tambahkan availableYears ke value provider
    <YearContext.Provider value={{ selectedYear, setSelectedYear, availableYears }}>
      {children}
    </YearContext.Provider>
  );
};

export const useYear = () => {
  const context = useContext(YearContext);
  if (context === undefined) {
    throw new Error('useYear must be used within a YearProvider');
  }
  return context;
};