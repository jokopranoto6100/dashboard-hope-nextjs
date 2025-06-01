// src/components/layout/main-layout.tsx
'use client';

import React, { useState, useEffect } from 'react'; // Import useState and useEffect
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

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSidebarOpenChange = (open: boolean) => {
    setIsCollapsed(!open);
  };

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
            "flex flex-col min-h-screen", // Base classes
            isCollapsed ? "ml-12" : "ml-64", // Margin based on state
            mounted && "transition-all duration-200 ease-linear" // Apply transition only after mount
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