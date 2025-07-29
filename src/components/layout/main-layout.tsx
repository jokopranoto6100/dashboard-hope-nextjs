'use client';

import React, { useState } from 'react';
import NewSidebar from './NewSidebar';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useYear } from '@/context/YearContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useDarkMode } from '@/context/DarkModeContext';
import { Moon, Sun, Menu } from 'lucide-react';
import { useSwipeToClose } from '@/hooks/useSwipeToClose';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { ScrollToTop } from '@/components/ui/scroll-to-top';

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
  // ✅ OPTIMALISASI 4: Memoize availableYears untuk mengurangi re-computation
  const availableYears = React.useMemo(
    () => Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i),
    [] // Hanya compute sekali karena tahun tidak berubah sering
  );

  const { isDark, toggleDarkMode, mounted } = useDarkMode();

  // ✅ OPTIMALISASI 5: Memoize handler untuk mengurangi re-render child components
  const handleSidebarOpenChange = React.useCallback((open: boolean) => {
    setIsCollapsed(!open);
  }, [setIsCollapsed]);

  const [sheetOpen, setSheetOpen] = useState(false);
  const haptic = useHapticFeedback();

  // Enhanced sheet open handler with haptic feedback
  const handleSheetOpen = React.useCallback(() => {
    haptic.light();
    setSheetOpen(true);
  }, [haptic]);

  // Enhanced sheet close handler with haptic feedback
  const handleSheetClose = React.useCallback(() => {
    haptic.light();
    setSheetOpen(false);
  }, [haptic]);

  // Swipe to close functionality for mobile sidebar
  const { bindToElement } = useSwipeToClose({
    onClose: handleSheetClose,
    enabled: sheetOpen
  });

  const sheetRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    if (sheetOpen && sheetRef.current) {
      const cleanup = bindToElement(sheetRef.current);
      return cleanup;
    }
  }, [sheetOpen, bindToElement]);

  return (
    <SidebarProvider
      defaultOpen={!isCollapsed}
      open={!isCollapsed}
      onOpenChange={handleSidebarOpenChange}
    >
      <div className="flex w-full min-h-screen overflow-x-hidden bg-background relative">

        {/* Sidebar desktop - Show skeleton until dark mode is ready */}
        <div className="hidden lg:block">
          {mounted ? (
            <NewSidebar />
          ) : (
            <aside
              className={cn(
                "flex-col border-r bg-background",
                "fixed top-0 left-0 h-screen z-[50]",
                !isCollapsed ? "w-[16rem]" : "w-[3rem] items-center",
                "pt-4 pb-2"
              )}
            >
              <div className={cn("h-16 flex items-center", !isCollapsed ? "px-4 lg:px-6 justify-start" : "px-0 justify-center")}>
                <Skeleton className={cn("rounded-md", !isCollapsed ? "h-8 w-8" : "h-6 w-6")} />
                {!isCollapsed && <Skeleton className="h-5 w-32 ml-2" />}
              </div>
              <div className={cn("flex flex-1 flex-col gap-2 overflow-hidden py-2", !isCollapsed ? "px-3" : "px-0 items-center")}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={cn("flex items-center", !isCollapsed ? "p-2" : "p-0 py-2 justify-center")}>
                    <Skeleton className={cn("rounded", !isCollapsed ? "h-6 w-6" : "h-5 w-5")} />
                    {!isCollapsed && <Skeleton className="h-4 w-[calc(100%-2rem)] ml-2" />}
                  </div>
                ))}
              </div>
              <div className={cn("p-2 flex items-center", !isCollapsed ? "justify-start" : "justify-center")}>
                <Skeleton className={cn("rounded-lg", !isCollapsed ? "h-10 w-10" : "h-8 w-8")} />
                {!isCollapsed && (<div className="ml-2 flex-1"><Skeleton className="h-4 w-3/4 mb-1" /><Skeleton className="h-3 w-1/2" /></div>)}
              </div>
            </aside>
          )}
        </div>

        {/* Sidebar mobile */}
        <Sheet open={sheetOpen} onOpenChange={handleSheetClose}>
          <SheetContent
            ref={sheetRef}
            side="left"
            className="p-0 w-[min(280px,85vw)] max-w-[85vw] bg-background flex flex-col z-[90]"
          >
            <SheetHeader className="h-16 px-4 border-b flex items-center">
              <SheetTitle>
                <span className="font-bold">Menu</span>
              </SheetTitle>
              <SheetDescription className="sr-only">
                Navigasi utama aplikasi. Gunakan tombol 'X' di pojok atas untuk menutup. Atau geser ke kiri untuk menutup.
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto">
              {mounted && <NewSidebar mobile onNavigate={handleSheetClose} />}
            </div>
          </SheetContent>
        </Sheet>

        {/* Konten utama */}
        <div
          className={cn(
            "flex flex-col w-full min-h-screen overflow-x-hidden",
            "lg:pl-[--sidebar-space]"
          )}
          style={
            {
              "--sidebar-space": isCollapsed ? "3rem" : "16rem",
            } as React.CSSProperties
          }
        >
          <header className="flex items-center justify-between h-16 border-b bg-card px-4 lg:px-6 shadow-sm sticky top-0 z-[40]">
            <button
              className="lg:hidden p-2 rounded hover:bg-muted transition-colors duration-200"
              onClick={handleSheetOpen}
              aria-label="Buka menu"
              type="button"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="hidden lg:block">
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
                className="p-2 rounded-full border bg-background hover:bg-muted transition shadow-sm"
                onClick={toggleDarkMode}
                aria-label="Toggle dark mode"
                type="button"
              >
                {isDark ? <Sun size={20} className="text-orange-500" /> : <Moon size={20} className="text-foreground" />}
              </button>
            </div>
          </header>

          {/* Pastikan main juga tidak overflow */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 bg-muted/40 w-full max-w-screen">
            {children}
          </main>

          {/* Global Floating Scroll to Top Button */}
          <ScrollToTop threshold={400} variant="default" />
        </div>
      </div>
    </SidebarProvider>
  );
}
