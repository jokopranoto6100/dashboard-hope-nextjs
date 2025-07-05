// src/app/(dashboard)/produksi-statistik/components/KpiCards.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ChevronsDownUp } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface KpiData {
  total: number;
  totalPembanding: number;
  satuan: string;
  wilayahTertinggi: { name: string; nilai: number } | null;
  wilayahTerendah: { name: string; nilai: number } | null;
  percentageChange: number | null;
  subroundTotals: {
    sr1: { main: number; compare: number; change: number | null };
    sr2: { main: number; compare: number; change: number | null };
    sr3: { main: number; compare: number; change: number | null };
  };
}

interface KpiCardsProps {
  kpiData: KpiData;
  indikatorNama: string;
  level: 'provinsi' | 'kabupaten';
  tahunPembanding: string;
  bulanRangeText: string;
}

export function KpiCards({ 
  kpiData, 
  indikatorNama, 
  level, 
  tahunPembanding, 
  bulanRangeText 
}: KpiCardsProps) {
  return (
    <div className={`grid gap-4 md:grid-cols-2 ${tahunPembanding !== 'tidak' ? 'lg:grid-cols-2' : 'lg:grid-cols-3'}`}>
      {/* Total Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Total {indikatorNama} ({level === 'provinsi' ? 'Provinsi' : 'Semua Kab/Kota'})
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground"/>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatNumber(kpiData.total)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {kpiData.satuan}{bulanRangeText}
          </p>
          {kpiData.percentageChange !== null && isFinite(kpiData.percentageChange) && (
            <Badge 
              variant={kpiData.percentageChange >= 0 ? 'default' : 'destructive'} 
              className="flex items-center gap-1 text-xs mt-2 w-fit"
            >
              {kpiData.percentageChange >= 0 ? 
                <TrendingUp className="h-3 w-3" /> : 
                <TrendingDown className="h-3 w-3" />
              }
              <span>{kpiData.percentageChange.toFixed(2)}% vs thn pembanding</span>
            </Badge>
          )}
        </CardContent>
      </Card>
      
      {/* Tertinggi & Terendah Card */}
      {tahunPembanding === 'tidak' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {indikatorNama} Tertinggi & Terendah
            </CardTitle>
            <ChevronsDownUp className="h-4 w-4 text-muted-foreground"/>
          </CardHeader>
          <CardContent className="text-sm space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <TrendingUp className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                <p className="font-medium truncate" title={kpiData.wilayahTertinggi?.name || ''}>
                  {kpiData.wilayahTertinggi?.name || '-'}
                </p>
              </div>
              <p className="font-mono text-muted-foreground">
                {formatNumber(Number(kpiData.wilayahTertinggi?.nilai || 0))} {kpiData.satuan}
              </p>
            </div>
            {kpiData.wilayahTerendah && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <TrendingDown className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <p className="font-medium truncate" title={kpiData.wilayahTerendah?.name || ''}>
                    {kpiData.wilayahTerendah?.name || '-'}
                  </p>
                </div>
                <p className="font-mono text-muted-foreground">
                  {formatNumber(Number(kpiData.wilayahTerendah?.nilai || 0))} {kpiData.satuan}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Subround Card */}
      <Card className="lg:col-span-1 md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            {indikatorNama} per Subround
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {['sr1', 'sr2', 'sr3'].map((sr, index) => {
            const subround = kpiData.subroundTotals[sr as keyof typeof kpiData.subroundTotals];
            return (
              <div key={sr} className="flex items-center justify-between">
                <p className="font-medium">Subround {index + 1}</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-muted-foreground">
                    {formatNumber(subround.main)} {kpiData.satuan}
                  </p>
                  {subround.change !== null && isFinite(subround.change) && (
                    <Badge 
                      variant={subround.change >= 0 ? 'default' : 'destructive'} 
                      className="flex items-center gap-1 text-xs w-fit"
                    >
                      {subround.change >= 0 ? 
                        <TrendingUp className="h-3 w-3" /> : 
                        <TrendingDown className="h-3 w-3" />
                      }
                      <span>{subround.change.toFixed(2)}%</span>
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
