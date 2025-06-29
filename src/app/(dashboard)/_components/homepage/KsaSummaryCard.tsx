import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ElementType } from 'react';

interface KsaSummaryCardProps {
  isLoading: boolean;
  error: string | null;
  totals: { persentase: number; realisasi: number; target: number; inkonsisten: number; kode_12: number; statuses?: { [key: string]: { count: number } } } | null;
  displayStatus: { text: string; color: string; icon: ElementType } | null;
  displayMonth: string;
  uniqueStatusNames: string[];
  lastUpdate: string | null;
  selectedYear: number;
}

const getMonthName = (monthNumberStr: string): string => {
  if (!monthNumberStr || monthNumberStr === "") return "Bulan Ini";
  if (monthNumberStr.toLowerCase() === "semua") return "Data Tahunan";
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const monthIndex = parseInt(monthNumberStr, 10) - 1;
  return (monthIndex >= 0 && monthIndex < 12) ? monthNames[monthIndex] : monthNumberStr;
};

export function KsaSummaryCard({ isLoading, error, totals, displayStatus, displayMonth, uniqueStatusNames, lastUpdate, selectedYear }: KsaSummaryCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">KSA Padi ({selectedYear}) - {getMonthName(displayMonth)}</CardTitle>
        <Button asChild variant="outline" size="sm"><Link href="/monitoring/ksa">Lihat Detail</Link></Button>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        {isLoading ? ( <div className="space-y-2"><Skeleton className="h-8 w-3/4 mb-1" /><Skeleton className="h-4 w-full mb-1" /><Skeleton className="h-4 w-2/3 mt-1" /></div>
        ) : error ? ( <p className="text-xs text-red-500">Error: {error}</p>
        ) : totals ? (
          <>
            {displayStatus && (
                <div className="flex items-center text-xs text-muted-foreground mb-4">
                    <displayStatus.icon className={`h-4 w-4 mr-2 ${displayStatus.color}`} />
                    <span className={`font-medium ${displayStatus.color}`}>{displayStatus.text}</span>
                </div>
            )}
            <div className="flex-grow">
                <div className="text-2xl font-bold">{totals.persentase.toFixed(2)}%</div>
                <p className="text-xs text-muted-foreground">Realisasi: {totals.realisasi} dari {totals.target} Target</p>
                <div className="flex flex-col md:flex-row md:gap-6">
                    <p className="text-xs text-muted-foreground mt-1 flex items-center flex-wrap">Inkonsisten:&nbsp;<Badge variant={totals.inkonsisten > 0 ? "destructive" : "success"}>{totals.inkonsisten}</Badge></p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center">Total Kode 12:&nbsp;<Badge variant="warning">{totals.kode_12}</Badge></p>
                </div>
            </div>
            {totals.statuses && uniqueStatusNames && uniqueStatusNames.length > 0 && (
              <div className="text-xs text-muted-foreground mt-3 pt-2 border-t">
                <h4 className="font-semibold mb-1 text-foreground">Detail Status KSA:</h4>
                <div className="flex flex-wrap gap-1">
                  {uniqueStatusNames.map(statusName => {
                      const statusData = totals.statuses?.[statusName];
                      if (statusData) {
                          let statusVariant: "default" | "secondary" | "destructive" | "success" | "warning" = "secondary";
                          if (statusName.toLowerCase().includes("selesai") || statusName.toLowerCase().includes("panen")) statusVariant = "success";
                          if (statusName.toLowerCase().includes("belum") || statusName.toLowerCase().includes("kosong")) statusVariant = "default";
                          return ( <Badge key={statusName} variant={statusVariant}>{statusName}: {statusData.count}</Badge> );
                      }
                      return null;
                    })}
                </div>
              </div>
            )}
            {lastUpdate && <p className="text-xs text-muted-foreground mt-1">Data per: {lastUpdate}</p>}
          </>
        ) : (<p className="text-sm text-muted-foreground">Data KSA tidak tersedia.</p>)}
      </CardContent>
    </Card>
  );
}