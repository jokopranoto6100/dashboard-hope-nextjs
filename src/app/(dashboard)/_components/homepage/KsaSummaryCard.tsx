import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ElementType } from 'react';
import { AlertTriangle } from "lucide-react";
import { getStatusVisuals } from '@/lib/status-visuals';

interface KsaSummaryCardProps {
  isLoading: boolean;
  error: string | null;
  totals: { persentase: number; realisasi: number; target: number; inkonsisten: number; kode_12: number; statuses?: { [key: string]: { count: number } } } | null;
  displayStatus: { text: string; color: string; icon: ElementType } | null;
  displayMonth: string;
  uniqueStatusNames: string[];
  lastUpdate: string | null;
  selectedYear: number;
  isHighlighted?: boolean;
}

const getMonthName = (monthNumberStr: string): string => {
  if (!monthNumberStr || monthNumberStr === "") return "Bulan Ini";
  if (monthNumberStr.toLowerCase() === "semua") return "Data Tahunan";
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const monthIndex = parseInt(monthNumberStr, 10) - 1;
  return (monthIndex >= 0 && monthIndex < 12) ? monthNames[monthIndex] : monthNumberStr;
};

export function KsaSummaryCard({ isLoading, error, totals, displayStatus, displayMonth, uniqueStatusNames, lastUpdate, selectedYear, isHighlighted }: KsaSummaryCardProps) {
  return (
    <Card className={`
      h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative
      bg-white dark:bg-gray-800
      border-2 border-[#8e97fe]/30 hover:border-[#8e97fe]/50 
      dark:border-[#8e97fe]/40 dark:hover:border-[#8e97fe]/60
      ${isHighlighted ? 'ring-2 ring-amber-400 shadow-lg border-amber-500' : ''}
    `}
    style={{
      backgroundColor: 'rgba(142, 151, 254, 0.1)',
    }}
    >
      {/* Dark mode background overlay */}
      <div className="absolute inset-0 rounded-lg hidden dark:block" style={{ backgroundColor: 'rgba(142, 151, 254, 0.15)' }} />
      
      {isHighlighted && (
        <Badge variant="default" className="absolute -top-3 -right-3 flex items-center gap-1 bg-amber-500 text-white hover:bg-amber-600 z-10">
          <AlertTriangle className="h-3 w-3" />
          Perlu Perhatian
        </Badge>
      )}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-[#1e1b4b] dark:text-[#c7d2fe]">📊 KSA Padi ({selectedYear}) - {getMonthName(displayMonth)}</CardTitle>
        <Button asChild variant="outline" size="sm" className="border-[#8e97fe]/40 text-[#3730a3] hover:bg-[#8e97fe]/20 dark:text-[#818cf8] dark:border-[#8e97fe]/50">
          <Link href="/monitoring/ksa">Lihat Detail</Link>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col h-full relative z-10">
        {isLoading ? ( <div className="space-y-2"><Skeleton className="h-8 w-3/4 mb-1" /><Skeleton className="h-4 w-full mb-1" /><Skeleton className="h-4 w-2/3 mt-1" /></div>
        ) : error ? ( <p className="text-xs text-red-500 dark:text-red-400">Error: {error}</p>
        ) : totals ? (
          <>
            {displayStatus && (
                <div className="flex items-center text-xs text-muted-foreground mb-4">
                    <displayStatus.icon className={`h-4 w-4 mr-2 ${displayStatus.color}`} />
                    <span className={`font-medium ${displayStatus.color}`}>{displayStatus.text}</span>
                </div>
            )}
            <div className="flex-grow">
                <div className="text-2xl font-bold text-[#1e1b4b] dark:text-[#c7d2fe]">{totals.persentase.toFixed(2)}%</div>
                <p className="text-xs text-[#3730a3] dark:text-[#818cf8]">Realisasi: {totals.realisasi} dari {totals.target} Target</p>
                
                {/* Progress Bar */}
                <div className="mt-3 mb-4">
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-sky-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(totals.persentase, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="flex flex-col md:flex-row md:gap-6">
                    <p className="text-xs text-muted-foreground mt-1 flex items-center flex-wrap">Inkonsisten:&nbsp;<Badge variant={totals.inkonsisten > 0 ? "destructive" : "success"}>{totals.inkonsisten}</Badge></p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center">Total Kode 12:&nbsp;<Badge variant="warning">{totals.kode_12}</Badge></p>
                </div>
            </div>
            {totals.statuses && uniqueStatusNames && uniqueStatusNames.length > 0 && (
              <div className="text-xs text-muted-foreground mt-3 pt-2 border-t">
                <h4 className="font-semibold mb-2 text-foreground">Detail Status KSA:</h4>
                <div className="flex flex-wrap gap-2">
                  {uniqueStatusNames.map(statusName => {
                      const statusData = totals.statuses?.[statusName];
                      if (statusData) {
                          const { Icon, variant } = getStatusVisuals(statusName);
                          return (
                            <Badge key={statusName} variant={variant} className="flex items-center gap-1.5">
                              <Icon className="h-3.5 w-3.5" />
                              <span>{statusName}: {statusData.count}</span>
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
        ) : (<p className="text-sm text-muted-foreground">Data KSA tidak tersedia.</p>)}
      </CardContent>
    </Card>
  );
}
