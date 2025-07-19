"use client";

import * as React from "react";
import { useYear } from '@/context/YearContext';

// Import hooks
import { useJadwalData } from "@/hooks/useJadwalData";
import { usePadiMonitoringData } from '@/hooks/usePadiMonitoringData';
import { usePalawijaMonitoringData } from '@/hooks/usePalawijaMonitoringData';
import { useKsaMonitoringData } from "@/hooks/useKsaMonitoringData";
import { useKsaJagungMonitoringData } from "@/hooks/useKsaJagungMonitoringData";
import { useSimtpKpiData } from "@/hooks/useSimtpKpiData";
import { useCountdown } from "@/hooks/useCountdown";

// Import komponen-komponen modular dan UI
import { PadiSummaryCard } from "@/app/(dashboard)/_components/homepage/PadiSummaryCard";
import { PalawijaSummaryCard } from "@/app/(dashboard)/_components/homepage/PalawijaSummaryCard";
import { KsaSummaryCard } from "@/app/(dashboard)/_components/homepage/KsaSummaryCard";
import { KsaJagungSummaryCard } from "@/app/(dashboard)/_components/homepage/KsaJagungSummaryCard";
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

// Komponen dummy card untuk kegiatan lainnya dengan warna custom (flat design)
const KegiatanLainnyaCard = ({ title, isHighlighted }: { title: string, isHighlighted?: boolean }) => (
    <Card className={`
      border-dashed 
      transition-all duration-300 
      hover:shadow-lg 
      hover:scale-105
      h-full 
      ${isHighlighted ? 'border-2 shadow-lg ring-2' : 'border-2'}
    `}
    style={{
      backgroundColor: isHighlighted 
        ? 'rgba(249, 125, 131, 0.1)'
        : 'rgba(117, 72, 66, 0.08)',
      borderColor: isHighlighted ? '#f97d83' : '#754842',
      ...(isHighlighted && { '--tw-ring-color': '#f97d83' })
    }}
    >
    <CardHeader>
      <CardTitle className="text-sm font-medium" style={{ color: isHighlighted ? '#881337' : '#44403c' }}>
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex items-center justify-center h-full py-8">
        <div className="text-center">
          <Clock 
            className="mx-auto h-6 w-6 mb-2" 
            style={{ color: isHighlighted ? '#f97d83' : '#754842' }}
          />
          <p className="text-sm font-medium" style={{ color: isHighlighted ? '#881337' : '#44403c' }}>
            Belum Tersedia
          </p>
          <p className="text-xs" style={{ color: isHighlighted ? '#be185d' : '#78716c' }}>
            Dalam Pengembangan
          </p>
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
  const { districtTotals: ksaJagungTotals, isLoading: loadingKsaJagung, error: errorKsaJagung, lastUpdated: lastUpdatedKsaJagung, displayMonth: ksaJagungDisplayMonth, uniqueStatusNames: ksaJagungUniqueStatusNames, kegiatanId: ksaJagungKegiatanId } = useKsaJagungMonitoringData();
  const { data: simtpData, isLoading: loadingSimtp, error: errorSimtp, kegiatanId: simtpKegiatanId } = useSimtpKpiData();
  const { jadwalData, isLoading: isJadwalLoading } = useJadwalData(selectedYear);

  const isAnythingLoading = loadingPadi || loadingPalawija || loadingKsa || loadingKsaJagung || loadingSimtp || isJadwalLoading;

  // Bagian 2: Kalkulasi & Memoization
  const jadwalPadi = React.useMemo(() => !isJadwalLoading && padiKegiatanId ? jadwalData.find(k => k.id === padiKegiatanId) : undefined, [jadwalData, isJadwalLoading, padiKegiatanId]);
  const jadwalPalawija = React.useMemo(() => !isJadwalLoading && palawijaKegiatanId ? jadwalData.find(k => k.id === palawijaKegiatanId) : undefined, [jadwalData, isJadwalLoading, palawijaKegiatanId]);
  const jadwalSimtp = React.useMemo(() => !isJadwalLoading && simtpKegiatanId ? jadwalData.find(k => k.id === simtpKegiatanId) : undefined, [jadwalData, isJadwalLoading, simtpKegiatanId]);
  const jadwalKsa = React.useMemo(() => !isJadwalLoading && ksaKegiatanId ? jadwalData.find(k => k.id === ksaKegiatanId) : undefined, [jadwalData, isJadwalLoading, ksaKegiatanId]);
  const jadwalKsaJagung = React.useMemo(() => !isJadwalLoading && ksaJagungKegiatanId ? jadwalData.find(k => k.id === ksaJagungKegiatanId) : undefined, [jadwalData, isJadwalLoading, ksaJagungKegiatanId]);

  const countdownStatusPadi = useCountdown(jadwalPadi);
  const countdownStatusPalawija = useCountdown(jadwalPalawija);
  const countdownStatusSimtp = useCountdown(jadwalSimtp);
  const countdownStatusKsa = useCountdown(jadwalKsa);
  const countdownStatusKsaJagung = useCountdown(jadwalKsaJagung);

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
  
  const ksaJagungDisplayStatus = React.useMemo(() => {
    if (!jadwalKsaJagung || !ksaJagungDisplayMonth || !ksaJagungTotals) return null;
    const allJadwalItems = [...(jadwalKsaJagung.jadwal || []), ...(jadwalKsaJagung.subKegiatan?.flatMap(sub => sub.jadwal || []) || [])].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    if (allJadwalItems.length === 0) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const currentKsaJagungSegment = allJadwalItems.find(item => new Date(item.startDate).getMonth() === (parseInt(ksaJagungDisplayMonth, 10) - 1));
    if (!currentKsaJagungSegment) return null;
    const segmentStart = new Date(currentKsaJagungSegment.startDate);
    const segmentEnd = new Date(currentKsaJagungSegment.endDate);
    if (countdownStatusKsaJagung) {
      if (today >= segmentStart && today <= segmentEnd) return { text: `Pengamatan ${countdownStatusKsaJagung.text.toLowerCase()}`, color: countdownStatusKsaJagung.color, icon: countdownStatusKsaJagung.icon };
      if (today > segmentEnd) return { text: ksaJagungTotals.persentase >= 100 ? "Pengamatan Selesai" : "Pengamatan Terlambat", color: ksaJagungTotals.persentase >= 100 ? "text-green-600" : "text-amber-600", icon: ksaJagungTotals.persentase >= 100 ? CheckCircle : AlertTriangle };
      if (today < segmentStart) return { text: `Pengamatan ${countdownStatusKsaJagung.text.toLowerCase()}`, color: countdownStatusKsaJagung.color, icon: countdownStatusKsaJagung.icon };
    }
    return null;
  }, [jadwalKsaJagung, ksaJagungDisplayMonth, ksaJagungTotals, countdownStatusKsaJagung]);

  const sortedKpiCards = React.useMemo(() => {
    const kpiCards = [
      { id: 'padi', percentage: padiTotals?.persentase },
      { id: 'palawija', percentage: palawijaTotals?.persentase },
      { id: 'ksa', percentage: ksaTotals?.persentase },
      { id: 'ksa-jagung', percentage: ksaJagungTotals?.persentase },
      { id: 'simtp', percentage: simtpData?.monthly.percentage },
      { id: 'kegiatan1', percentage: Infinity },
      { id: 'kegiatan2', percentage: Infinity }
    ];
    
    return kpiCards.sort((a, b) => {
        const aValue = a.percentage ?? 101;
        const bValue = b.percentage ?? 101;
        return aValue - bValue;
    });
  }, [padiTotals, palawijaTotals, ksaTotals, ksaJagungTotals, simtpData]);

  // Bagian 3: Rendering
  return (
    <div className="space-y-6">
      {/* Enhanced Header dengan desain modern dan konsisten dengan halaman lainnya */}
      <div 
        className="relative overflow-hidden rounded-xl p-6 text-white shadow-xl"
        style={{
          background: 'linear-gradient(135deg, rgb(137, 132, 216) 0%, rgb(120, 115, 200) 50%, rgb(100, 95, 180) 100%)'
        }}
      >
        {/* Background pattern dengan dark mode adaptif */}
        <div className="absolute inset-0 bg-black/10 dark:bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent dark:from-white/3 dark:to-transparent" />
        
        {/* Decorative circles dengan dark mode adaptif */}
        <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10 dark:bg-white/5 blur-xl" />
        <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-white/5 dark:bg-white/3 blur-2xl" />
        
        <div className="relative flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-center">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 dark:bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5v4" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v4" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 5v4" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard Statistik Produksi</h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-1 w-12 bg-white/60 dark:bg-white/50 rounded-full" />
                  <div className="h-1 w-8 bg-white/40 dark:bg-white/30 rounded-full" />
                  <div className="h-1 w-4 bg-white/20 dark:bg-white/15 rounded-full" />
                </div>
              </div>
            </div>
            <p className="text-white/90 dark:text-white/85 text-lg font-medium flex items-center gap-2">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Monitoring kegiatan survei fungsi produksi tahun <span className="font-bold bg-white/20 dark:bg-white/15 px-2 py-1 rounded-lg text-white">{selectedYear}</span>
            </p>
          </div>
        </div>
      </div>

      {isAnythingLoading ? (
        <HomepageSkeleton />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr mb-6">
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
            if (card.id === 'ksa-jagung') {
              return <KsaJagungSummaryCard key={card.id} isLoading={isAnythingLoading} error={errorKsaJagung} totals={ksaJagungTotals} displayStatus={ksaJagungDisplayStatus} displayMonth={ksaJagungDisplayMonth || ''} uniqueStatusNames={ksaJagungUniqueStatusNames || []} lastUpdate={lastUpdatedKsaJagung} selectedYear={selectedYear} isHighlighted={isHighlighted} />
            }
            if (card.id === 'simtp') {
              return <SimtpSummaryCard key={card.id} isLoading={isAnythingLoading} error={errorSimtp} data={simtpData} displayStatus={simtpDisplayStatus} selectedYear={selectedYear} isHighlighted={isHighlighted} />
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
      <div className="mt-8 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          🌾 Welcome to your <span className="font-semibold text-blue-600">Hope</span> Dashboard
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Membangun pertanian Indonesia yang lebih baik
        </p>
      </div>
    </div>
  );
}