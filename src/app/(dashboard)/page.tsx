// src/app/(dashboard)/page.tsx
"use client";

import * as React from "react";
import { createClientComponentSupabaseClient } from '@/lib/supabase';
// import { toast } from 'sonner';
import { useYear } from '@/context/YearContext';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePadiMonitoringData } from '@/hooks/usePadiMonitoringData';
import { usePalawijaMonitoringData } from '@/hooks/usePalawijaMonitoringData';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getPercentageBadgeVariant } from "@/lib/utils";
import { CheckCircle2, TrendingUp, AlertTriangle, Info, TrendingDown, PackagePlus } from "lucide-react";

export default function HomePage() {
  const supabase = createClientComponentSupabaseClient();
  const { selectedYear } = useYear();

  const ubinanSubround = 'all';

  const {
    padiTotals,
    loadingPadi,
    errorPadi,
    lastUpdate
  } = usePadiMonitoringData(selectedYear, ubinanSubround);

  const {
    palawijaTotals,
    loadingPalawija,
    errorPalawija,
    lastUpdatePalawija
  } = usePalawijaMonitoringData(selectedYear, ubinanSubround);

  const getKpiBadge = (value: number | string | undefined, isPercentage = true, isChange = false) => {
    if (value === undefined || value === null || (typeof value === 'string' && value === "N/A")) {
      return { text: "N/A", variant: "default" as const, icon: null };
    }
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return { text: "Error", variant: "destructive" as const, icon: <AlertTriangle /> };

    let text = isPercentage ? `${numValue.toFixed(isChange ? 1 : 2)}%` : numValue.toString();
    let icon = null;
    let variant: "default" | "success" | "warning" | "destructive" = "default";

    if (isChange) {
      if (numValue > 0) {
        text = `+${text}`;
        icon = <TrendingUp />;
        variant = "success";
      } else if (numValue < 0) {
        icon = <TrendingDown />;
        variant = "destructive";
      } else {
        icon = <Info />;
      }
    } else if (isPercentage) {
      variant = getPercentageBadgeVariant(numValue);
      if (numValue >= 100) icon = <CheckCircle2 />;
      else if (numValue < 70) icon = <AlertTriangle />;
    }
    
    return { text, variant, icon };
  };

  return (
    <>
      {/* <h1 className="text-3xl md:text-4xl font-bold mb-6">Selamat Datang di Dashboard HOPE!</h1> */}
      
      {/* Mengubah md:grid-cols-2 menjadi md:grid-cols-3 */}
      <div className="grid gap-4 md:grid-cols-4 mb-6"> 
        {/* Card 1: Ringkasan Realisasi Padi */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ringkasan Realisasi Padi ({selectedYear})</CardTitle>
            {loadingPadi ? <Skeleton className="h-5 w-12" /> :
              padiTotals ? (() => {
                const badgeInfo = getKpiBadge(padiTotals.persentase);
                return (
                  <Badge variant={badgeInfo.variant}>
                    {badgeInfo.icon}
                    {badgeInfo.text && <span>{badgeInfo.text}</span>}
                  </Badge>
                );
              })() : <Badge variant="outline">N/A</Badge>
            }
          </CardHeader>
          <CardContent>
            {loadingPadi ? (
              <>
                <Skeleton className="h-8 w-3/4 mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-5 w-1/2 mb-1" />
                <Skeleton className="h-5 w-1/2 mb-1" />
                <Skeleton className="h-4 w-2/3 mt-1" />
              </>
            ) : errorPadi ? (
              <p className="text-xs text-red-500">Error: {errorPadi}</p>
            ) : padiTotals ? (
              <>
                <div className="text-2xl font-bold">{padiTotals.persentase.toFixed(2)}%</div>
                <p className="text-xs text-muted-foreground">
                  Realisasi: {padiTotals.realisasi} dari {padiTotals.targetUtama} Target Utama
                </p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center flex-wrap">
                  Total Lewat Panen:&nbsp;
                  <Badge variant="destructive">
                    {padiTotals.lewatPanen}
                  </Badge>
                </p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center flex-wrap">
                  Jumlah Anomali:&nbsp;
                  <Badge variant="destructive">
                    {padiTotals.anomali}
                  </Badge>
                </p>
                {lastUpdate && <p className="text-xs text-muted-foreground mt-1">Data per: {lastUpdate}</p>}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Data Padi tidak tersedia.</p>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Ringkasan Realisasi Palawija */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ringkasan Realisasi Palawija ({selectedYear})</CardTitle>
            {loadingPalawija ? <Skeleton className="h-5 w-12" /> :
              palawijaTotals ? (() => {
                const badgeInfo = getKpiBadge(parseFloat(palawijaTotals.persentase.toString()));
                return (
                  <Badge variant={badgeInfo.variant}>
                    {badgeInfo.icon}
                    {badgeInfo.text && <span>{badgeInfo.text}</span>}
                  </Badge>
                );
              })() : <Badge variant="outline">N/A</Badge>
            }
          </CardHeader>
          <CardContent>
            {loadingPalawija ? (
              <>
                <Skeleton className="h-8 w-3/4 mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-5 w-full mb-1" />
                <Skeleton className="h-4 w-2/3 mt-1" />
              </>
            ) : errorPalawija ? (
              <p className="text-xs text-red-500">Error: {errorPalawija}</p>
            ) : palawijaTotals ? (
              <>
                <div className="text-2xl font-bold">{parseFloat(palawijaTotals.persentase.toString()).toFixed(2)}%</div>
                <p className="text-xs text-muted-foreground">
                  Realisasi: {palawijaTotals.realisasi} dari {palawijaTotals.target} Target
                </p>
                <div className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-1">
                  Status Validasi:&nbsp;
                  <Badge variant="success">
                    Clean: {palawijaTotals.clean}
                  </Badge>
                  <Badge variant="warning">
                    Warning: {palawijaTotals.warning}
                  </Badge>
                  <Badge variant="destructive">
                    Error: {palawijaTotals.error}
                  </Badge>
                </div>
                {lastUpdatePalawija && <p className="text-xs text-muted-foreground mt-1">Data per: {lastUpdatePalawija}</p>}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Data Palawija tidak tersedia.</p>
            )}
          </CardContent>
        </Card>

        {/* Card 3: KPI Kosong / Mendatang */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kegiatan Lainnya</CardTitle>
            <Badge variant="outline"><PackagePlus /></Badge> 
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-3/4 mb-1" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kegiatan Lainnya</CardTitle>
            <Badge variant="outline"><PackagePlus /></Badge> 
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-3/4 mb-1" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>

      </div>

      <p className="mt-12 text-gray-600 text-center text-sm">
        Ini adalah halaman utama dashboard Anda. Anda dapat menambahkan kartu lainnya di masa mendatang.
      </p>
    </>
  );
}