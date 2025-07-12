'use client';

import { useMemo, useState } from 'react';
import { MapPin, TrendingUp, Minus, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SkgbTable, SkgbDistrictData } from './SkgbTable';
import { SkgbDetailTable } from './SkgbDetailTable';
import { useSkgbData, useSkgbDetailData, useSkgbSummaryByKabupaten } from '@/hooks/useSkgbData';
import { useIsMobile } from '@/hooks/use-mobile';
import { useJadwalData } from '@/hooks/useJadwalData';
import { useYear } from '@/context/YearContext';

export default function SkgbPage() {
  const { selectedYear } = useYear();
  const { districtData, totals, isLoading, error, lastUpdated, kegiatanId } = useSkgbData();
  const [selectedKabupaten, setSelectedKabupaten] = useState<SkgbDistrictData | null>(null);
  const isMobile = useIsMobile();
  
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

  
  const { 
    detailData, 
    isLoading: isDetailLoading, 
    error: detailError 
  } = useSkgbDetailData(selectedKabupaten?.kode_kab || null);

  // Get summary data for selected kabupaten
  const {
    summaryData: kabupatenSummary,
    isLoading: isSummaryLoading
  } = useSkgbSummaryByKabupaten(selectedKabupaten?.kode_kab || null);
  
  // Create summary for the header cards
  const summary = useMemo(() => {
    console.log('🔧 SKGB Page - Summary calculation:', { 
      selectedKabupaten, 
      kabupatenSummary, 
      districtData: districtData.length,
      totals 
    });
    
    // If we're viewing detail for a specific kabupaten, use kabupaten summary
    if (selectedKabupaten && kabupatenSummary) {
      const result = {
        totalKabupaten: kabupatenSummary.total_kecamatan, // Kecamatan count for the selected kabupaten
        totalDesa: kabupatenSummary.total_desa, // Desa count for the selected kabupaten  
        totalTargetUtama: kabupatenSummary.target_utama,
        totalCadangan: kabupatenSummary.cadangan,
        totalRealisasi: kabupatenSummary.realisasi,
        overallPersentase: kabupatenSummary.persentase,
        totalPetugas: kabupatenSummary.total_petugas
      };
      console.log('🔧 SKGB Page - Using kabupaten summary:', result);
      return result;
    }
    
    // Otherwise use the overall summary
    if (!districtData.length || !totals) return null;
    
    const result = {
      totalKabupaten: districtData.length,
      totalDesa: null, // Not available in district summary
      totalTargetUtama: totals.target_utama,
      totalCadangan: totals.cadangan,
      totalRealisasi: totals.realisasi,
      overallPersentase: totals.persentase,
      totalPetugas: districtData.reduce((sum, item) => sum + item.jumlah_petugas, 0)
    };
    console.log('🔧 SKGB Page - Using overall summary:', result);
    return result;
  }, [districtData, totals, selectedKabupaten, kabupatenSummary]);

  // Calculate detail totals when showing detail view
  const detailTotals = useMemo(() => {
    if (!detailData.length) return null;
    
    const totalTargetUtama = detailData.reduce((sum, item) => sum + item.target_utama, 0);
    const totalCadangan = detailData.reduce((sum, item) => sum + item.cadangan, 0);
    const totalRealisasi = detailData.reduce((sum, item) => sum + item.realisasi, 0);
    const persentase = totalTargetUtama > 0 ? (totalRealisasi / totalTargetUtama) * 100 : 0;
    
    return {
      target_utama: totalTargetUtama,
      cadangan: totalCadangan,
      realisasi: totalRealisasi,
      persentase
    };
  }, [detailData]);

  // Handle row click to show detail
  const handleRowClick = (kabupatenData: SkgbDistrictData) => {
    console.log('🔧 SKGB Page - Kabupaten selected:', kabupatenData);
    setSelectedKabupaten(kabupatenData);
  };

  // Handle back to main view
  const handleBack = () => {
    setSelectedKabupaten(null);
  };

  if (error || detailError) {
    return (
      <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive">Error loading SKGB data</h2>
          <p className="text-muted-foreground mt-2">{error || detailError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {selectedKabupaten ? `Monitoring SKGB - ${selectedKabupaten.kabupaten}` : 'Monitoring SKGB'}
          </h1>
          <p className="text-muted-foreground">
            {selectedKabupaten 
              ? `Detail survei per kecamatan dan lokasi di ${selectedKabupaten.kabupaten}`
              : 'Survei Konversi Gabah ke Beras - Pengeringan & Penggilingan'
            }
          </p>
        </div>
      </div>

      {/* Summary Cards - Hidden on Mobile */}
      {!isMobile && (
        (isLoading || isSummaryLoading) ? (
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
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {selectedKabupaten ? 'Kecamatan' : 'Kabupaten/Kota'}
              </CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.totalKabupaten || 0}</div>
              <p className="text-xs text-muted-foreground">
                {selectedKabupaten ? 'Kecamatan' : 'Kabupaten/Kota'}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {selectedKabupaten ? 'Desa/Kelurahan' : 'Target Utama'}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {selectedKabupaten 
                  ? (summary?.totalDesa?.toLocaleString() || 0)
                  : (summary?.totalTargetUtama?.toLocaleString() || 0)
                }
              </div>
              <p className="text-xs text-muted-foreground">
                {selectedKabupaten ? 'Flag sampel = U' : 'Flag sampel = U'}
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

      {/* Data Table */}
      {selectedKabupaten ? (
        <SkgbDetailTable
          kabupatenName={selectedKabupaten.kabupaten}
          data={detailData}
          totals={detailTotals}
          onBack={handleBack}
          isLoading={isDetailLoading}
          lastUpdated={lastUpdated}
          jadwal={skgbJadwal}
        />
      ) : (
        <SkgbTable
          title="Monitoring SKGB per Kabupaten"
          description="Klik pada baris untuk melihat detail kecamatan dan lokasi."
          data={districtData}
          totals={totals}
          onRowClick={handleRowClick}
          isLoading={isLoading}
          lastUpdated={lastUpdated}
          jadwal={skgbJadwal}
        />
      )}
    </div>
  );
}