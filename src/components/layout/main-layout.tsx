// src/components/layout/main-layout.tsx
import React from 'react';
import Sidebar from './sidebar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'; // Import Select components
import { useYear } from '@/context/YearContext'; // Import useYear hook

interface MainLayoutProps {
  children: React.ReactNode;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function MainLayout({ children, isCollapsed, setIsCollapsed }: MainLayoutProps) {
  const { selectedYear, setSelectedYear } = useYear(); // Gunakan hook useYear

  // Daftar tahun yang tersedia
  const availableYears = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i); // Contoh 5 tahun ke belakang dan 4 tahun ke depan

  return (
    <div
      className="grid min-h-screen transition-all duration-300 ease-in-out"
      style={{
        gridTemplateColumns: isCollapsed ? '80px 1fr' : '256px 1fr'
      }}
    >
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <div className="flex flex-col"> {/* Tambahkan wrapper flex-col untuk header dan main content */}
        {/* Header di sini */}
        <header className="flex items-center justify-end h-16 border-b bg-background px-4 lg:px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-gray-700">Tahun:</span>
            <Select
              value={String(selectedYear)} // Value harus string
              onValueChange={(value) => setSelectedYear(Number(value))} // Convert kembali ke number
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Pilih Tahun" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map(year => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Bagian User Profile / Notifikasi bisa ditambahkan di sini */}
            {/* Untuk sementara, hilangkan N di pojok kanan atas dari screenshot */}
            <div className="flex items-center gap-2">
                {/* Asumsi: Ini adalah bagian N di pojok kanan atas Anda. */}
                {/* Anda bisa menggantinya dengan komponen user profile dari sidebar atau icon notifikasi */}
                {/* Contoh: <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">N</span> */}
            </div>
          </div>
        </header>

        {/* Konten utama */}
        <main className="flex-1 overflow-auto p-4 bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}