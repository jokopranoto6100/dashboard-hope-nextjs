import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle } from "lucide-react";
import { getStatusVisuals } from '@/lib/status-visuals';

// Definisikan tipe data untuk props
interface PadiSummaryCardProps {
  isLoading: boolean;
  error: string | null;
  totals: { persentase: number; realisasi: number; targetUtama: number; lewatPanen: number; anomali: number; statuses?: { [key: string]: number; } } | null;
  countdownStatus: { text: string; color: string; } | null;
  uniqueStatusNames: string[];
  lastUpdate: string | null;
  selectedYear: number;
  isHighlighted?: boolean;
}

export function PadiSummaryCard({ isLoading, error, totals, countdownStatus, uniqueStatusNames, lastUpdate, selectedYear, isHighlighted }: PadiSummaryCardProps) {
  return (
    <Card className={`
      h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative
      ${isHighlighted ? 'border-2 border-amber-500 shadow-lg' : 'border'}
    `}>
      {isHighlighted && (
        <Badge variant="default" className="absolute -top-3 -right-3 flex items-center gap-1 bg-amber-500 text-white hover:bg-amber-600">
          <AlertTriangle className="h-3 w-3" />
          Perlu Perhatian
        </Badge>
      )}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Ubinan Padi ({selectedYear})</CardTitle>
        <Button asChild variant="outline" size="sm"><Link href="/monitoring/ubinan">Lihat Detail</Link></Button>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        {isLoading ? (
          <div className="space-y-2"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-8 w-1/2" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></div>
        ) : error ? (
          <p className="text-xs text-red-500">Error: {error}</p>
        ) : totals && typeof totals.persentase === 'number' ? (
          <>
            {countdownStatus && ( <div className="flex items-center text-xs text-muted-foreground mb-4"><Clock className={`h-4 w-4 mr-2 ${countdownStatus.color}`} /><span className={`font-medium ${countdownStatus.color}`}>{countdownStatus.text}</span></div> )}
            <div className="flex-grow">
              <div className="text-2xl font-bold">{totals.persentase.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground">Realisasi: {totals.realisasi} dari {totals.targetUtama} Target Utama</p>
              <div className="flex flex-col md:flex-row md:gap-6">
                  <p className="text-xs text-muted-foreground mt-1 flex items-center flex-wrap">Total Lewat Panen:&nbsp;<Badge variant={totals.lewatPanen > 0 ? "destructive" : "success"}>{totals.lewatPanen}</Badge></p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center flex-wrap">Jumlah Anomali:&nbsp;<Badge variant={totals.anomali > 0 ? "destructive" : "success"}>{totals.anomali}</Badge></p>
              </div>
            </div>
            {totals.statuses && uniqueStatusNames && uniqueStatusNames.length > 0 && (
              <div className="text-xs text-muted-foreground mt-3 pt-2 border-t">
                <h4 className="font-semibold mb-2 text-foreground">Detail Status Ubinan:</h4>
                <div className="flex flex-wrap gap-2">
                  {uniqueStatusNames.map(statusName => {
                    const count = totals.statuses?.[statusName];
                    if (count !== undefined) {
                      const { Icon, variant } = getStatusVisuals(statusName);
                      return (
                        <Badge key={statusName} variant={variant} className="flex items-center gap-1.5">
                          <Icon className="h-3.5 w-3.5" />
                          <span>{statusName}: {count}</span>
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
        ) : ( <p className="text-sm text-muted-foreground">Data Padi tidak tersedia.</p> )}
      </CardContent>
    </Card>
  );
}
