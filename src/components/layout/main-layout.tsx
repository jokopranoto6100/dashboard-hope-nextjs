// src/components/layout/main-layout.tsx
'use client';

import React from 'react';
import NewSidebar from './NewSidebar';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useYear } from '@/context/YearContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function MainLayout({ children, isCollapsed, setIsCollapsed }: MainLayoutProps) {
  const { selectedYear, setSelectedYear } = useYear();
  const availableYears = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

  const handleSidebarOpenChange = (open: boolean) => {
    setIsCollapsed(!open);
  };

  return (
    <SidebarProvider
      defaultOpen={!isCollapsed}
      open={!isCollapsed}
      onOpenChange={handleSidebarOpenChange}
    >
      {/* "Outer Wrapper" ini adalah anak dari div flex w-full milik SidebarProvider.
          Tambahkan 'flex-1' agar ia mengisi ruang horizontal yang tersedia.
      */}
      <div className="flex-1 min-h-screen bg-background relative"> {/* <--- TAMBAHKAN flex-1 DI SINI */}
        <NewSidebar /> {/* Komponen ini position:fixed */}

        {/* "Main Content Wrapper" */}
        <div
          className={cn(
            "flex flex-col min-h-screen transition-all duration-300 ease-in-out",
            isCollapsed ? "ml-12" : "ml-64" // Margin sudah benar
          )}
        >
          <header className="flex items-center justify-between h-16 border-b bg-card px-4 lg:px-6 shadow-sm sticky top-0 z-30">
            <SidebarTrigger />
            <div className="flex items-center gap-4">
              <span className="font-semibold text-card-foreground">Tahun:</span>
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
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-muted/40 w-full">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}