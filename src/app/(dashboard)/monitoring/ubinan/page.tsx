"use client";

import * as React from "react";
import { useYear } from '@/context/YearContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import swipe gesture hooks
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { EnhancedSwipeIndicator } from '@/components/ui/swipe-indicator';

// Impor semua hooks yang diperlukan
import { usePadiMonitoringData } from '@/hooks/usePadiMonitoringData';
import { usePalawijaMonitoringData } from '@/hooks/usePalawijaMonitoringData';
import { useJadwalData } from "@/hooks/useJadwalData";

// Impor komponen tabel dan UI lainnya
import { PadiMonitoringTable } from './PadiTable'; 
import { PalawijaMonitoringTable } from './PalawijaTable';
import { Skeleton } from "@/components/ui/skeleton";

type UbinanType = 'padi' | 'palawija';

export default function UbinanMonitoringPage() {
  const { selectedYear } = useYear();
  const [selectedSubround, setSelectedSubround] = React.useState<string>('all');
  const [activeTab, setActiveTab] = React.useState<UbinanType>('padi');

  // Tab navigation dengan swipe gesture
  const tabsRef = React.useRef<HTMLDivElement>(null);
  const tabs: UbinanType[] = ['padi', 'palawija'];
  const currentTabIndex = tabs.indexOf(activeTab);

  const handleSwipeLeft = React.useCallback(() => {
    const nextIndex = Math.min(currentTabIndex + 1, tabs.length - 1);
    if (nextIndex !== currentTabIndex) {
      setActiveTab(tabs[nextIndex]);
    }
  }, [currentTabIndex, tabs]);

  const handleSwipeRight = React.useCallback(() => {
    const prevIndex = Math.max(currentTabIndex - 1, 0);
    if (prevIndex !== currentTabIndex) {
      setActiveTab(tabs[prevIndex]);
    }
  }, [currentTabIndex, tabs]);

  const { bindToElement, swipeProgress } = useSwipeGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    threshold: 50,
    velocityThreshold: 0.3,
    minSwipeDistance: 30
  });

  React.useEffect(() => {
    const cleanup = bindToElement(tabsRef.current);
    return cleanup;
  }, [bindToElement]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as UbinanType);
  };

  // Ambil data dan ID dari setiap hook
  const { processedPadiData, padiTotals, loadingPadi, errorPadi, lastUpdate, kegiatanId: padiKegiatanId } = usePadiMonitoringData(selectedYear, selectedSubround);
  const { processedPalawijaData, palawijaTotals, loadingPalawija, errorPalawija, lastUpdatePalawija, kegiatanId: palawijaKegiatanId } = usePalawijaMonitoringData(selectedYear, selectedSubround);
  const { jadwalData, isLoading: isJadwalLoading } = useJadwalData(selectedYear);

  // Logika mapping otomatis berdasarkan ID
  const jadwalPadi = React.useMemo(() => 
    !isJadwalLoading && padiKegiatanId ? jadwalData.find(k => k.id === padiKegiatanId) : undefined
  , [jadwalData, isJadwalLoading, padiKegiatanId]);

  const jadwalPalawija = React.useMemo(() => 
    !isJadwalLoading && palawijaKegiatanId ? jadwalData.find(k => k.id === palawijaKegiatanId) : undefined
  , [jadwalData, isJadwalLoading, palawijaKegiatanId]);

  const pageIsLoading = loadingPadi || loadingPalawija || isJadwalLoading;

  return (
    <div className="flex flex-col gap-4 min-w-0">
      <div className="flex items-center justify-end flex-wrap gap-2">
        <Select value={selectedSubround} onValueChange={setSelectedSubround}>
          <SelectTrigger className="w-full md:w-[180px] bg-card border hover:bg-accent transition-colors">
            <SelectValue placeholder="Pilih Subround" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Subround</SelectItem>
            <SelectItem value="1">Subround 1</SelectItem>
            <SelectItem value="2">Subround 2</SelectItem>
            <SelectItem value="3">Subround 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {pageIsLoading ? (
        <div className="space-y-4">
          {/* Filter Section Skeleton */}
          <div className="flex items-center justify-end flex-wrap gap-2">
            <Skeleton className="h-10 w-full md:w-[180px] rounded-md" />
          </div>
          
          {/* Tab Navigation Skeleton */}
          <div className="grid w-full grid-cols-2 gap-1 p-1 bg-muted rounded-md">
            <Skeleton className="h-10 w-full rounded-sm" />
            <Skeleton className="h-10 w-full rounded-sm" />
          </div>
          
          {/* Table Card Skeleton */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            {/* Card Header Skeleton */}
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <div className="flex-grow">
                  <Skeleton className="h-6 w-48 mb-2" /> {/* Title */}
                </div>
                <Skeleton className="h-8 w-32" /> {/* Countdown status */}
              </div>
              
              <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-2 pt-2">
                <Skeleton className="h-4 w-40" /> {/* Description */}
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-20" /> {/* Button 1 */}
                  <Skeleton className="h-8 w-24" /> {/* Button 2 */}
                </div>
              </div>
            </div>
            
            {/* Card Content - Table Skeleton */}
            <div className="p-6 pt-0">
              <div className="rounded-md border">
                {/* Table Header */}
                <div className="border-b">
                  <div className="flex">
                    {Array.from({ length: 7 }).map((_, index) => (
                      <div key={index} className="flex-1 p-3 border-r last:border-r-0">
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Table Body */}
                {Array.from({ length: 6 }).map((_, rowIndex) => (
                  <div key={rowIndex} className="flex border-b last:border-b-0">
                    {Array.from({ length: 7 }).map((_, cellIndex) => (
                      <div key={cellIndex} className="flex-1 p-3 border-r last:border-r-0">
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ))}
                  </div>
                ))}
                
                {/* Table Footer */}
                <div className="bg-muted/50 border-t">
                  <div className="flex">
                    {Array.from({ length: 7 }).map((_, index) => (
                      <div key={index} className="flex-1 p-3 border-r last:border-r-0">
                        <Skeleton className="h-4 w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative" ref={tabsRef}>
          {/* Tab Navigation */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger 
                value="padi" 
                className="flex items-center gap-2"
              >
                <span className="text-base">🌾</span>
                <span className="font-medium">Monitoring Padi</span>
              </TabsTrigger>
              <TabsTrigger 
                value="palawija" 
                className="flex items-center gap-2"
              >
                <span className="text-base">🌿</span>
                <span className="font-medium">Monitoring Palawija</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="padi" className="space-y-4 animate-in fade-in-0 slide-in-from-left-4 duration-300">
              <PadiMonitoringTable 
                data={processedPadiData || []}
                totals={padiTotals}
                isLoading={loadingPadi}
                error={errorPadi}
                lastUpdate={lastUpdate}
                selectedYear={selectedYear}
                selectedSubround={selectedSubround}
                jadwal={jadwalPadi} // Prop jadwal diteruskan ke komponen tabel
              />
            </TabsContent>
            
            <TabsContent value="palawija" className="space-y-4 animate-in fade-in-0 slide-in-from-right-4 duration-300">
              <PalawijaMonitoringTable
                data={processedPalawijaData || []}
                totals={palawijaTotals}
                isLoading={loadingPalawija}
                error={errorPalawija}
                lastUpdate={lastUpdatePalawija}
                selectedYear={selectedYear}
                selectedSubround={selectedSubround}
                jadwal={jadwalPalawija} // Prop jadwal diteruskan ke komponen tabel
              />
            </TabsContent>
          </Tabs>

          {/* Swipe Indicators */}
          <EnhancedSwipeIndicator 
            swipeProgress={swipeProgress}
            showProgress={swipeProgress.progress > 0.1}
            className="md:hidden"
          />
        </div>
      )}
    </div>
  );
}