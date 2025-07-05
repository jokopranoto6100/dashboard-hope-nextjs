"use client";

import * as React from "react";
import { useYear } from '@/context/YearContext';

// Import hooks
import { useJadwalData } from "@/hooks/useJadwalData";
import { usePadiMonitoringData } from '@/hooks/usePadiMonitoringData';
import { usePalawijaMonitoringData } from '@/hooks/usePalawijaMonitoringData';
import { useKsaMonitoringData } from "@/hooks/useKsaMonitoringData";
import { useSimtpKpiData } from "@/hooks/useSimtpKpiData";
import { useCountdown } from "@/hooks/useCountdown";

// Import komponen-komponen modular dan UI
import { PadiSummaryCard } from "@/app/(dashboard)/_components/homepage/PadiSummaryCard";
import { PalawijaSummaryCard } from "@/app/(dashboard)/_components/homepage/PalawijaSummaryCard";
import { KsaSummaryCard } from "@/app/(dashboard)/_components/homepage/KsaSummaryCard";
import { SimtpSummaryCard } from "@/app/(dashboard)/_components/homepage/SimtpSummaryCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Import tipe data dan ikon
import { Clock, CheckCircle, AlertTriangle } from "lucide-react";

// Komponen Skeleton untuk seluruh halaman
const HomepageSkeleton = () => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: 6 }).map((_, index) => (
      <Card key={index} className="p-6">
        <Skeleton className="h-5 w-3/5 mb-4" />
        <Skeleton className="h-8 w-1/2 mb-2" />
        <Skeleton className="h-4 w-full" />
        <div className="mt-6 pt-4 border-t">
          <Skeleton className="h-4 w-1/3" />
        </div>
      </Card>
    ))}
  </div>
);

// Komponen dummy card untuk kegiatan lainnya
const KegiatanLainnyaCard = ({ title, isHighlighted }: { title: string, isHighlighted?: boolean }) => (
    <Card className={`border-dashed bg-muted/50 h-full ${isHighlighted ? 'border-2 border-amber-500 shadow-lg' : 'border'}`}>
    <CardHeader>
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-center h-full py-8">
        <div className="text-center text-muted-foreground">
          <Clock className="mx-auto h-6 w-6 mb-2" />
          <p className="text-sm">Belum Tersedia</p>
          <p className="text-xs">Dalam Pengembangan</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function HomePage() {
  const { selectedYear } = useYear();
  const ubinanSubround = 'all';

  // Bagian 1: Pengambilan Data
  const { padiTotals, loadingPadi, errorPadi, lastUpdate, uniqueStatusNames: padiUniqueStatusNames, kegiatanId: padiKegiatanId } = usePadiMonitoringData(selectedYear, ubinanSubround);
  const { palawijaTotals, loadingPalawija, errorPalawija, lastUpdatePalawija, kegiatanId: palawijaKegiatanId } = usePalawijaMonitoringData(selectedYear, ubinanSubround);
  const { districtTotals: ksaTotals, isLoading: loadingKsa, error: errorKsa, lastUpdated: lastUpdatedKsa, displayMonth: ksaDisplayMonth, uniqueStatusNames: ksaUniqueStatusNames, kegiatanId: ksaKegiatanId } = useKsaMonitoringData();
  const { data: simtpData, isLoading: loadingSimtp, error: errorSimtp, kegiatanId: simtpKegiatanId } = useSimtpKpiData();
  const { jadwalData, isLoading: isJadwalLoading } = useJadwalData(selectedYear);

  const isAnythingLoading = loadingPadi || loadingPalawija || loadingKsa || loadingSimtp || isJadwalLoading;

  // Bagian 2: Kalkulasi & Memoization
  const jadwalPadi = React.useMemo(() => !isJadwalLoading && padiKegiatanId ? jadwalData.find(k => k.id === padiKegiatanId) : undefined, [jadwalData, isJadwalLoading, padiKegiatanId]);
  const jadwalPalawija = React.useMemo(() => !isJadwalLoading && palawijaKegiatanId ? jadwalData.find(k => k.id === palawijaKegiatanId) : undefined, [jadwalData, isJadwalLoading, palawijaKegiatanId]);
  const jadwalSimtp = React.useMemo(() => !isJadwalLoading && simtpKegiatanId ? jadwalData.find(k => k.id === simtpKegiatanId) : undefined, [jadwalData, isJadwalLoading, simtpKegiatanId]);
  const jadwalKsa = React.useMemo(() => !isJadwalLoading && ksaKegiatanId ? jadwalData.find(k => k.id === ksaKegiatanId) : undefined, [jadwalData, isJadwalLoading, ksaKegiatanId]);

  const countdownStatusPadi = useCountdown(jadwalPadi);
  const countdownStatusPalawija = useCountdown(jadwalPalawija);
  const countdownStatusSimtp = useCountdown(jadwalSimtp);
  const countdownStatusKsa = useCountdown(jadwalKsa);

  const simtpDisplayStatus = React.useMemo(() => {
      if (!jadwalSimtp || !simtpData) return null;
      const allJadwalItems = [...(jadwalSimtp.jadwal || []), ...(jadwalSimtp.subKegiatan?.flatMap(sub => sub.jadwal || []) || [])].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      if (allJadwalItems.length === 0) return null;
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const currentOrNextSegment = allJadwalItems.find(item => new Date(item.endDate) >= today);
      if (!currentOrNextSegment) return { line1: { text: `Status Laporan: ${simtpData.monthly.percentage >= 100 ? 'Selesai' : 'Terlambat'}`, color: "text-gray-500", icon: CheckCircle } };
      const segmentStart = new Date(currentOrNextSegment.startDate);
      const segmentEnd = new Date(currentOrNextSegment.endDate);
      if (countdownStatusSimtp) {
        if (today >= segmentStart && today <= segmentEnd) return { line1: { text: `Laporan ${segmentStart.toLocaleString('id-ID', { month: 'long' })} ${countdownStatusSimtp.text.toLowerCase()}`, color: countdownStatusSimtp.color, icon: countdownStatusSimtp.icon } };
        if (today < segmentStart) {
          const kpiProgress = simtpData.monthly.percentage;
          return {
            line1: { text: kpiProgress >= 100 ? `Laporan ${simtpData.monthly.reportForMonthName}: Selesai` : `Laporan ${simtpData.monthly.reportForMonthName}: Terlambat`, color: kpiProgress >= 100 ? "text-green-600" : "text-amber-600", icon: kpiProgress >= 100 ? CheckCircle : AlertTriangle },
            line2: { text: `Periode berikutnya ${countdownStatusSimtp.text.toLowerCase()}`, color: countdownStatusSimtp.color, icon: countdownStatusSimtp.icon }
          };
        }
      }
      return null;
  }, [jadwalSimtp, simtpData, countdownStatusSimtp]);
  
  const ksaDisplayStatus = React.useMemo(() => {
    if (!jadwalKsa || !ksaDisplayMonth || !ksaTotals) return null;
    const allJadwalItems = [...(jadwalKsa.jadwal || []), ...(jadwalKsa.subKegiatan?.flatMap(sub => sub.jadwal || []) || [])].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    if (allJadwalItems.length === 0) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const currentKsaSegment = allJadwalItems.find(item => new Date(item.startDate).getMonth() === (parseInt(ksaDisplayMonth, 10) - 1));
    if (!currentKsaSegment) return null;
    const segmentStart = new Date(currentKsaSegment.startDate);
    const segmentEnd = new Date(currentKsaSegment.endDate);
    if (countdownStatusKsa) {
      if (today >= segmentStart && today <= segmentEnd) return { text: `Pengamatan ${countdownStatusKsa.text.toLowerCase()}`, color: countdownStatusKsa.color, icon: countdownStatusKsa.icon };
      if (today > segmentEnd) return { text: ksaTotals.persentase >= 100 ? "Pengamatan Selesai" : "Pengamatan Terlambat", color: ksaTotals.persentase >= 100 ? "text-green-600" : "text-amber-600", icon: ksaTotals.persentase >= 100 ? CheckCircle : AlertTriangle };
      if (today < segmentStart) return { text: `Pengamatan ${countdownStatusKsa.text.toLowerCase()}`, color: countdownStatusKsa.color, icon: countdownStatusKsa.icon };
    }
    return null;
  }, [jadwalKsa, ksaDisplayMonth, ksaTotals, countdownStatusKsa]);

  const sortedKpiCards = React.useMemo(() => {
    const kpiCards = [
      { id: 'padi', percentage: padiTotals?.persentase },
      { id: 'palawija', percentage: palawijaTotals?.persentase },
      { id: 'ksa', percentage: ksaTotals?.persentase },
      { id: 'simtp', percentage: simtpData?.monthly.percentage },
      { id: 'kegiatan1', percentage: Infinity },
      { id: 'kegiatan2', percentage: Infinity }
    ];
    
    return kpiCards.sort((a, b) => {
        const aValue = a.percentage ?? 101;
        const bValue = b.percentage ?? 101;
        return aValue - bValue;
    });
  }, [padiTotals, palawijaTotals, ksaTotals, simtpData]);

  // Bagian 3: Rendering
  return (
    <>
      {isAnythingLoading ? (
        <HomepageSkeleton />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
          {sortedKpiCards.map((card, index) => {
            const isHighlighted = index === 0;
            if (card.id === 'padi') {
              return <PadiSummaryCard key={card.id} isLoading={isAnythingLoading} error={errorPadi} totals={padiTotals} countdownStatus={countdownStatusPadi} uniqueStatusNames={padiUniqueStatusNames || []} lastUpdate={lastUpdate} selectedYear={selectedYear} isHighlighted={isHighlighted} />
            }
            if (card.id === 'palawija') {
              return <PalawijaSummaryCard key={card.id} isLoading={isAnythingLoading} error={errorPalawija} totals={palawijaTotals} countdownStatus={countdownStatusPalawija} lastUpdate={lastUpdatePalawija} selectedYear={selectedYear} isHighlighted={isHighlighted} />
            }
            if (card.id === 'ksa') {
              return <KsaSummaryCard key={card.id} isLoading={isAnythingLoading} error={errorKsa} totals={ksaTotals} displayStatus={ksaDisplayStatus} displayMonth={ksaDisplayMonth || ''} uniqueStatusNames={ksaUniqueStatusNames || []} lastUpdate={lastUpdatedKsa} selectedYear={selectedYear} isHighlighted={isHighlighted} />
            }
            if (card.id === 'simtp') {
              return <SimtpSummaryCard key={card.id} isLoading={isAnythingLoading} error={errorSimtp} data={simtpData} displayStatus={simtpDisplayStatus} isHighlighted={isHighlighted} />
            }
            if (card.id === 'kegiatan1') {
              return <KegiatanLainnyaCard key={card.id} title="Kegiatan Lainnya 1" isHighlighted={isHighlighted} />
            }
            if (card.id === 'kegiatan2') {
              return <KegiatanLainnyaCard key={card.id} title="Kegiatan Lainnya 2" isHighlighted={isHighlighted} />
            }
            return null;
          })}
        </div>
      )}
      <p className="mt-6 text-gray-500 text-center text-xs">
        Welcome to your Hope.
      </p>
    </>
  );
}