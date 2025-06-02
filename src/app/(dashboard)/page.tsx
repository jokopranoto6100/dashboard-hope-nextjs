// src/app/(dashboard)/page.tsx
"use client";

import * as React from "react";
import { createClientComponentSupabaseClient } from '@/lib/supabase';
// import { toast } from 'sonner';
import { useYear } from '@/context/YearContext';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Removed unused CardDescription
import { usePadiMonitoringData } from '@/hooks/usePadiMonitoringData';
import { usePalawijaMonitoringData } from '@/hooks/usePalawijaMonitoringData';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getPercentageBadgeVariant } from "@/lib/utils";
import { CheckCircle2, TrendingUp, AlertTriangle, Info, TrendingDown } from "lucide-react";

export default function HomePage() {
  const supabase = createClientComponentSupabaseClient(); // Keep for potential future use or if auth state affects things
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

  // Komentari atau hapus logika fetchUserData jika tidak digunakan sama sekali
  // React.useEffect(() => {
  //   const fetchUserData = async () => { ... };
  //   ...
  //   fetchUserData();
  //   return () => { ... };
  // }, [supabase]);


  const getKpiBadge = (value: number | string | undefined, isPercentage = true, isChange = false) => {
    if (value === undefined || value === null || (typeof value === 'string' && value === "N/A")) {
      return { text: "N/A", variant: "default" as const, icon: null };
    }
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return { text: "Error", variant: "destructive" as const, icon: <AlertTriangle className="h-3 w-3" /> };

    let text = isPercentage ? `${numValue.toFixed(isChange ? 1 : 2)}%` : numValue.toString();
    let icon = null;
    let variant: "default" | "success" | "warning" | "destructive" = "default";

    if (isChange) {
      if (numValue > 0) {
        text = `+${text}`;
        icon = <TrendingUp className="h-3 w-3" />;
        variant = "success";
      } else if (numValue < 0) {
        icon = <TrendingDown className="h-3 w-3" />;
        variant = "destructive";
      } else {
         icon = <Info className="h-3 w-3"/>;
      }
    } else if (isPercentage) {
      variant = getPercentageBadgeVariant(numValue);
      if (numValue >= 100) icon = <CheckCircle2 className="h-3 w-3" />;
      else if (numValue < 70) icon = <AlertTriangle className="h-3 w-3" />;
    }
    
    return { text, variant, icon };
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 mb-6">
        {/* Card 1: Ringkasan Realisasi Padi */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ringkasan Realisasi Padi ({selectedYear})</CardTitle>
            {loadingPadi ? <Skeleton className="h-5 w-12" /> :
              padiTotals ? (
                <Badge variant={getKpiBadge(padiTotals.persentase).variant} className="text-xs">
                  {getKpiBadge(padiTotals.persentase).icon}
                  <span className="ml-1">{getKpiBadge(padiTotals.persentase).text}</span>
                </Badge>
              ) : <Badge variant="outline" className="text-xs">N/A</Badge>
            }
          </CardHeader>
          <CardContent>
            {loadingPadi ? (
              <>
                <Skeleton className="h-8 w-3/4 mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-1/2 mb-1" />
                <Skeleton className="h-4 w-1/2 mb-1" />
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
                <p className="text-xs text-muted-foreground mt-1">
                  Total Lewat Panen: <span className="font-semibold">{padiTotals.lewatPanen}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Jumlah Anomali: <span className="font-semibold">{padiTotals.anomali}</span>
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
              palawijaTotals ? (
                <Badge variant={getKpiBadge(parseFloat(palawijaTotals.persentase.toString())).variant} className="text-xs">
                   {getKpiBadge(parseFloat(palawijaTotals.persentase.toString())).icon}
                   <span className="ml-1">{getKpiBadge(parseFloat(palawijaTotals.persentase.toString())).text}</span>
                </Badge>
              ) : <Badge variant="outline" className="text-xs">N/A</Badge>
            }
          </CardHeader> {/* CORRECTED THIS LINE */}
          <CardContent>
            {loadingPalawija ? (
              <>
                <Skeleton className="h-8 w-3/4 mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
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
                <p className="text-xs text-muted-foreground mt-1 truncate" title={`Clean: ${palawijaTotals.clean}, Warning: ${palawijaTotals.warning}, Error: ${palawijaTotals.error}`}>
                  Status Validasi: C:{palawijaTotals.clean}, W:{palawijaTotals.warning}, E:{palawijaTotals.error}
                </p>
                {lastUpdatePalawija && <p className="text-xs text-muted-foreground mt-1">Data per: {lastUpdatePalawija}</p>}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Data Palawija tidak tersedia.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="mt-12 text-gray-600 text-center text-sm">
        Ini adalah halaman utama dashboard Anda. Anda dapat menambahkan kartu lainnya di masa mendatang.
      </p>
    </>
  );
}