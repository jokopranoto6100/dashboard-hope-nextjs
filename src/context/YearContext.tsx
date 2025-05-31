// src/context/YearContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface YearContextType {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
}

const YearContext = createContext<YearContextType | undefined>(undefined);

interface YearProviderProps {
  children: ReactNode;
}

export const YearProvider = ({ children }: YearProviderProps) => {
  // Tahun default bisa diatur di sini, misalnya tahun saat ini atau tahun yang paling relevan
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  return (
    <YearContext.Provider value={{ selectedYear, setSelectedYear }}>
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