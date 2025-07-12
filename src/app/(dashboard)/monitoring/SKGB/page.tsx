'use client';

import { useMemo, useState } from 'react';
import { MapPin, TrendingUp, Minus, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SkgbTable, SkgbDistrictData } from './SkgbTable';
import { SkgbDetailTable } from './SkgbDetailTable';
import { useSkgbData, useSkgbDetailData } from '@/hooks/useSkgbData';

export default function SkgbPage() {
  const { districtData, totals, isLoading, error, lastUpdated } = useSkgbData();
  const [selectedKabupaten, setSelectedKabupaten] = useState<SkgbDistrictData | null>(null);
  
  // Get detail data when a kabupaten is selected
  const { 
    detailData, 
    isLoading: isDetailLoading, 
    error: detailError 
  } = useSkgbDetailData(selectedKabupaten?.kode_kab || null);
  
  // Create summary for the header cards
  const summary = useMemo(() => {
    if (!districtData.length || !totals) return null;
    
    return {
      totalKabupaten: districtData.length,
      totalTargetUtama: totals.target_utama,
      totalCadangan: totals.cadangan,
      totalRealisasi: totals.realisasi,
      overallPersentase: totals.persentase,
      totalPetugas: districtData.reduce((sum, item) => sum + item.jumlah_petugas, 0)
    };
  }, [districtData, totals]);

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
          <h1 className="text-3xl font-bold tracking-tight">Monitoring SKGB</h1>
          <p className="text-muted-foreground">
            Sistem Kerangka Ganda Berbasis (SKGB) - Monitoring Pengeringan
            {lastUpdated && (
              <span className="block text-sm text-muted-foreground/70 mt-1">
                Last updated: {lastUpdated}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      {isLoading ? (
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
              <CardTitle className="text-sm font-medium">Total Kabupaten</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.totalKabupaten || 0}</div>
              <p className="text-xs text-muted-foreground">
                Kabupaten/Kota
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Target Utama</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary?.totalTargetUtama?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Flag sampel = U
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
        />
      ) : (
        <SkgbTable
          title="Monitoring SKGB per Kabupaten"
          description="Tabulasi data SKGB berdasarkan kabupaten/kota dengan informasi jumlah petugas lapangan. Klik pada baris untuk melihat detail kecamatan dan lokasi."
          data={districtData}
          totals={totals}
          onRowClick={handleRowClick}
          isLoading={isLoading}
          lastUpdated={lastUpdated}
        />
      )}
    </div>
  );
}