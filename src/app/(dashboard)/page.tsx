// src/app/(dashboard)/page.tsx
"use client";

import * as React from "react";
import Link from 'next/link';
import { useYear } from '@/context/YearContext';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button"; // LANGKAH 1: Impor Button
import { usePadiMonitoringData } from '@/hooks/usePadiMonitoringData';
import { usePalawijaMonitoringData } from '@/hooks/usePalawijaMonitoringData';
import { useKsaMonitoringData } from '@/hooks/useKsaMonitoringData'; 
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { PackagePlus } from "lucide-react";

const getMonthName = (monthNumberStr: string | undefined): string => {
  if (!monthNumberStr || monthNumberStr.toLowerCase() === "semua") return "Semua Bulan (Tahunan)";
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", 
                      "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const monthIndex = parseInt(monthNumberStr, 10) - 1;
  if (monthIndex >= 0 && monthIndex < 12) {
    return monthNames[monthIndex];
  }
  return monthNumberStr; 
};

export default function HomePage() {
  const { selectedYear } = useYear();
  const ubinanSubround = 'all';

  const {
    padiTotals,
    loadingPadi,
    errorPadi,
    lastUpdate,
    uniqueStatusNames: padiUniqueStatusNames
  } = usePadiMonitoringData(selectedYear, ubinanSubround);

  const {
    palawijaTotals,
    loadingPalawija,
    errorPalawija,
    lastUpdatePalawija
  } = usePalawijaMonitoringData(selectedYear, ubinanSubround);

  const currentJsMonth = new Date().getMonth(); 
  const currentMonthParam = String(currentJsMonth + 1); 

  const { 
    districtTotals: ksaTotals, 
    isLoading: loadingKsa, 
    error: errorKsa, 
    lastUpdated: lastUpdatedKsa,
    effectiveDisplayMonth, 
    uniqueStatusNames: ksaUniqueStatusNames
  } = useKsaMonitoringData(currentMonthParam, 'autoFallback'); 

  // LANGKAH 2: Fungsi getKpiBadge tidak diperlukan lagi di sini

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        {/* Card 1: Ubinan Padi */}
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ubinan Padi ({selectedYear})</CardTitle>
            {/* LANGKAH 3: Ganti Badge dengan Button Link */}
            <Button asChild variant="outline" size="sm">
              <Link href="/monitoring/ubinan">Lihat Detail</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col h-full">
            {loadingPadi ? (
              <>
                <Skeleton className="h-8 w-3/4 mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-5 w-1/2 mb-1" />
                <Skeleton className="h-5 w-1/2 mb-1" />
                <Skeleton className="h-4 w-full mt-2 pt-2 border-t" /> 
                <Skeleton className="h-5 w-3/4 mt-1" /> 
                <Skeleton className="h-4 w-2/3 mt-1" />
              </>
            ) : errorPadi ? (
              <p className="text-xs text-red-500">Error: {errorPadi}</p>
            ) : padiTotals ? (
              <>
                <div className="flex-grow">
                  <div className="text-2xl font-bold">{padiTotals.persentase.toFixed(2)}%</div>
                  <p className="text-xs text-muted-foreground">
                    Realisasi: {padiTotals.realisasi} dari {padiTotals.targetUtama} Target Utama
                  </p>
                  <div className="flex flex-col md:flex-row md:gap-6">
                      <p className="text-xs text-muted-foreground mt-1 flex items-center flex-wrap">
                          Total Lewat Panen:&nbsp;
                          <Badge variant={padiTotals.lewatPanen > 0 ? "destructive" : "success"}>
                              {padiTotals.lewatPanen}
                          </Badge>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center flex-wrap">
                          Jumlah Anomali:&nbsp;
                          <Badge variant={padiTotals.anomali > 0 ? "destructive" : "success"}>
                              {padiTotals.anomali}
                          </Badge>
                      </p>
                  </div>
                </div>

                {padiTotals.statuses && padiUniqueStatusNames && padiUniqueStatusNames.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-3 pt-2 border-t">
                    <h4 className="font-semibold mb-1 text-foreground">Detail Status Ubinan:</h4>
                    <div className="flex flex-wrap gap-1">
                      {padiUniqueStatusNames.map(statusName => {
                        const count = padiTotals.statuses?.[statusName];
                        if (count !== undefined) {
                          return (
                            <Badge key={statusName} variant="secondary">
                              {statusName}: {count}
                            </Badge>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}
                {lastUpdate && <p className="text-xs text-muted-foreground mt-1">Data per: {lastUpdate}</p>}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Data Padi tidak tersedia.</p>
            )}
          </CardContent>
        </Card>

        {/* Card 2: Ubinan Palawija */}
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ubinan Palawija ({selectedYear})</CardTitle>
            {/* LANGKAH 3: Ganti Badge dengan Button Link */}
            <Button asChild variant="outline" size="sm">
              <Link href="/monitoring/ubinan">Lihat Detail</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col h-full">
            {loadingPalawija ? (
              <>
                <Skeleton className="h-8 w-3/4 mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-5 w-full mt-2 pt-2 border-t" />
                <Skeleton className="h-4 w-2/3 mt-1" />
              </>
            ) : errorPalawija ? (
              <p className="text-xs text-red-500">Error: {errorPalawija}</p>
            ) : palawijaTotals ? (
              <>
                <div className="flex-grow">
                    <div className="text-2xl font-bold">{parseFloat(palawijaTotals.persentase.toString()).toFixed(2)}%</div>
                    <p className="text-xs text-muted-foreground">
                    Realisasi: {palawijaTotals.realisasi} dari {palawijaTotals.target} Target
                    </p>
                </div>
                
                <div className="text-xs text-muted-foreground mt-3 pt-2 border-t">
                  <h4 className="font-semibold mb-1 text-foreground">Detail Status Validasi:</h4>
                  <div className="flex flex-wrap items-center gap-1">
                    <Badge variant="secondary">
                      Clean: {palawijaTotals.clean}
                    </Badge>
                    <Badge variant="secondary">
                      Warning: {palawijaTotals.warning}
                    </Badge>
                    <Badge variant="secondary">
                      Error: {palawijaTotals.error}
                    </Badge>
                  </div>
                </div>

                {lastUpdatePalawija && <p className="text-xs text-muted-foreground mt-1">Data per: {lastUpdatePalawija}</p>}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Data Palawija tidak tersedia.</p>
            )}
          </CardContent>
        </Card>

        {/* Card 3: KSA Padi */}
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              KSA Padi ({selectedYear}) - {getMonthName(effectiveDisplayMonth)}
            </CardTitle>
            {/* LANGKAH 3: Ganti Badge dengan Button Link */}
            <Button asChild variant="outline" size="sm">
              <Link href="/monitoring/ksa">Lihat Detail</Link>
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col h-full">
            {loadingKsa ? (
              <>
                <Skeleton className="h-8 w-3/4 mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-5 w-1/2 mb-1" />
                <Skeleton className="h-4 w-1/2 mb-1" />
                <Skeleton className="h-4 w-full mt-2 pt-2 border-t" /> 
                <Skeleton className="h-5 w-3/4 mt-1" /> 
                <Skeleton className="h-4 w-2/3 mt-1" />
              </>
            ) : errorKsa ? (
              <p className="text-xs text-red-500">Error: {errorKsa}</p>
            ) : ksaTotals ? (
              <>
                <div className="flex-grow">
                    <div className="text-2xl font-bold">{ksaTotals.persentase.toFixed(2)}%</div>
                    <p className="text-xs text-muted-foreground">
                    Realisasi: {ksaTotals.realisasi} dari {ksaTotals.target} Target
                    </p>
                    <div className="flex flex-col md:flex-row md:gap-6">
                        <p className="text-xs text-muted-foreground mt-1 flex items-center flex-wrap">
                            Inkonsisten:&nbsp;
                            {ksaTotals.inkonsisten > 0 ? (
                                <Badge variant="destructive"> 
                                    {ksaTotals.inkonsisten}
                                </Badge>
                            ) : (
                                <Badge variant="success">{ksaTotals.inkonsisten}</Badge>
                            )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center">
                            Total Kode 12:&nbsp;
                            <Badge variant="warning">{ksaTotals.kode_12}</Badge>
                        </p>
                    </div>
                </div>
                
                {ksaTotals.statuses && ksaUniqueStatusNames && ksaUniqueStatusNames.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-3 pt-2 border-t">
                    <h4 className="font-semibold mb-1 text-foreground">Detail Status KSA:</h4>
                    <div className="flex flex-wrap gap-1">
                      {ksaUniqueStatusNames.map(statusName => {
                          const statusData = ksaTotals.statuses?.[statusName];
                          if (statusData) {
                              let statusVariant: "default" | "secondary" | "destructive" | "success" | "warning" = "secondary";
                              if (statusName.toLowerCase().includes("selesai") || statusName.toLowerCase().includes("panen")) statusVariant = "success";
                              if (statusName.toLowerCase().includes("belum") || statusName.toLowerCase().includes("kosong")) statusVariant = "default";

                              return (
                                  <Badge key={statusName} variant={statusVariant}>
                                      {statusName}: {statusData.count} 
                                  </Badge>
                              );
                          }
                          return null;
                      })}
                    </div>
                  </div>
                )}

                {lastUpdatedKsa && <p className="text-xs text-muted-foreground mt-1">Data per: {lastUpdatedKsa}</p>}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Data KSA tidak tersedia.</p>
            )}
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