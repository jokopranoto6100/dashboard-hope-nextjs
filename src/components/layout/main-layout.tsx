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
import { Moon, Sun, Menu } from 'lucide-react';

// Tambahkan drawer dari shadcn/ui
import {
  Drawer,
  DrawerContent,
  DrawerClose,
  DrawerTitle,
  DrawerDescription
} from "@/components/ui/drawer";

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

  // Drawer state for mobile
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Dark mode hook
  const { isDark, toggleDarkMode } = useDarkMode();

  return (
    <SidebarProvider
      defaultOpen={!isCollapsed}
      open={!isCollapsed}
      onOpenChange={handleSidebarOpenChange}
    >
      <div className="flex-1 min-h-screen bg-background relative">

        {/* SIDEBAR DESKTOP: hanya render saat md ke atas */}
        <div className="hidden md:block">
          <NewSidebar />
        </div>

        {/* SIDEBAR MOBILE: Drawer, hanya render saat < md */}
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent className="p-0 w-[260px] max-w-[90vw] bg-background">
            {/* Tambahkan aksesibilitas sesuai Radix/shadcn */}
            <DrawerTitle className="sr-only">Menu Navigasi</DrawerTitle>
            <DrawerDescription className="sr-only">
              Navigasi utama aplikasi, tekan tombol tutup untuk menutup menu.
            </DrawerDescription>
            <div className="flex flex-col h-screen">
              {/* Header Drawer (opsional, agar user tahu ini menu) */}
              <div className="flex items-center justify-between h-16 px-4 border-b">
                <span className="font-bold">Menu</span>
                <DrawerClose asChild>
                  <button className="p-2 rounded hover:bg-muted transition" aria-label="Tutup menu">
                    <Menu className="h-6 w-6" />
                  </button>
                </DrawerClose>
              </div>
              <div className="flex-1 overflow-y-auto">
                <NewSidebar mobile onNavigate={() => setDrawerOpen(false)} />
              </div>
            </div>
          </DrawerContent>
        </Drawer>



        <div
          className={cn(
            "flex flex-col min-h-screen",
            // Margin: desktop saja
            isCollapsed ? "ml-0 md:ml-12" : "ml-0 md:ml-64",
            mounted && "transition-all duration-200 ease-linear"
          )}
        >
          {/* HEADER/TOPBAR */}
          <header className="flex items-center justify-between h-16 border-b bg-card px-4 lg:px-6 shadow-sm sticky top-0 z-30">

            {/* Hamburger button: hanya di mobile */}
            <button
              className="md:hidden p-2 rounded hover:bg-muted transition"
              onClick={() => setDrawerOpen(true)}
              aria-label="Buka menu"
              type="button"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* SidebarTrigger untuk desktop */}
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