// src/components/layout/main-layout.tsx
'use client';

import React, { useState, useEffect } from 'react';
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

import { useDarkMode } from '@/context/DarkModeContext';
import { Moon, Sun } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export default function MainLayout({ children, isCollapsed, setIsCollapsed }: MainLayoutProps) {
  const { selectedYear, setSelectedYear } = useYear();
  const availableYears = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSidebarOpenChange = (open: boolean) => {
    setIsCollapsed(!open);
  };

  // Dark mode hook
  const { isDark, toggleDarkMode } = useDarkMode();

  return (
    <SidebarProvider 
      defaultOpen={!isCollapsed}
      open={!isCollapsed}
      onOpenChange={handleSidebarOpenChange}
    >
      <div className="flex-1 min-h-screen bg-background relative">
        <NewSidebar />

        <div
          className={cn(
            "flex flex-col min-h-screen",
            isCollapsed ? "ml-12" : "ml-64",
            mounted && "transition-all duration-200 ease-linear"
          )}
        >
          {/* HEADER/TOPBAR */}
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
              {/* Tombol Toggle Dark Mode */}
              <button
                className="p-2 rounded-full border bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                onClick={toggleDarkMode}
                aria-label="Toggle dark mode"
                type="button"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </header>

          {/* MAIN CONTENT */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-muted/40 w-full">
          {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
