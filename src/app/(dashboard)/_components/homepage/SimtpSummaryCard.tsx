import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ElementType } from 'react';
import { AlertTriangle } from "lucide-react";

interface SimtpSummaryCardProps {
  isLoading: boolean;
  error: string | null;
  data: {
    monthly: { reportForMonthName: string; percentage: number; uploadedCount: number; totalDistricts: number; };
    annual: { reportForYear: number; lahanCount: number; alsinCount: number; benihCount: number; totalDistricts: number; };
    lastUpdate: string | null;
  } | null;
  displayStatus: {
    line1?: { text: string; color: string; icon: ElementType };
    line2?: { text: string; color: string; icon: ElementType };
  } | null;
  selectedYear: number;
  isHighlighted?: boolean;
}

export function SimtpSummaryCard({ isLoading, error, data, displayStatus, selectedYear, isHighlighted }: SimtpSummaryCardProps) {
  return (
    <Card className={`
      h-full transition-all duration-300 hover:shadow-lg hover:scale-105 relative
      bg-white dark:bg-gray-800
      border-2 border-[#c87cc3]/30 hover:border-[#c87cc3]/50 
      dark:border-[#c87cc3]/40 dark:hover:border-[#c87cc3]/60
      ${isHighlighted ? 'ring-2 ring-amber-400 shadow-lg border-amber-500' : ''}
    `}
    style={{
      backgroundColor: 'rgba(200, 124, 195, 0.1)',
    }}
    >
      {/* Dark mode background overlay */}
      <div className="absolute inset-0 rounded-lg hidden dark:block" style={{ backgroundColor: 'rgba(200, 124, 195, 0.15)' }} />
      
      {isHighlighted && (
        <Badge variant="default" className="absolute -top-3 -right-3 flex items-center gap-1 bg-amber-500 text-white hover:bg-amber-600 z-10">
          <AlertTriangle className="h-3 w-3" />
          Perlu Perhatian
        </Badge>
      )}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-[#581c87] dark:text-[#e9d5ff]">📱 SIMTP ({selectedYear}) - {data ? data.monthly.reportForMonthName : "Data tidak tersedia"}</CardTitle>
        <Button asChild variant="outline" size="sm" className="border-[#c87cc3]/40 text-[#7c3aed] hover:bg-[#c87cc3]/20 dark:text-[#a855f7] dark:border-[#c87cc3]/50">
          <Link href="/monitoring/simtp">Lihat Detail</Link>
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col h-full relative z-10">
        {isLoading ? (
          <div className="space-y-2"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-8 w-1/2" /><Skeleton className="h-4 w-full mb-1" /><Skeleton className="h-4 w-2/3 mt-2" /></div>
        ) : error ? (
          <p className="text-xs text-red-500 dark:text-red-400">Error: {error}</p>
        ) : data ? (
          <>
            <div className='space-y-1 mb-4'>
              {displayStatus?.line1 && ( <div className="flex items-center text-xs text-muted-foreground"><displayStatus.line1.icon className={`h-4 w-4 mr-2 ${displayStatus.line1.color}`} /><span className={`font-medium ${displayStatus.line1.color}`}>{displayStatus.line1.text}</span></div> )}
              {displayStatus?.line2 && ( <div className="flex items-center text-xs text-muted-foreground"><displayStatus.line2.icon className={`h-4 w-4 mr-2 ${displayStatus.line2.color}`} /><span className={`font-medium ${displayStatus.line2.color}`}>{displayStatus.line2.text}</span></div> )}
            </div>
            <div className="flex-grow">
              <div className="text-2xl font-bold text-[#581c87] dark:text-[#e9d5ff]">{data.monthly.percentage.toFixed(2)}%</div>
              <p className="text-xs text-[#7c3aed] dark:text-[#a855f7]">Laporan Bulanan: <span className="font-semibold text-[#581c87] dark:text-[#e9d5ff]">{` ${data.monthly.uploadedCount} dari ${data.monthly.totalDistricts} Kab/Kota`}</span></p>
              
              {/* Progress Bar */}
              <div className="mt-3 mb-4">
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-400 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(data.monthly.percentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-3 pt-2 border-t">
              <h4 className="font-semibold mb-1 text-foreground">Data Tahunan ({data.annual.reportForYear}):</h4>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <Badge variant={data.annual.lahanCount === data.annual.totalDistricts ? "success" : data.annual.lahanCount > 0 ? "warning" : "danger"}>Lahan: {data.annual.lahanCount}/{data.annual.totalDistricts}</Badge>
                <Badge variant={data.annual.alsinCount === data.annual.totalDistricts ? "success" : data.annual.alsinCount > 0 ? "warning" : "danger"}>Alsin: {data.annual.alsinCount}/{data.annual.totalDistricts}</Badge>
                <Badge variant={data.annual.benihCount === data.annual.totalDistricts ? "success" : data.annual.benihCount > 0 ? "warning" : "danger"}>Benih: {data.annual.benihCount}/{data.annual.totalDistricts}</Badge>
              </div>
            </div>
            {data.lastUpdate && <p className="text-xs text-muted-foreground mt-2">Data per: {data.lastUpdate}</p>}
          </>
        ) : (<p className="text-sm text-muted-foreground">Data SIMTP tidak tersedia.</p>)}
      </CardContent>
    </Card>
  );
}
