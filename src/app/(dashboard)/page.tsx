"use client";

import * as React from "react";
import { useYear } from '@/context/YearContext';

// Import hooks
import { useJadwalData } from "@/hooks/useJadwalData";
import { usePadiMonitoringData } from '@/hooks/usePadiMonitoringData';
import { usePalawijaMonitoringData } from '@/hooks/usePalawijaMonitoringData';
import { useKsaMonitoringData } from "@/hooks/useKsaMonitoringData";
import { useSimtpKpiData } from "@/hooks/useSimtpKpiData";

// Import komponen-komponen modular dan UI
import { PadiSummaryCard } from "@/app/(dashboard)/_components/homepage/PadiSummaryCard";
import { PalawijaSummaryCard } from "@/app/(dashboard)/_components/homepage/PalawijaSummaryCard";
import { KsaSummaryCard } from "@/app/(dashboard)/_components/homepage/KsaSummaryCard";
import { SimtpSummaryCard } from "@/app/(dashboard)/_components/homepage/SimtpSummaryCard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Import tipe data dan ikon
import { type Kegiatan } from "@/app/(dashboard)/jadwal/jadwal.config";
import { Clock, CheckCircle, AlertTriangle } from "lucide-react";

// ✅ BAGIAN BARU: Komponen Skeleton untuk seluruh halaman
const HomepageSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
    {Array.from({ length: 4 }).map((_, index) => (
      <Card key={index}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-5 w-3/5" />
          <Skeleton className="h-8 w-1/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mt-4">
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Fungsi helper
const getDiffInDays = (d1: Date, d2: Date): number => {
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24));
}

export default function HomePage() {
  const { selectedYear } = useYear();
  const ubinanSubround = 'all';

  // Bagian 1: Pengambilan Data
  const { padiTotals, loadingPadi, errorPadi, lastUpdate, uniqueStatusNames: padiUniqueStatusNames, kegiatanId: padiKegiatanId } = usePadiMonitoringData(selectedYear, ubinanSubround);
  const { palawijaTotals, loadingPalawija, errorPalawija, lastUpdatePalawija, kegiatanId: palawijaKegiatanId } = usePalawijaMonitoringData(selectedYear, ubinanSubround);
  const { districtTotals: ksaTotals, isLoading: loadingKsa, error: errorKsa, lastUpdated: lastUpdatedKsa, displayMonth: ksaDisplayMonth, uniqueStatusNames: ksaUniqueStatusNames, kegiatanId: ksaKegiatanId } = useKsaMonitoringData();
  const { data: simtpData, isLoading: loadingSimtp, error: errorSimtp, kegiatanId: simtpKegiatanId } = useSimtpKpiData();
  const { jadwalData, isLoading: isJadwalLoading } = useJadwalData(selectedYear);

  // ✅ BAGIAN BARU: Gabungkan semua status loading menjadi satu
  const isAnythingLoading = loadingPadi || loadingPalawija || loadingKsa || loadingSimtp || isJadwalLoading;

  // Bagian 2: Kalkulasi & Memoization (Tidak berubah)
  // ... (semua useMemo Anda untuk kalkulasi tetap sama)
  const jadwalPadi = React.useMemo(() => !isJadwalLoading && padiKegiatanId ? jadwalData.find(k => k.id === padiKegiatanId) : undefined, [jadwalData, isJadwalLoading, padiKegiatanId]);
  const jadwalPalawija = React.useMemo(() => !isJadwalLoading && palawijaKegiatanId ? jadwalData.find(k => k.id === palawijaKegiatanId) : undefined, [jadwalData, isJadwalLoading, palawijaKegiatanId]);
  const jadwalSimtp = React.useMemo(() => !isJadwalLoading && simtpKegiatanId ? jadwalData.find(k => k.id === simtpKegiatanId) : undefined, [jadwalData, isJadwalLoading, simtpKegiatanId]);
  const jadwalKsa = React.useMemo(() => !isJadwalLoading && ksaKegiatanId ? jadwalData.find(k => k.id === ksaKegiatanId) : undefined, [jadwalData, isJadwalLoading, ksaKegiatanId]);

  const calculateCountdown = (jadwal?: Kegiatan) => {
    if (!jadwal) return null;
    const allJadwalItems = [...(jadwal.jadwal || []), ...(jadwal.subKegiatan?.flatMap(sub => sub.jadwal || []) || [])];
    if (allJadwalItems.length === 0) return null;
    const allStartDates = allJadwalItems.map(j => new Date(j.startDate));
    const allEndDates = allJadwalItems.map(j => new Date(j.endDate));
    const earliestStart = new Date(Math.min(...allStartDates.map(d => d.getTime())));
    const latestEnd = new Date(Math.max(...allEndDates.map(d => d.getTime())));
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (today > latestEnd) return { text: "Jadwal Telah Berakhir", color: "text-gray-500", icon: CheckCircle };
    if (today >= earliestStart && today <= latestEnd) {
      const daysLeft = getDiffInDays(today, latestEnd);
      return { text: daysLeft === 0 ? "Berakhir Hari Ini" : `Berakhir dalam ${daysLeft} hari`, color: daysLeft === 0 ? "text-red-600 font-bold" : "text-green-600", icon: Clock };
    }
    if (today < earliestStart) {
      const daysUntil = getDiffInDays(today, earliestStart);
      return { text: daysUntil === 1 ? "Dimulai Besok" : `Dimulai dalam ${daysUntil} hari`, color: "text-blue-600", icon: Clock };
    }
    return null;
  }
  
  const countdownStatusPadi = React.useMemo(() => calculateCountdown(jadwalPadi), [jadwalPadi]);
  const countdownStatusPalawija = React.useMemo(() => calculateCountdown(jadwalPalawija), [jadwalPalawija]);
  const simtpDisplayStatus = React.useMemo(() => {
      if (!jadwalSimtp || !simtpData) return null;
      
      const allJadwalItems = [...(jadwalSimtp.jadwal || []), ...(jadwalSimtp.subKegiatan?.flatMap(sub => sub.jadwal || []) || [])].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      if (allJadwalItems.length === 0) return null;

      const today = new Date(); 
      today.setHours(0, 0, 0, 0);

      const currentOrNextSegment = allJadwalItems.find(item => {
          const itemEnd = new Date(item.endDate);
          itemEnd.setHours(0, 0, 0, 0); // --> PERBAIKAN: Normalisasi tanggal akhir
          return today <= itemEnd;
      });

      if (!currentOrNextSegment) { 
          return { line1: { text: `Status Laporan: ${simtpData.monthly.percentage >= 100 ? 'Selesai' : 'Terlambat'}`, color: "text-gray-500", icon: CheckCircle } }; 
      }

      const segmentStart = new Date(currentOrNextSegment.startDate);
      segmentStart.setHours(0, 0, 0, 0); // --> PERBAIKAN: Normalisasi tanggal mulai

      const segmentEnd = new Date(currentOrNextSegment.endDate);
      segmentEnd.setHours(0, 0, 0, 0); // --> PERBAIKAN: Normalisasi tanggal akhir

      if (today >= segmentStart && today <= segmentEnd) {
          const daysLeft = getDiffInDays(today, segmentEnd);
          let text = `Laporan ${segmentStart.toLocaleString('id-ID', { month: 'long' })} berakhir dalam ${daysLeft} hari`;
          if (daysLeft === 0) text = `Batas laporan ${segmentStart.toLocaleString('id-ID', { month: 'long' })} berakhir hari ini`;
          return { line1: { text, color: daysLeft === 0 ? "text-red-600 font-bold" : "text-green-600", icon: Clock } };
      }

      if (today < segmentStart) {
          const kpiProgress = simtpData.monthly.percentage;
          return {
            line1: { text: kpiProgress >= 100 ? `Laporan ${simtpData.monthly.reportForMonthName}: Selesai` : `Laporan ${simtpData.monthly.reportForMonthName}: Terlambat`, color: kpiProgress >= 100 ? "text-green-600" : "text-amber-600", icon: kpiProgress >= 100 ? CheckCircle : AlertTriangle },
            line2: { text: `Periode berikutnya dimulai dalam ${getDiffInDays(today, segmentStart)} hari`, color: "text-blue-600", icon: Clock }
          };
      }

      return null; // Fallback jika kondisi di atas tidak ada yang cocok
  }, [jadwalSimtp, simtpData]);
  
  const ksaDisplayStatus = React.useMemo(() => {
    if (!jadwalKsa || !ksaDisplayMonth || !ksaTotals) return null;
    const allJadwalItems = [...(jadwalKsa.jadwal || []), ...(jadwalKsa.subKegiatan?.flatMap(sub => sub.jadwal || []) || [])].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    if (allJadwalItems.length === 0) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const currentKsaSegment = allJadwalItems.find(item => new Date(item.startDate).getMonth() === (parseInt(ksaDisplayMonth, 10) - 1));
    if (!currentKsaSegment) return null;
    const segmentStart = new Date(currentKsaSegment.startDate);
    const segmentEnd = new Date(currentKsaSegment.endDate);
    if (today >= segmentStart && today <= segmentEnd) {
      const daysLeft = getDiffInDays(today, segmentEnd);
      return { text: daysLeft === 0 ? `Berakhir hari ini` : `Berakhir dalam ${daysLeft} hari`, color: daysLeft === 0 ? "text-red-600 font-bold" : "text-green-600", icon: Clock };
    }
    if (today > segmentEnd) { return { text: ksaTotals.persentase >= 100 ? "Pengamatan Selesai" : "Pengamatan Terlambat", color: ksaTotals.persentase >= 100 ? "text-green-600" : "text-amber-600", icon: ksaTotals.persentase >= 100 ? CheckCircle : AlertTriangle }; }
    if (today < segmentStart) {
      const daysUntil = getDiffInDays(today, segmentStart);
      return { text: daysUntil === 1 ? "Pengamatan dimulai besok" : `Pengamatan dimulai dalam ${daysUntil} hari`, color: "text-blue-600", icon: Clock };
    }
    return null;
  }, [jadwalKsa, ksaDisplayMonth, ksaTotals]);
  // --- Akhir dari blok kalkulasi ---

  const sortedKpiCards = React.useMemo(() => {
    const kpiCards = [
      { id: 'padi', percentage: padiTotals?.persentase ?? Infinity, component: <PadiSummaryCard isLoading={isAnythingLoading} error={errorPadi} totals={padiTotals} countdownStatus={countdownStatusPadi} uniqueStatusNames={padiUniqueStatusNames || []} lastUpdate={lastUpdate} selectedYear={selectedYear} /> },
      { id: 'palawija', percentage: palawijaTotals?.persentase ?? Infinity, component: <PalawijaSummaryCard isLoading={isAnythingLoading} error={errorPalawija} totals={palawijaTotals} countdownStatus={countdownStatusPalawija} lastUpdate={lastUpdatePalawija} selectedYear={selectedYear} /> },
      { id: 'ksa', percentage: ksaTotals?.persentase ?? Infinity, component: <KsaSummaryCard isLoading={isAnythingLoading} error={errorKsa} totals={ksaTotals} displayStatus={ksaDisplayStatus} displayMonth={ksaDisplayMonth || ''} uniqueStatusNames={ksaUniqueStatusNames || []} lastUpdate={lastUpdatedKsa} selectedYear={selectedYear} /> },
      { id: 'simtp', percentage: simtpData?.monthly.percentage ?? Infinity, component: <SimtpSummaryCard isLoading={isAnythingLoading} error={errorSimtp} data={simtpData} displayStatus={simtpDisplayStatus} /> }
    ];
    return kpiCards.sort((a, b) => a.percentage - b.percentage);
  }, [padiTotals, palawijaTotals, ksaTotals, simtpData, isAnythingLoading]); // dependensi disederhanakan

  // Bagian 3: Rendering
  return (
    <>
      {isAnythingLoading ? (
        <HomepageSkeleton />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
          {sortedKpiCards.map(card => (
            <React.Fragment key={card.id}>
              {card.component}
            </React.Fragment>
          ))}
        </div>
      )}
      <p className="mt-6 text-gray-500 text-center text-xs">
        Selamat datang di dashboard pemantauan Anda.
      </p>
    </>
  );
}