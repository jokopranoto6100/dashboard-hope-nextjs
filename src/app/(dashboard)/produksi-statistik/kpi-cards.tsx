// Lokasi: src/app/(dashboard)/produksi-statistik/kpi-cards.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Map, ChevronsDownUp } from "lucide-react";
import { formatNumber } from "@/lib/utils";

// Tipe data untuk props
interface KpiCardsProps {
  kpi: {
    total?: number;
    percentageChange?: number | null;
    satuan?: string;
    wilayahTertinggi?: { name: string; nilai: number; } | null;
    wilayahTerendah?: { name: string; nilai: number; } | null;
    jumlahWilayah?: number;
  };
  level: 'provinsi' | 'kabupaten';
}

export function KpiCards({ kpi, level }: KpiCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Nilai ({level === 'provinsi' ? 'Provinsi' : 'Semua Kab/Kota'})</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground"/>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(kpi.total, {minimumFractionDigits: 0, maximumFractionDigits: 0})}</div>
          {kpi.percentageChange != null && isFinite(kpi.percentageChange) && (
            <Badge variant={kpi.percentageChange >= 0 ? 'default' : 'destructive'} className="flex items-center gap-1 text-xs mt-1 w-fit">
              {kpi.percentageChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{kpi.percentageChange.toFixed(2)}% vs thn pembanding</span>
            </Badge>
          )}
          <p className="text-xs text-muted-foreground mt-2">{kpi.satuan}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Wilayah Tertinggi & Terendah</CardTitle>
          <ChevronsDownUp className="h-4 w-4 text-muted-foreground"/>
        </CardHeader>
        <CardContent className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900 rounded-md flex-shrink-0">
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Tertinggi</p>
                <p className="text-sm font-semibold truncate" title={kpi.wilayahTertinggi?.name || ''}>
                  {kpi.wilayahTertinggi?.name || '-'}
                </p>
              </div>
            </div>
            <p className="text-sm font-bold flex-shrink-0 sm:pl-2">
              {formatNumber(Number(kpi.wilayahTertinggi?.nilai || 0), {minimumFractionDigits: 0, maximumFractionDigits: 0})}
            </p>
          </div>
          {kpi.wilayahTerendah && (
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 bg-red-100 dark:bg-red-900 rounded-md flex-shrink-0">
                  <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Terendah</p>
                  <p className="text-sm font-semibold truncate" title={kpi.wilayahTerendah?.name || ''}>
                    {kpi.wilayahTerendah?.name || '-'}
                  </p>
                </div>
              </div>
              <p className="text-sm font-bold flex-shrink-0 sm:pl-2">
                {formatNumber(Number(kpi.wilayahTerendah?.nilai || 0), {minimumFractionDigits: 0, maximumFractionDigits: 0})}
              </p>
            </div>
          )}
        </CardContent>
      </Card>     

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Jumlah Wilayah</CardTitle>
          <Map className="h-4 w-4 text-muted-foreground"/>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{kpi.jumlahWilayah || 0}</div>
          <p className="text-xs text-muted-foreground">Wilayah dengan data</p>
        </CardContent>
      </Card>
    </div>
  );
}