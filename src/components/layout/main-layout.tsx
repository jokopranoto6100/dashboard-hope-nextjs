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
// ✅ Pastikan X diimpor jika masih digunakan di tempat lain, atau hapus jika tidak.
// Untuk kasus ini, kita tidak membutuhkannya lagi di file ini.
import { Moon, Sun, Menu } from 'lucide-react'; 

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetHeader
} from "@/components/ui/sheet";

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

  const [sheetOpen, setSheetOpen] = useState(false);
  const { isDark, toggleDarkMode } = useDarkMode();

  return (
    <SidebarProvider
      defaultOpen={!isCollapsed}
      open={!isCollapsed}
      onOpenChange={handleSidebarOpenChange}
    >
      <div className="flex-1 min-h-screen bg-background relative">

        <div className="hidden md:block">
          <NewSidebar />
        </div>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="left" className="p-0 w-[260px] max-w-[90vw] bg-background flex flex-col">
            {/* ✅ PATCH: Menghapus tombol close manual dan menyederhanakan header */}
            <SheetHeader className="h-16 px-4 border-b flex items-center">
              <SheetTitle>
                <span className="font-bold">Menu</span>
              </SheetTitle>
              <SheetDescription className="sr-only">
                Navigasi utama aplikasi. Gunakan tombol 'X' di pojok atas untuk menutup.
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto">
              <NewSidebar mobile onNavigate={() => setSheetOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>

        <div
          className={cn(
            "flex flex-col min-h-screen",
            isCollapsed ? "ml-0 md:ml-12" : "ml-0 md:ml-64",
            mounted && "transition-all duration-200 ease-linear"
          )}
        >
          <header className="flex items-center justify-between h-16 border-b bg-card px-4 lg:px-6 shadow-sm sticky top-0 z-30">
            <button
              className="md:hidden p-2 rounded hover:bg-muted transition"
              onClick={() => setSheetOpen(true)}
              aria-label="Buka menu"
              type="button"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="hidden md:block">
              <SidebarTrigger />
            </div>

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

          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-muted/40 w-full">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}