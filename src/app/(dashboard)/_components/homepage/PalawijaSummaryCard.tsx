import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ElementType } from 'react';
import { AlertTriangle } from "lucide-react";
import { getStatusVisuals } from '@/lib/status-visuals';

interface PalawijaSummaryCardProps {
  isLoading: boolean;
  error: string | null;
  totals: { persentase: number; realisasi: number; target: number; clean: number; warning: number; error: number; } | null;
  countdownStatus: { text: string; color: string; icon: ElementType } | null;
  lastUpdate: string | null;
  selectedYear: number;
  isHighlighted?: boolean;
}

export function PalawijaSummaryCard({ isLoading, error, totals, countdownStatus, lastUpdate, selectedYear, isHighlighted }: PalawijaSummaryCardProps) {
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
        <CardTitle className="text-sm font-medium">Ubinan Palawija ({selectedYear})</CardTitle>
        <Button asChild variant="outline" size="sm"><Link href="/monitoring/ubinan">Lihat Detail</Link></Button>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        {isLoading ? ( <div className="space-y-2"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-8 w-1/2" /><Skeleton className="h-4 w-full" /></div>
        ) : error ? ( <p className="text-xs text-red-500 dark:text-red-400">Error: {error}</p>
        ) : totals && typeof totals.persentase === 'number' ? (
          <>
            {countdownStatus && (<div className="flex items-center text-xs text-muted-foreground mb-4"><countdownStatus.icon className={`h-4 w-4 mr-2 ${countdownStatus.color}`} /><span className={`font-medium ${countdownStatus.color}`}>{countdownStatus.text}</span></div>)}
            <div className="flex-grow">
                <div className="text-2xl font-bold">{totals.persentase.toFixed(2)}%</div>
                <p className="text-xs text-muted-foreground">Realisasi: {totals.realisasi} dari {totals.target} Target</p>
            </div>
            <div className="text-xs text-muted-foreground mt-3 pt-2 border-t">
              <h4 className="font-semibold mb-2 text-foreground">Detail Status Validasi:</h4>
              <div className="flex flex-wrap items-center gap-2">
                  {(() => {
                    const cleanVisuals = getStatusVisuals('clean');
                    const CleanIcon = cleanVisuals.Icon;
                    return (
                      <Badge variant={cleanVisuals.variant} className="flex items-center gap-1.5">
                        <CleanIcon className="h-3.5 w-3.5" />
                        <span>Clean: {totals.clean}</span>
                      </Badge>
                    );
                  })()}
                  {(() => {
                    const warningVisuals = getStatusVisuals('warning');
                    const WarningIcon = warningVisuals.Icon;
                    return (
                      <Badge variant={warningVisuals.variant} className="flex items-center gap-1.5">
                        <WarningIcon className="h-3.5 w-3.5" />
                        <span>Warning: {totals.warning}</span>
                      </Badge>
                    );
                  })()}
                  {(() => {
                    const errorVisuals = getStatusVisuals('error');
                    const ErrorIcon = errorVisuals.Icon;
                    return (
                      <Badge variant={errorVisuals.variant} className="flex items-center gap-1.5">
                        <ErrorIcon className="h-3.5 w-3.5" />
                        <span>Error: {totals.error}</span>
                      </Badge>
                    );
                  })()}
              </div>
            </div>
            {lastUpdate && <p className="text-xs text-muted-foreground mt-1">Data per: {lastUpdate}</p>}
          </>
        ) : ( <p className="text-sm text-muted-foreground">Data Palawija tidak tersedia.</p>)}
      </CardContent>
    </Card>
  );
}
