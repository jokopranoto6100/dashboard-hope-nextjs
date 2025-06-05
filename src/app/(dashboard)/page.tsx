// src/app/(dashboard)/page.tsx
"use client";

import * as React from "react";
// import { createClientComponentSupabaseClient } from '@/lib/supabase'; // Tidak digunakan langsung di sini jika data dari hook
// import { toast } from 'sonner';
import { useYear } from '@/context/YearContext';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePadiMonitoringData } from '@/hooks/usePadiMonitoringData';
import { usePalawijaMonitoringData } from '@/hooks/usePalawijaMonitoringData';
import { useKsaMonitoringData } from '@/hooks/useKsaMonitoringData'; 
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { getPercentageBadgeVariant } from "@/lib/utils";
import { CheckCircle2, TrendingUp, AlertTriangle, Info, TrendingDown, PackagePlus } from "lucide-react";

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
  // const supabase = createClientComponentSupabaseClient(); // Tidak digunakan langsung di sini
  const { selectedYear } = useYear();

  const ubinanSubround = 'all';

  const {
    padiTotals,
    loadingPadi,
    errorPadi,
    lastUpdate,
    uniqueStatusNames: padiUniqueStatusNames // Ambil uniqueStatusNames untuk Padi
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
    uniqueStatusNames: ksaUniqueStatusNames // Alias agar tidak konflik
  } = useKsaMonitoringData(currentMonthParam, 'autoFallback'); 

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
      const badgeVariant = getPercentageBadgeVariant(numValue);
      // Fallback to "default" if the returned variant is not allowed
      variant = (["default", "destructive", "success", "warning"].includes(badgeVariant as string) 
        ? badgeVariant 
        : "default") as "default" | "destructive" | "success" | "warning";
      if (numValue >= 100) icon = <CheckCircle2 />;
      else if (numValue < 70) icon = <AlertTriangle />;
    }
    
    return { text, variant, icon };
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        {/* Card 1: Ubinan Padi */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ubinan Padi ({selectedYear})</CardTitle>
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
                {/* Skeleton for Detail Status Ubinan */}
                <Skeleton className="h-4 w-full mt-2 pt-2 border-t" /> 
                <Skeleton className="h-5 w-3/4 mt-1" /> 
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

                {/* Detail Status Ubinan Padi */}
                {padiTotals.statuses && padiUniqueStatusNames && padiUniqueStatusNames.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                    <h4 className="font-semibold mb-1 text-foreground">Detail Status Ubinan:</h4>
                    <div className="flex flex-wrap gap-1">
                      {padiUniqueStatusNames.map(statusName => {
                        const count = padiTotals.statuses?.[statusName];
                        if (count !== undefined) {
                          // Anda dapat menyesuaikan varian badge berdasarkan nama status jika diperlukan
                          let statusVariant: "default" | "secondary" | "destructive" | "success" | "warning" = "secondary";
                          if (statusName.toLowerCase().includes("selesai") || statusName.toLowerCase().includes("lengkap")) statusVariant = "success";
                          else if (statusName.toLowerCase().includes("proses") || statusName.toLowerCase().includes("belum")) statusVariant = "default";
                          else if (statusName.toLowerCase().includes("gagal") || statusName.toLowerCase().includes("error")) statusVariant = "destructive";
                          
                          return (
                            <Badge key={statusName} variant={statusVariant}>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ubinan Palawija ({selectedYear})</CardTitle>
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

        {/* Card 3: KSA Padi */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              KSA Padi ({selectedYear}) - {getMonthName(effectiveDisplayMonth)}
            </CardTitle>
            {loadingKsa ? <Skeleton className="h-5 w-12" /> :
              ksaTotals ? (() => {
                const badgeInfo = getKpiBadge(ksaTotals.persentase);
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
                <div className="text-2xl font-bold">{ksaTotals.persentase.toFixed(2)}%</div>
                <p className="text-xs text-muted-foreground">
                  Realisasi: {ksaTotals.realisasi} dari {ksaTotals.target} Target
                </p>
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
                <p className="text-xs text-muted-foreground mt-1">
                  Total Kode 12: <span className="font-semibold">{ksaTotals.kode_12}</span>
                </p>
                
                {ksaTotals.statuses && ksaUniqueStatusNames && ksaUniqueStatusNames.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
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