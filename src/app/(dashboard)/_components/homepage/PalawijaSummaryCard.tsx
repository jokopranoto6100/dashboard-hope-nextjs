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

interface PalawijaSummaryCardProps {
  isLoading: boolean;
  error: string | null;
  totals: { persentase: number; realisasi: number; target: number; clean: number; warning: number; error: number; } | null;
  countdownStatus: { text: string; color: string; icon: ElementType } | null;
  lastUpdate: string | null;
  selectedYear: number;
  isHighlighted?: boolean;
  // PIN props
  isPinned?: boolean;
  pinOrder?: number | null;
  onTogglePin?: (kpiId: string) => Promise<void>;
  canPinMore?: boolean;
}

export function PalawijaSummaryCard({ 
  isLoading, 
  error, 
  totals, 
  countdownStatus, 
  lastUpdate, 
  selectedYear, 
  isHighlighted = false,
  // PIN props
  isPinned = false,
  pinOrder = null,
  onTogglePin,
  canPinMore = true
}: PalawijaSummaryCardProps) {
  return (
    <Card className={cn(
      "h-full transition-all duration-300 hover:shadow-lg hover:scale-105 relative",
      "bg-white dark:bg-gray-800",
      "border-2 border-[#fab067]/30 hover:border-[#fab067]/50",
      "dark:border-[#fab067]/40 dark:hover:border-[#fab067]/60",
      isHighlighted && "ring-2 ring-amber-400 shadow-lg border-amber-500",
      isPinned && "border-blue-200 bg-blue-50/50"
    )}
    style={{
      backgroundColor: isPinned ? 'rgba(59, 130, 246, 0.1)' : 'rgba(250, 176, 103, 0.1)',
    }}
    >
      {/* Dark mode background overlay */}
      <div className="absolute inset-0 rounded-lg hidden dark:block" style={{ 
        backgroundColor: isPinned ? 'rgba(59, 130, 246, 0.15)' : 'rgba(250, 176, 103, 0.15)' 
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
            <CardTitle className="text-sm font-medium text-[#7c2d12] dark:text-[#fed7aa]">
              🌽 Ubinan Palawija ({selectedYear})
            </CardTitle>
            {onTogglePin && (
              <PinButton
                kpiId="palawija"
                isPinned={isPinned}
                pinOrder={pinOrder}
                onTogglePin={onTogglePin}
                canPinMore={canPinMore}
                disabled={isLoading}
              />
            )}
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="border-[#fab067]/40 text-[#c2410c] hover:bg-[#fab067]/20 dark:text-[#fb923c] dark:border-[#fab067]/50 ml-2">
          <Link href="/monitoring/ubinan">Lihat Detail</Link>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col h-full relative z-10">
        {isLoading ? ( <div className="space-y-2"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-8 w-1/2" /><Skeleton className="h-4 w-full" /></div>
        ) : error ? ( <p className="text-xs text-red-500 dark:text-red-400">Error: {error}</p>
        ) : totals && typeof totals.persentase === 'number' ? (
          <>
            {countdownStatus && (<div className="flex items-center text-xs text-muted-foreground mb-4"><countdownStatus.icon className={`h-4 w-4 mr-2 ${countdownStatus.color}`} /><span className={`font-medium ${countdownStatus.color}`}>{countdownStatus.text}</span></div>)}
            <div className="flex-grow">
                <div className="text-2xl font-bold text-[#7c2d12] dark:text-[#fed7aa]">{totals.persentase.toFixed(2)}%</div>
                <p className="text-xs text-[#c2410c] dark:text-[#fb923c]">Realisasi: {totals.realisasi} dari {totals.target} Target</p>
                
                {/* Progress Bar */}
                <div className="mt-3 mb-4">
                  <div className="w-full bg-yellow-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-amber-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(totals.persentase, 100)}%` }}
                    />
                  </div>
                </div>
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
