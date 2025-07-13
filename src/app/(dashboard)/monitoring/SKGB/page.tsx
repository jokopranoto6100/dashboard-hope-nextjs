'use client';

import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { MapPin, TrendingUp, Minus, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useIsMobile } from '@/hooks/use-mobile';
import { useJadwalData } from '@/hooks/useJadwalData';
import { useYear } from '@/context/YearContext';
import { useAuth } from '@/context/AuthContext';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';

// Import swipe gesture hooks
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { EnhancedSwipeIndicator } from '@/components/ui/swipe-indicator';

// Import Pengeringan components and hooks
import { SkgbPengeringanTable } from './components/SkgbPengeringanTable';
import { SkgbPengeringanDetailTable } from './components/SkgbPengeringanDetailTable';
import { useSkgbData, useSkgbDetailData, useSkgbSummaryByKabupaten, SkgbDistrictData, SkgbDetailData } from '@/hooks/useSkgbData';

// Import Penggilingan components and hooks
import { SkgbPenggilinganTable, SkgbPenggilinganDistrictData } from './components/SkgbPenggilinganTable';
import { SkgbPenggilinganDetailTable } from './components/SkgbPenggilinganDetailTable';
import { useSkgbPenggilinganData, useSkgbPenggilinganDetailData, useSkgbPenggilinganSummaryByKabupaten, SkgbPenggilinganDetailData } from '@/hooks/useSkgbPenggilinganData';

type SkgbType = 'pengeringan' | 'penggilingan';

export default function SkgbPage() {
  const { selectedYear } = useYear();
  const isMobile = useIsMobile();
  const { userRole, userSatkerId } = useAuth();
  const { isOnline, isReconnecting } = useConnectionStatus();
  const [activeTab, setActiveTab] = useState<SkgbType>('pengeringan');
  
  // Performance Optimization: Lazy load data based on active tab
  const pengeringanHookResult = useSkgbData(activeTab === 'pengeringan');
  const penggilinganHookResult = useSkgbPenggilinganData(activeTab === 'penggilingan');
  
  // Pengeringan data and state
  const { 
    districtData: pengeringanData, 
    totals: pengeringanTotals, 
    isLoading: isPengeringanLoading, 
    error: pengeringanError, 
    lastUpdated: pengeringanLastUpdated, 
    kegiatanId 
  } = pengeringanHookResult;
  const [selectedPengeringanKabupaten, setSelectedPengeringanKabupaten] = useState<SkgbDistrictData | null>(null);
  
  // Penggilingan data and state
  const { 
    districtData: penggilinganData, 
    totals: penggilinganTotals, 
    isLoading: isPenggilinganLoading, 
    error: penggilinganError, 
    lastUpdated: penggilinganLastUpdated 
  } = penggilinganHookResult;
  const [selectedPenggilinganKabupaten, setSelectedPenggilinganKabupaten] = useState<SkgbPenggilinganDistrictData | null>(null);
  
  // Use kegiatanId from the hook instead of hardcoding
  const { jadwalData, isLoading: isJadwalLoading } = useJadwalData(selectedYear);
  
  // Find SKGB jadwal - for SKGB we need to find the "Pencacahan" jadwal
  const skgbJadwal = useMemo(() => {
    if (isJadwalLoading || !jadwalData) {
      return undefined;
    }
    
    // For SKGB, the kegiatanId is actually the subkegiatan "Pelaksanaan Lapangan" ID
    // So we can directly find it in jadwalData
    const pelaksanaanLapanganKegiatan = kegiatanId ? jadwalData.find(k => k.id === kegiatanId) : undefined;
    
    if (pelaksanaanLapanganKegiatan) {
      // Look for "Pencacahan" jadwal in this kegiatan
      const pencacachanJadwal = pelaksanaanLapanganKegiatan.jadwal?.find(j => 
        j.nama?.toLowerCase().includes('pencacahan') ||
        j.nama?.toLowerCase().includes('cacah')
      );
      
      if (pencacachanJadwal) {
        // Create a kegiatan-like structure with this jadwal
        return {
          id: pelaksanaanLapanganKegiatan.id,
          kegiatan: 'Pencacahan',
          jadwal: [pencacachanJadwal]
        };
      }
      
      // Fallback: return the whole kegiatan if no specific Pencacahan jadwal found
      return pelaksanaanLapanganKegiatan;
    }
    
    // Fallback: try to find by name containing "SKGB" or "Konversi" or "Pencacahan"
    return jadwalData.find(k => 
      k.kegiatan?.toLowerCase().includes('pencacahan') ||
      k.kegiatan?.toLowerCase().includes('skgb') ||
      k.kegiatan?.toLowerCase().includes('konversi') ||
      k.kegiatan?.toLowerCase().includes('gabah')
    );
  }, [jadwalData, isJadwalLoading, kegiatanId]);

  // Tab navigation dengan swipe gesture
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabs: SkgbType[] = ['pengeringan', 'penggilingan'];
  const currentTabIndex = tabs.indexOf(activeTab);

  const handleSwipeLeft = useCallback(() => {
    const nextIndex = Math.min(currentTabIndex + 1, tabs.length - 1);
    if (nextIndex !== currentTabIndex) {
      setActiveTab(tabs[nextIndex]);
    }
  }, [currentTabIndex, tabs]);

  const handleSwipeRight = useCallback(() => {
    const prevIndex = Math.max(currentTabIndex - 1, 0);
    if (prevIndex !== currentTabIndex) {
      setActiveTab(tabs[prevIndex]);
    }
  }, [currentTabIndex, tabs]);

  const { bindToElement, swipeProgress } = useSwipeGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    threshold: 50,
    preventDefaultTouchmoveEvent: false,
  });

  // Bind swipe gesture to tabs container on mount
  useEffect(() => {
    if (tabsRef.current && isMobile) {
      bindToElement(tabsRef.current);
    }
  }, [bindToElement, isMobile]);

  // Optimized detail data fetching - only fetch when kabupaten is selected
  const { 
    detailData: pengeringanDetailData, 
    isLoading: isPengeringanDetailLoading, 
    error: pengeringanDetailError 
  } = useSkgbDetailData(
    activeTab === 'pengeringan' && selectedPengeringanKabupaten?.kode_kab 
      ? selectedPengeringanKabupaten.kode_kab 
      : null
  );

  // Optimized summary data fetching - only fetch when kabupaten is selected
  const {
    summaryData: pengeringanKabupatenSummary,
    isLoading: isPengeringanSummaryLoading
  } = useSkgbSummaryByKabupaten(
    activeTab === 'pengeringan' && selectedPengeringanKabupaten?.kode_kab 
      ? selectedPengeringanKabupaten.kode_kab 
      : null
  );

  // Optimized penggilingan detail data
  const { 
    detailData: penggilinganDetailData, 
    isLoading: isPenggilinganDetailLoading, 
    error: penggilinganDetailError 
  } = useSkgbPenggilinganDetailData(
    activeTab === 'penggilingan' && selectedPenggilinganKabupaten?.kode_kab 
      ? selectedPenggilinganKabupaten.kode_kab 
      : null
  );

  // Optimized penggilingan summary data
  const {
    summaryData: penggilinganKabupatenSummary,
    isLoading: isPenggilinganSummaryLoading
  } = useSkgbPenggilinganSummaryByKabupaten(
    activeTab === 'penggilingan' && selectedPenggilinganKabupaten?.kode_kab 
      ? selectedPenggilinganKabupaten.kode_kab 
      : null
  );
  
  // Get current tab data based on active tab
  const getCurrentTabData = useCallback(() => {
    if (activeTab === 'pengeringan') {
      return {
        districtData: pengeringanData,
        totals: pengeringanTotals,
        isLoading: isPengeringanLoading,
        error: pengeringanError,
        selectedKabupaten: selectedPengeringanKabupaten,
        kabupatenSummary: pengeringanKabupatenSummary,
        detailData: pengeringanDetailData,
        isDetailLoading: isPengeringanDetailLoading,
        detailError: pengeringanDetailError
      };
    } else {
      return {
        districtData: penggilinganData,
        totals: penggilinganTotals,
        isLoading: isPenggilinganLoading,
        error: penggilinganError,
        selectedKabupaten: selectedPenggilinganKabupaten,
        kabupatenSummary: penggilinganKabupatenSummary,
        detailData: penggilinganDetailData,
        isDetailLoading: isPenggilinganDetailLoading,
        detailError: penggilinganDetailError
      };
    }
  }, [
    activeTab,
    pengeringanData, pengeringanTotals, isPengeringanLoading, pengeringanError,
    selectedPengeringanKabupaten, pengeringanKabupatenSummary, pengeringanDetailData,
    isPengeringanDetailLoading, pengeringanDetailError,
    penggilinganData, penggilinganTotals, isPenggilinganLoading, penggilinganError,
    selectedPenggilinganKabupaten, penggilinganKabupatenSummary, penggilinganDetailData,
    isPenggilinganDetailLoading, penggilinganDetailError
  ]);

  // Create summary for the header cards based on active tab (memoized for performance)
  const summary = useMemo(() => {
    const currentData = getCurrentTabData();
    const { districtData, totals, selectedKabupaten, kabupatenSummary } = currentData;
    
    // If we're viewing detail for a specific kabupaten, use kabupaten summary
    if (selectedKabupaten && kabupatenSummary) {
      return {
        totalKabupaten: kabupatenSummary.total_kecamatan_u, // Kecamatan count U for the selected kabupaten
        totalDesa: kabupatenSummary.total_desa_u, // Desa count U for the selected kabupaten  
        totalDesaC: kabupatenSummary.total_desa_c, // Desa count C for the selected kabupaten
        totalKecamatanC: kabupatenSummary.total_kecamatan_c, // Kecamatan count C for the selected kabupaten
        totalTargetUtama: kabupatenSummary.target_utama,
        totalCadangan: kabupatenSummary.cadangan,
        totalRealisasi: kabupatenSummary.realisasi,
        overallPersentase: kabupatenSummary.persentase,
        totalPetugas: kabupatenSummary.total_petugas
      };
    }
    
    // Otherwise use the overall summary
    if (!districtData?.length || !totals) return null;
    
    return {
      totalKabupaten: districtData.length,
      totalDesa: null, // Not available in district summary
      totalDesaC: null, // Not available in district summary
      totalKecamatanC: null, // Not available in district summary
      totalTargetUtama: totals.target_utama,
      totalCadangan: totals.cadangan,
      totalRealisasi: totals.realisasi,
      overallPersentase: totals.persentase,
      totalPetugas: districtData.reduce((sum: number, item: SkgbDistrictData | SkgbPenggilinganDistrictData) => sum + item.jumlah_petugas, 0)
    };
  }, [getCurrentTabData]);

  // Calculate detail totals when showing detail view
  const detailTotals = useMemo(() => {
    const currentData = getCurrentTabData();
    const { detailData } = currentData;
    
    if (!detailData?.length) return null;
    
    let totalTargetUtama: number;
    let totalCadangan: number;
    let totalRealisasi: number;
    
    if (activeTab === 'pengeringan') {
      const pengeringanDetailData = detailData as SkgbDetailData[];
      totalTargetUtama = pengeringanDetailData.reduce((sum: number, item: SkgbDetailData) => sum + item.target_utama, 0);
      totalCadangan = pengeringanDetailData.reduce((sum: number, item: SkgbDetailData) => sum + item.cadangan, 0);
      totalRealisasi = pengeringanDetailData.reduce((sum: number, item: SkgbDetailData) => sum + item.realisasi, 0);
    } else {
      const penggilinganDetailData = detailData as SkgbPenggilinganDetailData[];
      totalTargetUtama = penggilinganDetailData.reduce((sum: number, item: SkgbPenggilinganDetailData) => sum + item.target_utama, 0);
      totalCadangan = penggilinganDetailData.reduce((sum: number, item: SkgbPenggilinganDetailData) => sum + item.cadangan, 0);
      totalRealisasi = penggilinganDetailData.reduce((sum: number, item: SkgbPenggilinganDetailData) => sum + item.realisasi, 0);
    }
    
    const persentase = totalTargetUtama > 0 ? (totalRealisasi / totalTargetUtama) * 100 : 0;
    
    return {
      target_utama: totalTargetUtama,
      cadangan: totalCadangan,
      realisasi: totalRealisasi,
      persentase
    };
  }, [getCurrentTabData, activeTab]);

  // Handle row click to show detail (tab-specific)
  const handleRowClick = useCallback((kabupatenData: SkgbDistrictData | SkgbPenggilinganDistrictData) => {
    if (activeTab === 'pengeringan') {
      setSelectedPengeringanKabupaten(kabupatenData as SkgbDistrictData);
    } else {
      setSelectedPenggilinganKabupaten(kabupatenData as SkgbPenggilinganDistrictData);
    }
  }, [activeTab]);

  // Handle back to main view (tab-specific) with cleanup
  const handleBack = useCallback(() => {
    if (activeTab === 'pengeringan') {
      setSelectedPengeringanKabupaten(null);
    } else {
      setSelectedPenggilinganKabupaten(null);
    }
  }, [activeTab]);

  // Performance: Clear selections when switching tabs
  useEffect(() => {
    setSelectedPengeringanKabupaten(null);
    setSelectedPenggilinganKabupaten(null);
  }, [activeTab]);

  // Get current tab data for rendering
  const currentTabData = getCurrentTabData();

  // Enhanced error handling component with connection status
  const renderErrorState = (error: string) => (
    <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="mb-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-destructive mb-2">Gagal Memuat Data SKGB</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        {!isOnline && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 text-orange-800">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-sm">Tidak ada koneksi internet</span>
            </div>
          </div>
        )}
        {isReconnecting && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-sm">Mencoba menyambung ulang...</span>
            </div>
          </div>
        )}
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
          className="w-full"
          disabled={!isOnline}
        >
          {isOnline ? 'Refresh Halaman' : 'Menunggu Koneksi...'}
        </Button>
      </div>
    </div>
  );

  if (currentTabData.error || currentTabData.detailError) {
    return renderErrorState(currentTabData.error || currentTabData.detailError || 'Terjadi kesalahan yang tidak diketahui');
  }

  return (
    <div className="min-w-0 flex flex-col gap-4">
      {/* Tabs with Swipe Support */}
      <div ref={tabsRef} className="relative">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SkgbType)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pengeringan">SKGB Pengeringan</TabsTrigger>
            <TabsTrigger value="penggilingan">SKGB Penggilingan</TabsTrigger>
          </TabsList>
          
          {/* Enhanced Swipe Indicator for Mobile */}
          {isMobile && (
            <EnhancedSwipeIndicator 
              swipeProgress={swipeProgress} 
              className="mt-2"
            />
          )}
          
          <TabsContent value="pengeringan" className="mt-4">
            {/* Summary Cards for Pengeringan - Hidden on Mobile */}
            {!isMobile && (
              (isPengeringanLoading || isPengeringanSummaryLoading) ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-4" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-8 w-16 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : summary && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {selectedPengeringanKabupaten ? 'Kecamatan' : 'Kabupaten/Kota'}
                      </CardTitle>
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{summary?.totalKabupaten || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        {selectedPengeringanKabupaten ? `U: ${summary?.totalKabupaten || 0} | C: ${summary?.totalKecamatanC || 0}` : 'Kabupaten/Kota'}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {selectedPengeringanKabupaten ? 'Lokasi' : 'Target Utama'}
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {selectedPengeringanKabupaten 
                          ? (summary?.totalDesa?.toLocaleString() || 0)
                          : (summary?.totalTargetUtama?.toLocaleString() || 0)
                        }
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {selectedPengeringanKabupaten ? `U: ${summary?.totalDesa || 0} | C: ${summary?.totalDesaC || 0}` : 'Flag sampel = U'}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Realisasi</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {summary?.totalRealisasi?.toLocaleString() || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Status = Selesai Didata
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Petugas</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {summary?.totalPetugas?.toLocaleString() || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Petugas Lapangan
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Persentase</CardTitle>
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {summary?.overallPersentase ? `${summary.overallPersentase.toFixed(1)}%` : '0%'}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Realisasi/Target Utama
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )
            )}

            {/* Data Table for Pengeringan */}
            <div className={!isMobile ? "mt-6" : "mt-4"}>
            {selectedPengeringanKabupaten ? (
              <SkgbPengeringanDetailTable
                kabupatenName={selectedPengeringanKabupaten.kabupaten}
                data={pengeringanDetailData}
                totals={detailTotals}
                onBack={handleBack}
                isLoading={isPengeringanDetailLoading}
                lastUpdated={pengeringanLastUpdated}
                jadwal={skgbJadwal}
              />
            ) : (
              <SkgbPengeringanTable
                title="Monitoring SKGB Pengeringan"
                description="Klik baris untuk melihat detail."
                data={pengeringanData}
                totals={pengeringanTotals}
                onRowClick={handleRowClick}
                isLoading={isPengeringanLoading}
                lastUpdated={pengeringanLastUpdated}
                jadwal={skgbJadwal}
                userRole={userRole}
                userSatkerId={userSatkerId}
              />
            )}
            </div>
          </TabsContent>
          
          <TabsContent value="penggilingan" className="mt-4">
            {/* Summary Cards for Penggilingan - Hidden on Mobile */}
            {!isMobile && (
              (isPenggilinganLoading || isPenggilinganSummaryLoading) ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i}>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-4" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-8 w-16 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : summary && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {selectedPenggilinganKabupaten ? 'Kecamatan' : 'Kabupaten/Kota'}
                      </CardTitle>
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{summary?.totalKabupaten || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        {selectedPenggilinganKabupaten ? `U: ${summary?.totalKabupaten || 0} | C: ${summary?.totalKecamatanC || 0}` : 'Kabupaten/Kota'}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {selectedPenggilinganKabupaten ? 'Desa/Kelurahan' : 'Target Utama'}
                      </CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {selectedPenggilinganKabupaten 
                          ? (summary?.totalDesa?.toLocaleString() || 0)
                          : (summary?.totalTargetUtama?.toLocaleString() || 0)
                        }
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {selectedPenggilinganKabupaten ? `U: ${summary?.totalDesa || 0} | C: ${summary?.totalDesaC || 0}` : 'Flag sampel = U'}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Realisasi</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {summary?.totalRealisasi?.toLocaleString() || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Status = Selesai Didata
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Petugas</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {summary?.totalPetugas?.toLocaleString() || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Petugas Lapangan
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Persentase</CardTitle>
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {summary?.overallPersentase ? `${summary.overallPersentase.toFixed(1)}%` : '0%'}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Realisasi/Target Utama
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )
            )}

            {/* Data Table for Penggilingan */}
            <div className={!isMobile ? "mt-6" : "mt-4"}>
            {selectedPenggilinganKabupaten ? (
              <SkgbPenggilinganDetailTable
                kabupatenName={selectedPenggilinganKabupaten.kabupaten}
                data={penggilinganDetailData}
                totals={detailTotals}
                onBack={handleBack}
                isLoading={isPenggilinganDetailLoading}
                lastUpdated={penggilinganLastUpdated}
                jadwal={skgbJadwal}
              />
            ) : (
              <SkgbPenggilinganTable
                title="Monitoring SKGB Penggilingan"
                description="Klik baris untuk melihat detail."
                data={penggilinganData}
                totals={penggilinganTotals}
                onRowClick={handleRowClick}
                isLoading={isPenggilinganLoading}
                lastUpdated={penggilinganLastUpdated}
                jadwal={skgbJadwal}
                userRole={userRole}
                userSatkerId={userSatkerId}
              />
            )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}