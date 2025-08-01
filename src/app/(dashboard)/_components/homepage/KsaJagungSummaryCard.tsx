import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ElementType } from 'react';
import { AlertTriangle } from "lucide-react";
import { getStatusVisuals } from '@/lib/status-visuals';
import { PinButton } from "@/components/ui/pin-button";
import { cn } from "@/lib/utils";

interface KsaJagungSummaryCardProps {
  isLoading: boolean;
  error: string | null;
  totals: { persentase: number; realisasi: number; target: number; inkonsisten: number; kode_98: number; statuses?: { [key: string]: { count: number } } } | null;
  displayStatus: { text: string; color: string; icon: ElementType } | null;
  displayMonth: string;
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

const getMonthName = (monthNumberStr: string): string => {
  if (!monthNumberStr || monthNumberStr === "") return "Bulan Ini";
  if (monthNumberStr.toLowerCase() === "semua") return "Data Tahunan";
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const monthIndex = parseInt(monthNumberStr, 10) - 1;
  return (monthIndex >= 0 && monthIndex < 12) ? monthNames[monthIndex] : monthNumberStr;
};

export function KsaJagungSummaryCard({ 
  isLoading, 
  error, 
  totals, 
  displayStatus, 
  displayMonth, 
  uniqueStatusNames, 
  lastUpdate, 
  selectedYear, 
  isHighlighted = false,
  // PIN props
  isPinned = false,
  pinOrder = null,
  onTogglePin,
  canPinMore = true
}: KsaJagungSummaryCardProps) {
  return (
    <Card className={cn(
      "h-full transition-all duration-300 hover:shadow-lg relative",
      "bg-white dark:bg-gray-800",
      "border-2 border-[#fdb18f]/30 hover:border-[#fdb18f]/50",
      "dark:border-[#fdb18f]/40 dark:hover:border-[#fdb18f]/60",
      isHighlighted && "ring-2 ring-amber-400 shadow-lg border-amber-500",
      isPinned && "border-blue-200 bg-blue-50/50"
    )}
    style={{
      backgroundColor: isPinned ? 'rgba(59, 130, 246, 0.1)' : 'rgba(253, 177, 143, 0.1)',
    }}
    >
      {/* Dark mode background overlay */}
      <div className="absolute inset-0 rounded-lg hidden dark:block" style={{ 
        backgroundColor: isPinned ? 'rgba(59, 130, 246, 0.15)' : 'rgba(253, 177, 143, 0.15)' 
      }} />
      
      {isHighlighted && (
        <Badge variant="default" className="absolute -top-3 -right-3 flex items-center gap-1 bg-amber-500 text-white hover:bg-amber-600 z-10">
          <AlertTriangle className="h-3 w-3" />
          Perlu Perhatian
        </Badge>
      )}
      
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 relative z-10">
        <div className="flex-1">
          <div className="flex justify-between items-center gap-2">
            <CardTitle className="text-sm font-medium text-[#9a3412] dark:text-[#fed7aa]">
              🌽 KSA Jagung ({selectedYear}) - {getMonthName(displayMonth)}
            </CardTitle>
            {onTogglePin && (
              <PinButton
                kpiId="ksa-jagung"
                isPinned={isPinned}
                pinOrder={pinOrder}
                onTogglePin={onTogglePin}
                canPinMore={canPinMore}
                disabled={isLoading}
              />
            )}
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="border-[#fdb18f]/40 text-[#ea580c] hover:bg-[#fdb18f]/20 dark:text-[#fb923c] dark:border-[#fdb18f]/50 ml-2">
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
                <div className="text-2xl font-bold text-[#9a3412] dark:text-[#fed7aa]">{totals.persentase.toFixed(2)}%</div>
                <p className="text-xs text-[#ea580c] dark:text-[#fb923c]">Realisasi: {totals.realisasi} dari {totals.target} Target</p>
                
                {/* Progress Bar */}
                <div className="mt-3 mb-4">
                  <div className="w-full bg-orange-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(totals.persentase, 100)}%` }}
                    />
                  </div>
                </div>
                {/* Inline Stats */}
                <div className="flex gap-3 mt-3">
                  <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/20 rounded-md px-2 py-1 border border-dashed border-amber-300 dark:border-amber-700">
                    <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{totals.inkonsisten}</span>
                    <span className="text-xs text-amber-700 dark:text-amber-300">Inkonsisten</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/20 rounded-md px-2 py-1 border border-dashed border-orange-300 dark:border-orange-700">
                    <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{totals.kode_98}</span>
                    <span className="text-xs text-orange-700 dark:text-orange-300">Kode 98</span>
                  </div>
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
        ) : (<p className="text-sm text-muted-foreground">Data KSA Jagung tidak tersedia.</p>)}
      </CardContent>
    </Card>
  );
}
