import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  isHighlighted?: boolean;
}

export function SimtpSummaryCard({ isLoading, error, data, displayStatus, isHighlighted }: SimtpSummaryCardProps) {
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
        <CardTitle className="text-sm font-medium">SIMTP - {data ? data.monthly.reportForMonthName : "Data tidak tersedia"}</CardTitle>
        <Button asChild variant="outline" size="sm"><Link href="/monitoring/simtp">Lihat Detail</Link></Button>
      </CardHeader>
      <CardContent className="flex flex-col h-full">
        {isLoading ? (
          <div className="space-y-2"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-8 w-1/2" /><Skeleton className="h-4 w-full mb-1" /><Skeleton className="h-4 w-2/3 mt-2" /></div>
        ) : error ? (
          <p className="text-xs text-red-500">Error: {error}</p>
        ) : data ? (
          <>
            <div className='space-y-1 mb-4'>
              {displayStatus?.line1 && ( <div className="flex items-center text-xs text-muted-foreground"><displayStatus.line1.icon className={`h-4 w-4 mr-2 ${displayStatus.line1.color}`} /><span className={`font-medium ${displayStatus.line1.color}`}>{displayStatus.line1.text}</span></div> )}
              {displayStatus?.line2 && ( <div className="flex items-center text-xs text-muted-foreground"><displayStatus.line2.icon className={`h-4 w-4 mr-2 ${displayStatus.line2.color}`} /><span className={`font-medium ${displayStatus.line2.color}`}>{displayStatus.line2.text}</span></div> )}
            </div>
            <div className="flex-grow">
              <div className="text-2xl font-bold">{data.monthly.percentage.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground">Laporan Bulanan: <span className="font-semibold text-foreground">{` ${data.monthly.uploadedCount} dari ${data.monthly.totalDistricts} Kab/Kota`}</span></p>
              <Progress value={data.monthly.percentage} className="mt-2 h-2" />
            </div>
            <div className="text-xs text-muted-foreground mt-3 pt-2 border-t">
              <h4 className="font-semibold mb-1 text-foreground">Data Tahunan ({data.annual.reportForYear}):</h4>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <Badge variant="secondary">Lahan: {data.annual.lahanCount}/{data.annual.totalDistricts}</Badge>
                <Badge variant="secondary">Alsin: {data.annual.alsinCount}/{data.annual.totalDistricts}</Badge>
                <Badge variant="secondary">Benih: {data.annual.benihCount}/{data.annual.totalDistricts}</Badge>
              </div>
            </div>
            {data.lastUpdate && <p className="text-xs text-muted-foreground mt-2">Data per: {data.lastUpdate}</p>}
          </>
        ) : (<p className="text-sm text-muted-foreground">Data SIMTP tidak tersedia.</p>)}
      </CardContent>
    </Card>
  );
}
