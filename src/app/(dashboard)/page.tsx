"use client";

import * as React from "react";
import { useYear } from '@/context/YearContext';

// Import hooks
import { useJadwalData } from "@/hooks/useJadwalData";
import { usePadiMonitoringData } from '@/hooks/usePadiMonitoringData';
import { usePalawijaMonitoringData } from '@/hooks/usePalawijaMonitoringData';
import { useKsaMonitoringData } from "@/hooks/useKsaMonitoringData";
import { useSimtpKpiData } from "@/hooks/useSimtpKpiData";
import { useCountdown } from "@/hooks/useCountdown"; // Import useCountdown

// Import komponen-komponen modular dan UI
import { PadiSummaryCard } from "@/app/(dashboard)/_components/homepage/PadiSummaryCard";
import { PalawijaSummaryCard } from "@/app/(dashboard)/_components/homepage/PalawijaSummaryCard";
import { KsaSummaryCard } from "@/app/(dashboard)/_components/homepage/KsaSummaryCard";
import { SimtpSummaryCard } from "@/app/(dashboard)/_components/homepage/SimtpSummaryCard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Import tipe data dan ikon
import { Clock, CheckCircle, AlertTriangle } from "lucide-react";

// Komponen Skeleton untuk seluruh halaman
const HomepageSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
    {Array.from({ length: 6 }).map((_, index) => ( // ✅ Ubah dari 4 menjadi 6
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

// ✅ TAMBAHKAN: Komponen dummy card untuk kegiatan lainnya
const KegiatanLainnyaCard = ({ title }: { title: string }) => (
  <Card className="border-dashed border-2 border-gray-200 bg-gray-50/50">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="text-sm font-medium text-gray-500">{title}</div>
      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
        <Clock className="h-4 w-4 text-gray-400" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="mt-4 space-y-2">
        <div className="text-2xl font-bold text-gray-400">---</div>
        <div className="text-xs text-gray-400">Belum tersedia</div>
        <div className="text-xs text-gray-400">Data akan ditambahkan kemudian</div>
        <div className="flex items-center text-xs text-gray-400">
          <Clock className="mr-1 h-3 w-3" />
          Dalam pengembangan
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

  // Gabungkan semua status loading menjadi satu
  const isAnythingLoading = loadingPadi || loadingPalawija || loadingKsa || loadingSimtp || isJadwalLoading;

  // Bagian 2: Kalkulasi & Memoization
  const jadwalPadi = React.useMemo(() => !isJadwalLoading && padiKegiatanId ? jadwalData.find(k => k.id === padiKegiatanId) : undefined, [jadwalData, isJadwalLoading, padiKegiatanId]);
  const jadwalPalawija = React.useMemo(() => !isJadwalLoading && palawijaKegiatanId ? jadwalData.find(k => k.id === palawijaKegiatanId) : undefined, [jadwalData, isJadwalLoading, palawijaKegiatanId]);
  const jadwalSimtp = React.useMemo(() => !isJadwalLoading && simtpKegiatanId ? jadwalData.find(k => k.id === simtpKegiatanId) : undefined, [jadwalData, isJadwalLoading, simtpKegiatanId]);
  const jadwalKsa = React.useMemo(() => !isJadwalLoading && ksaKegiatanId ? jadwalData.find(k => k.id === ksaKegiatanId) : undefined, [jadwalData, isJadwalLoading, ksaKegiatanId]);

  // Gunakan useCountdown hook secara tidak kondisional di tingkat atas komponen
  const countdownStatusPadi = useCountdown(jadwalPadi);
  const countdownStatusPalawija = useCountdown(jadwalPalawija);
  const countdownStatusSimtp = useCountdown(jadwalSimtp);
  const countdownStatusKsa = useCountdown(jadwalKsa);

  const simtpDisplayStatus = React.useMemo(() => {
      if (!jadwalSimtp || !simtpData) return null;
      
      const allJadwalItems = [...(jadwalSimtp.jadwal || []), ...(jadwalSimtp.subKegiatan?.flatMap(sub => sub.jadwal || []) || [])].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
      if (allJadwalItems.length === 0) return null;

      const today = new Date(); 
      today.setHours(0, 0, 0, 0);

      const currentOrNextSegment = allJadwalItems.find(item => {
          const itemEnd = new Date(item.endDate);
          itemEnd.setHours(0, 0, 0, 0); 
          return today <= itemEnd;
      });

      if (!currentOrNextSegment) { 
          return { line1: { text: `Status Laporan: ${simtpData.monthly.percentage >= 100 ? 'Selesai' : 'Terlambat'}`, color: "text-gray-500", icon: CheckCircle } }; 
      }

      const segmentStart = new Date(currentOrNextSegment.startDate);
      segmentStart.setHours(0, 0, 0, 0); 

      const segmentEnd = new Date(currentOrNextSegment.endDate);
      segmentEnd.setHours(0, 0, 0, 0);

      // Gunakan hasil dari useCountdown yang sudah dipanggil di atas
      if (countdownStatusSimtp) {
        if (today >= segmentStart && today <= segmentEnd) {
          return { line1: { text: `Laporan ${segmentStart.toLocaleString('id-ID', { month: 'long' })} ${countdownStatusSimtp.text.toLowerCase()}`, color: countdownStatusSimtp.color, icon: countdownStatusSimtp.icon } };
        }
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

    // Gunakan hasil dari useCountdown yang sudah dipanggil di atas
    if (countdownStatusKsa) {
      if (today >= segmentStart && today <= segmentEnd) {
        return { text: `Pengamatan ${countdownStatusKsa.text.toLowerCase()}`, color: countdownStatusKsa.color, icon: countdownStatusKsa.icon };
      }
      if (today > segmentEnd) { return { text: ksaTotals.persentase >= 100 ? "Pengamatan Selesai" : "Pengamatan Terlambat", color: ksaTotals.persentase >= 100 ? "text-green-600" : "text-amber-600", icon: ksaTotals.persentase >= 100 ? CheckCircle : AlertTriangle }; }
      if (today < segmentStart) {
        return { text: `Pengamatan ${countdownStatusKsa.text.toLowerCase()}`, color: countdownStatusKsa.color, icon: countdownStatusKsa.icon };
      }
    }
    return null;
  }, [jadwalKsa, ksaDisplayMonth, ksaTotals, countdownStatusKsa]);
  // --- Akhir dari blok kalkulasi ---

  const sortedKpiCards = React.useMemo(() => {
    const kpiCards = [
      { id: 'padi', percentage: padiTotals?.persentase ?? Infinity, component: <PadiSummaryCard isLoading={isAnythingLoading} error={errorPadi} totals={padiTotals} countdownStatus={countdownStatusPadi} uniqueStatusNames={padiUniqueStatusNames || []} lastUpdate={lastUpdate} selectedYear={selectedYear} /> },
      { id: 'palawija', percentage: palawijaTotals?.persentase ?? Infinity, component: <PalawijaSummaryCard isLoading={isAnythingLoading} error={errorPalawija} totals={palawijaTotals} countdownStatus={countdownStatusPalawija} lastUpdate={lastUpdatePalawija} selectedYear={selectedYear} /> },
      { id: 'ksa', percentage: ksaTotals?.persentase ?? Infinity, component: <KsaSummaryCard isLoading={isAnythingLoading} error={errorKsa} totals={ksaTotals} displayStatus={ksaDisplayStatus} displayMonth={ksaDisplayMonth || ''} uniqueStatusNames={ksaUniqueStatusNames || []} lastUpdate={lastUpdatedKsa} selectedYear={selectedYear} /> },
      { id: 'simtp', percentage: simtpData?.monthly.percentage ?? Infinity, component: <SimtpSummaryCard isLoading={isAnythingLoading} error={errorSimtp} data={simtpData} displayStatus={simtpDisplayStatus} /> },
      // ✅ TAMBAHKAN: 2 dummy cards untuk kegiatan lainnya
      { id: 'kegiatan1', percentage: Infinity, component: <KegiatanLainnyaCard title="Kegiatan Lainnya 1" /> },
      { id: 'kegiatan2', percentage: Infinity, component: <KegiatanLainnyaCard title="Kegiatan Lainnya 2" /> }
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