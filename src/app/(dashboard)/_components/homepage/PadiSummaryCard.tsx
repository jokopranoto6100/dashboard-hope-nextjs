import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, Pin } from "lucide-react";
import { getStatusVisuals } from '@/lib/status-visuals';
import { PinButton } from "@/components/ui/pin-button";
import { cn } from "@/lib/utils";

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
  // PIN props
  isPinned?: boolean;
  pinOrder?: number | null;
  onTogglePin?: (kpiId: string) => Promise<void>;
  canPinMore?: boolean;
}

export function PadiSummaryCard({ 
  isLoading, 
  error, 
  totals, 
  countdownStatus, 
  uniqueStatusNames, 
  lastUpdate, 
  selectedYear, 
  isHighlighted,
  isPinned = false,
  pinOrder,
  onTogglePin,
  canPinMore = true
}: PadiSummaryCardProps) {
  return (
    <Card className={cn(
      "h-full transition-all duration-300 hover:shadow-lg hover:scale-105 relative",
      "bg-white dark:bg-gray-800",
      "border-2 border-[#78d19a]/30 hover:border-[#78d19a]/50",
      "dark:border-[#78d19a]/40 dark:hover:border-[#78d19a]/60",
      isHighlighted && "ring-2 ring-amber-400 shadow-lg border-amber-500",
      isPinned && "ring-2 ring-amber-500/30 shadow-lg border-amber-500/50"
    )}
    style={{
      backgroundColor: 'rgba(120, 209, 154, 0.1)',
    }}
    >
      {/* Dark mode background overlay */}
      <div className="absolute inset-0 rounded-lg hidden dark:block" style={{ backgroundColor: 'rgba(120, 209, 154, 0.15)' }} />
      
      {isHighlighted && (
        <Badge variant="default" className="absolute -top-3 -right-3 flex items-center gap-1 bg-amber-500 text-white hover:bg-amber-600 z-10">
          <AlertTriangle className="h-3 w-3" />
          Perlu Perhatian
        </Badge>
      )}
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 relative z-10">
        <div className="flex-1">
          <div className="flex justify-between items-center gap-2">
            <CardTitle className="text-sm font-medium text-[#0f4c2a] dark:text-[#86efac]">
              🌾 Ubinan Padi ({selectedYear})
            </CardTitle>
            {onTogglePin && (
              <PinButton 
                kpiId="padi"
                isPinned={isPinned}
                pinOrder={pinOrder}
                onTogglePin={onTogglePin}
                canPinMore={canPinMore}
                disabled={isLoading}
              />
            )}
          </div>
          {isPinned && pinOrder && (
            <Badge variant="secondary" className="w-fit text-xs bg-blue-100 text-blue-700 mt-1">
              <Pin className="h-3 w-3 mr-1" />
              PIN #{pinOrder}
            </Badge>
          )}
        </div>
        <Button asChild variant="outline" size="sm" className="border-[#78d19a]/40 text-[#166534] hover:bg-[#78d19a]/20 dark:text-[#4ade80] dark:border-[#78d19a]/50 ml-2">
          <Link href="/monitoring/ubinan">Lihat Detail</Link>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col h-full relative z-10">
        {isLoading ? (
          <div className="space-y-2"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-8 w-1/2" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></div>
        ) : error ? (
          <p className="text-xs text-red-500 dark:text-red-400">Error: {error}</p>
        ) : totals && typeof totals.persentase === 'number' ? (
          <>
            {countdownStatus && ( <div className="flex items-center text-xs text-muted-foreground mb-4"><Clock className={`h-4 w-4 mr-2 ${countdownStatus.color}`} /><span className={`font-medium ${countdownStatus.color}`}>{countdownStatus.text}</span></div> )}
            <div className="flex-grow">
              <div className="text-2xl font-bold text-[#0f4c2a] dark:text-[#86efac]">{totals.persentase.toFixed(2)}%</div>
              <p className="text-xs text-green-600">Realisasi: {totals.realisasi} dari {totals.targetUtama} Target Utama</p>
              
              {/* Progress Bar */}
              <div className="mt-3 mb-4">
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(totals.persentase, 100)}%` }}
                  />
                </div>
              </div>
              
              {/* Inline Stats */}
              <div className="flex gap-3 mt-3">
                <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/20 rounded-md px-2 py-1 border border-dashed border-amber-300 dark:border-amber-700">
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{totals.lewatPanen}</span>
                  <span className="text-xs text-amber-700 dark:text-amber-300">Lewat Panen</span>
                </div>
                
                <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/20 rounded-md px-2 py-1 border border-dashed border-red-300 dark:border-red-700">
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">{totals.anomali}</span>
                  <span className="text-xs text-red-700 dark:text-red-300">Anomali</span>
                </div>
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
