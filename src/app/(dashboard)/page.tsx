"use client";

import * as React from "react";
import Link from 'next/link';
import { useYear } from '@/context/YearContext';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle, AlertTriangle } from "lucide-react";

// Impor hooks yang berhubungan dengan jadwal dan monitoring
import { useJadwalData } from "@/hooks/useJadwalData";
import { usePadiMonitoringData } from '@/hooks/usePadiMonitoringData';
import { usePalawijaMonitoringData } from '@/hooks/usePalawijaMonitoringData';
import { useKsaMonitoringData } from '@/hooks/useKsaMonitoringData';
import { useSimtpKpiData } from "@/hooks/useSimtpKpiData";
import { type Kegiatan } from "@/app/(dashboard)/jadwal/jadwal.config";

// Helper function untuk menghitung selisih hari
const getDiffInDays = (d1: Date, d2: Date): number => {
    const timeDiff = d2.getTime() - d1.getTime();
    return Math.round(timeDiff / (1000 * 60 * 60 * 24));
}

const getMonthName = (monthNumberStr: string | undefined): string => {
  if (!monthNumberStr || monthNumberStr.toLowerCase() === "semua") return "Data Tahunan";
  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", 
                      "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const monthIndex = parseInt(monthNumberStr, 10) - 1;
  if (monthIndex >= 0 && monthIndex < 12) {
    return monthNames[monthIndex];
  }
  return monthNumberStr; 
};

export default function HomePage() {
  const { selectedYear } = useYear();
  const ubinanSubround = 'all';

  const {
    padiTotals, loadingPadi, errorPadi, lastUpdate,
    uniqueStatusNames: padiUniqueStatusNames,
    kegiatanId: padiKegiatanId
  } = usePadiMonitoringData(selectedYear, ubinanSubround);

  const {
    palawijaTotals, loadingPalawija, errorPalawija, lastUpdatePalawija,
    kegiatanId: palawijaKegiatanId
  } = usePalawijaMonitoringData(selectedYear, ubinanSubround);

  const { 
    districtTotals: ksaTotals, isLoading: loadingKsa, error: errorKsa, 
    lastUpdated: lastUpdatedKsa, displayMonth: ksaDisplayMonth, uniqueStatusNames: ksaUniqueStatusNames
  } = useKsaMonitoringData(); 

  const { data: simtpData, isLoading: loadingSimtp, error: errorSimtp, kegiatanId: simtpKegiatanId } = useSimtpKpiData();

  const { jadwalData, isLoading: isJadwalLoading } = useJadwalData(selectedYear);

  const jadwalPadi = React.useMemo(() => !isJadwalLoading && padiKegiatanId ? jadwalData.find(k => k.id === padiKegiatanId) : undefined, [jadwalData, isJadwalLoading, padiKegiatanId]);
  const jadwalPalawija = React.useMemo(() => !isJadwalLoading && palawijaKegiatanId ? jadwalData.find(k => k.id === palawijaKegiatanId) : undefined, [jadwalData, isJadwalLoading, palawijaKegiatanId]);
  const jadwalSimtp = React.useMemo(() => !isJadwalLoading && simtpKegiatanId ? jadwalData.find(k => k.id === simtpKegiatanId) : undefined, [jadwalData, isJadwalLoading, simtpKegiatanId]);

  const calculateCountdown = (jadwal?: Kegiatan) => {
    if (!jadwal) return null;
    const allJadwalItems = [...(jadwal.jadwal || []), ...(jadwal.subKegiatan?.flatMap(sub => sub.jadwal || []) || [])];
    if (allJadwalItems.length === 0) return null;
    const allStartDates = allJadwalItems.map(j => new Date(j.startDate));
    const allEndDates = allJadwalItems.map(j => new Date(j.endDate));
    const earliestStart = new Date(Math.min(...allStartDates.map(d => d.getTime())));
    const latestEnd = new Date(Math.max(...allEndDates.map(d => d.getTime())));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (today > latestEnd) return { text: "Jadwal Telah Berakhir", color: "text-gray-500" };
    if (today >= earliestStart && today <= latestEnd) {
      const daysLeft = getDiffInDays(today, latestEnd);
      if (daysLeft === 0) return { text: "Berakhir Hari Ini", color: "text-red-600" };
      return { text: `Berakhir dalam ${daysLeft} hari`, color: "text-green-600" };
    }
    if (today < earliestStart) {
      const daysUntil = getDiffInDays(today, earliestStart);
       if (daysUntil === 1) return { text: "Dimulai Besok", color: "text-blue-600" };
      return { text: `Dimulai dalam ${daysUntil} hari`, color: "text-blue-600" };
    }
    return null;
  }

  const countdownStatusPadi = React.useMemo(() => calculateCountdown(jadwalPadi), [jadwalPadi]);
  const countdownStatusPalawija = React.useMemo(() => calculateCountdown(jadwalPalawija), [jadwalPalawija]);
  
  const simtpDisplayStatus = React.useMemo(() => {
    if (!jadwalSimtp || !simtpData) return null;

    const allJadwalItems = [...(jadwalSimtp.jadwal || []), ...(jadwalSimtp.subKegiatan?.flatMap(sub => sub.jadwal || []) || [])]
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    if (allJadwalItems.length === 0) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentOrNextSegment = allJadwalItems.find(item => today <= new Date(item.endDate));
    if (!currentOrNextSegment) {
        const kpiStatus = simtpData.monthly.percentage >= 100 ? 'Selesai' : 'Terlambat';
        return { line1: { text: `Status Laporan: ${kpiStatus}`, color: "text-gray-500", icon: CheckCircle } };
    }

    const segmentStart = new Date(currentOrNextSegment.startDate);
    const segmentEnd = new Date(currentOrNextSegment.endDate);
    const segmentMonthName = segmentStart.toLocaleString('id-ID', { month: 'long' });

    if (today >= segmentStart && today <= segmentEnd) {
        const daysLeft = getDiffInDays(today, segmentEnd);
        let text = `Batas laporan ${segmentMonthName} berakhir dalam ${daysLeft} hari`;
        if (daysLeft === 0) text = `Batas laporan ${segmentMonthName} berakhir hari ini`;
        return { line1: { text, color: daysLeft === 0 ? "text-red-600 font-bold" : "text-green-600", icon: Clock } };
    }
    
    if (today < segmentStart) {
        const kpiMonthName = simtpData.monthly.reportForMonthName;
        const kpiProgress = simtpData.monthly.percentage;
        const line1Text = kpiProgress >= 100 ? `Laporan ${kpiMonthName}: Selesai` : `Laporan ${kpiMonthName}: Terlambat`;
        const line1Color = kpiProgress >= 100 ? "text-green-600" : "text-amber-600";
        const line1Icon = kpiProgress >= 100 ? CheckCircle : AlertTriangle;

        const daysUntil = getDiffInDays(today, segmentStart);
        const line2Text = daysUntil === 1 ? `Periode berikutnya dimulai besok` : `Periode berikutnya dimulai dalam ${daysUntil} hari`;

        return {
            line1: { text: line1Text, color: line1Color, icon: line1Icon },
            line2: { text: line2Text, color: "text-blue-600", icon: Clock }
        };
    }
    
    return null;
  }, [jadwalSimtp, simtpData]);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ubinan Padi ({selectedYear})</CardTitle>
            <Button asChild variant="outline" size="sm"><Link href="/monitoring/ubinan">Lihat Detail</Link></Button>
          </CardHeader>
          <CardContent className="flex flex-col h-full">
            {loadingPadi || isJadwalLoading ? (
              <div className="space-y-2"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-8 w-1/2" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-2/3" /></div>
            ) : errorPadi ? (
              <p className="text-xs text-red-500">Error: {errorPadi}</p>
            ) : padiTotals && typeof padiTotals.persentase === 'number' ? (
              <>
                {countdownStatusPadi && ( <div className="flex items-center text-xs text-muted-foreground mb-4"><Clock className={`h-4 w-4 mr-2 ${countdownStatusPadi.color}`} /><span className={`font-medium ${countdownStatusPadi.color}`}>{countdownStatusPadi.text}</span></div> )}
                <div className="flex-grow">
                  <div className="text-2xl font-bold">{padiTotals.persentase.toFixed(2)}%</div>
                  <p className="text-xs text-muted-foreground">Realisasi: {padiTotals.realisasi} dari {padiTotals.targetUtama} Target Utama</p>
                  <div className="flex flex-col md:flex-row md:gap-6">
                      <p className="text-xs text-muted-foreground mt-1 flex items-center flex-wrap">Total Lewat Panen:&nbsp;<Badge variant={padiTotals.lewatPanen > 0 ? "destructive" : "success"}>{padiTotals.lewatPanen}</Badge></p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center flex-wrap">Jumlah Anomali:&nbsp;<Badge variant={padiTotals.anomali > 0 ? "destructive" : "success"}>{padiTotals.anomali}</Badge></p>
                  </div>
                </div>
                {padiTotals.statuses && padiUniqueStatusNames && padiUniqueStatusNames.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-3 pt-2 border-t">
                    <h4 className="font-semibold mb-1 text-foreground">Detail Status Ubinan:</h4>
                    <div className="flex flex-wrap gap-1">
                      {padiUniqueStatusNames.map(statusName => {
                        const count = padiTotals.statuses?.[statusName];
                        if (count !== undefined) { return ( <Badge key={statusName} variant="secondary">{statusName}: {count}</Badge> ); }
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

        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ubinan Palawija ({selectedYear})</CardTitle>
            <Button asChild variant="outline" size="sm"><Link href="/monitoring/ubinan">Lihat Detail</Link></Button>
          </CardHeader>
          <CardContent className="flex flex-col h-full">
            {loadingPalawija || isJadwalLoading ? (
              <div className="space-y-2"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-8 w-1/2" /><Skeleton className="h-4 w-full" /></div>
            ) : errorPalawija ? (
              <p className="text-xs text-red-500">Error: {errorPalawija}</p>
            ) : palawijaTotals && typeof palawijaTotals.persentase === 'number' ? (
              <>
                {countdownStatusPalawija && (<div className="flex items-center text-xs text-muted-foreground mb-4"><Clock className={`h-4 w-4 mr-2 ${countdownStatusPalawija.color}`} /><span className={`font-medium ${countdownStatusPalawija.color}`}>{countdownStatusPalawija.text}</span></div>)}
                <div className="flex-grow">
                    <div className="text-2xl font-bold">{palawijaTotals.persentase.toFixed(2)}%</div>
                    <p className="text-xs text-muted-foreground">Realisasi: {palawijaTotals.realisasi} dari {palawijaTotals.target} Target</p>
                </div>
                <div className="text-xs text-muted-foreground mt-3 pt-2 border-t">
                  <h4 className="font-semibold mb-1 text-foreground">Detail Status Validasi:</h4>
                  <div className="flex flex-wrap items-center gap-1">
                    <Badge variant="secondary">Clean: {palawijaTotals.clean}</Badge><Badge variant="secondary">Warning: {palawijaTotals.warning}</Badge><Badge variant="secondary">Error: {palawijaTotals.error}</Badge>
                  </div>
                </div>
                {lastUpdatePalawija && <p className="text-xs text-muted-foreground mt-1">Data per: {lastUpdatePalawija}</p>}
              </>
            ) : ( <p className="text-sm text-muted-foreground">Data Palawija tidak tersedia.</p>)}
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">KSA Padi ({selectedYear}) - {getMonthName(ksaDisplayMonth)}</CardTitle>
            <Button asChild variant="outline" size="sm"><Link href="/monitoring/ksa">Lihat Detail</Link></Button>
          </CardHeader>
          <CardContent className="flex flex-col h-full">
            {loadingKsa ? ( <div className="space-y-2"><Skeleton className="h-8 w-3/4 mb-1" /><Skeleton className="h-4 w-full mb-1" /><Skeleton className="h-4 w-2/3 mt-1" /></div>
            ) : errorKsa ? ( <p className="text-xs text-red-500">Error: {errorKsa}</p>
            ) : ksaTotals ? (
              <>
                <div className="flex-grow">
                    <div className="text-2xl font-bold">{ksaTotals.persentase.toFixed(2)}%</div>
                    <p className="text-xs text-muted-foreground">Realisasi: {ksaTotals.realisasi} dari {ksaTotals.target} Target</p>
                    <div className="flex flex-col md:flex-row md:gap-6">
                        <p className="text-xs text-muted-foreground mt-1 flex items-center flex-wrap">Inkonsisten:&nbsp;<Badge variant={ksaTotals.inkonsisten > 0 ? "destructive" : "success"}>{ksaTotals.inkonsisten}</Badge></p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center">Total Kode 12:&nbsp;<Badge variant="warning">{ksaTotals.kode_12}</Badge></p>
                    </div>
                </div>
                {ksaTotals.statuses && ksaUniqueStatusNames && ksaUniqueStatusNames.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-3 pt-2 border-t">
                    <h4 className="font-semibold mb-1 text-foreground">Detail Status KSA:</h4>
                    <div className="flex flex-wrap gap-1">
                      {ksaUniqueStatusNames.map(statusName => {
                          const statusData = ksaTotals.statuses?.[statusName];
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
                {lastUpdatedKsa && <p className="text-xs text-muted-foreground mt-1">Data per: {lastUpdatedKsa}</p>}
              </>
            ) : (<p className="text-sm text-muted-foreground">Data KSA tidak tersedia.</p>)}
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SIMTP - {simtpData ? simtpData.monthly.reportForMonthName : "Data tidak tersedia"}</CardTitle>
            <Button asChild variant="outline" size="sm"><Link href="/monitoring/simtp">Lihat Detail</Link></Button>
          </CardHeader>
          <CardContent className="flex flex-col h-full">
            {loadingSimtp || isJadwalLoading ? (
              <div className="space-y-2"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-8 w-1/2" /><Skeleton className="h-4 w-full mb-1" /><Skeleton className="h-4 w-2/3 mt-2" /></div>
            ) : errorSimtp ? (
              <p className="text-xs text-red-500">Error: {errorSimtp}</p>
            ) : simtpData ? (
              <>
                <div className='space-y-1 mb-4'>
                  {simtpDisplayStatus?.line1 && (
                    <div className="flex items-center text-xs text-muted-foreground">
                        <simtpDisplayStatus.line1.icon className={`h-4 w-4 mr-2 ${simtpDisplayStatus.line1.color}`} />
                        <span className={`font-medium ${simtpDisplayStatus.line1.color}`}>{simtpDisplayStatus.line1.text}</span>
                    </div>
                  )}
                  {simtpDisplayStatus?.line2 && (
                    <div className="flex items-center text-xs text-muted-foreground">
                        <simtpDisplayStatus.line2.icon className={`h-4 w-4 mr-2 ${simtpDisplayStatus.line2.color}`} />
                        <span className={`font-medium ${simtpDisplayStatus.line2.color}`}>{simtpDisplayStatus.line2.text}</span>
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <div className="text-2xl font-bold">{simtpData.monthly.percentage.toFixed(2)}%</div>
                  <p className="text-xs text-muted-foreground">
                    Laporan Bulanan: 
                    <span className="font-semibold text-foreground">{` ${simtpData.monthly.uploadedCount} dari ${simtpData.monthly.totalDistricts} Kab/Kota`}</span>
                  </p>
                  <Progress value={simtpData.monthly.percentage} className="mt-2 h-2" />
                </div>
                <div className="text-xs text-muted-foreground mt-3 pt-2 border-t">
                  <h4 className="font-semibold mb-1 text-foreground">Data Tahunan ({simtpData.annual.reportForYear}):</h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <Badge variant="secondary">Lahan: {simtpData.annual.lahanCount}/{simtpData.annual.totalDistricts}</Badge>
                    <Badge variant="secondary">Alsin: {simtpData.annual.alsinCount}/{simtpData.annual.totalDistricts}</Badge>
                    <Badge variant="secondary">Benih: {simtpData.annual.benihCount}/{simtpData.annual.totalDistricts}</Badge>
                  </div>
                </div>
                {simtpData.lastUpdate && <p className="text-xs text-muted-foreground mt-2">Data per: {simtpData.lastUpdate}</p>}
              </>
            ) : (<p className="text-sm text-muted-foreground">Data SIMTP tidak tersedia.</p>)}
          </CardContent>
        </Card>
      </div>
      <p className="mt-6 text-gray-500 text-center text-xs">
        Selamat datang di dashboard pemantauan Anda.
      </p>
    </>
  );
}