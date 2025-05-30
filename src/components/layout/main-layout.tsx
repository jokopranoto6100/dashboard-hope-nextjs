// src/components/layout/main-layout.tsx
import React from 'react';
import Sidebar from './sidebar';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useYear } from '@/context/YearContext';

interface MainLayoutProps {
  children: React.ReactNode;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function MainLayout({ children, isCollapsed, setIsCollapsed }: MainLayoutProps) {
  const { selectedYear, setSelectedYear } = useYear();
  const availableYears = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

  return (
    <div className="flex min-h-screen"> {/* Ganti grid menjadi flex */}
      {/* Sidebar (akan fixed oleh dirinya sendiri) */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Konten utama yang akan bergeser */}
      <div
        className={
          cn(
            "flex flex-col flex-1 transition-all duration-300 ease-in-out", // flex-1 agar memenuhi sisa ruang
            isCollapsed ? "ml-[80px]" : "ml-64" // Tambahkan margin-left dinamis di sini
          )
        }
      >
        {/* Header di sini */}
        <header className="flex items-center justify-end h-16 border-b bg-background px-4 lg:px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-gray-700">Tahun:</span>
            <Select
              value={String(selectedYear)}
              onValueChange={(value) => setSelectedYear(Number(value))}
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
            <div className="flex items-center gap-2"></div>
          </div>
        </header>

        {/* Konten utama yang dapat discroll */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-100"> {/* flex-1 agar mengisi sisa tinggi, overflow-y-auto agar kontennya bisa discroll */}
          {children}
        </main>
      </div>
    </div>
  );
}