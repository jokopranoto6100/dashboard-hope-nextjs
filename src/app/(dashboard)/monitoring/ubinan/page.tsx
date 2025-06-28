"use client";

import * as React from "react";
import { useYear } from '@/context/YearContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Impor semua hooks yang diperlukan
import { usePadiMonitoringData } from '@/hooks/usePadiMonitoringData';
import { usePalawijaMonitoringData } from '@/hooks/usePalawijaMonitoringData';
import { useJadwalData } from "@/hooks/useJadwalData";

// Impor komponen tabel dan UI lainnya
import { PadiMonitoringTable } from './PadiTable'; 
import { PalawijaMonitoringTable } from './PalawijaTable';
import { Skeleton } from "@/components/ui/skeleton";

export default function UbinanMonitoringPage() {
  const { selectedYear } = useYear();
  const [selectedSubround, setSelectedSubround] = React.useState<string>('all');

  // Ambil data dan ID dari setiap hook
  const { processedPadiData, padiTotals, loadingPadi, errorPadi, lastUpdate, kegiatanId: padiKegiatanId } = usePadiMonitoringData(selectedYear, selectedSubround);
  const { processedPalawijaData, palawijaTotals, loadingPalawija, errorPalawija, lastUpdatePalawija, kegiatanId: palawijaKegiatanId } = usePalawijaMonitoringData(selectedYear, selectedSubround);
  const { jadwalData, isLoading: isJadwalLoading } = useJadwalData(selectedYear);

  // Logika mapping otomatis berdasarkan ID
  const jadwalPadi = React.useMemo(() => 
    !isJadwalLoading && padiKegiatanId ? jadwalData.find(k => k.id === padiKegiatanId) : undefined
  , [jadwalData, isJadwalLoading, padiKegiatanId]);

  const jadwalPalawija = React.useMemo(() => 
    !isJadwalLoading && palawijaKegiatanId ? jadwalData.find(k => k.id === palawijaKegiatanId) : undefined
  , [jadwalData, isJadwalLoading, palawijaKegiatanId]);

  const pageIsLoading = loadingPadi || loadingPalawija || isJadwalLoading;

  return (
    <div className="flex flex-col gap-4 min-w-0">
      <div className="flex items-center justify-end flex-wrap gap-2">
        <Select value={selectedSubround} onValueChange={setSelectedSubround}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Pilih Subround" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Subround</SelectItem>
            <SelectItem value="1">Subround 1</SelectItem>
            <SelectItem value="2">Subround 2</SelectItem>
            <SelectItem value="3">Subround 3</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {pageIsLoading ? (
        <>
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </>
      ) : (
        <>
          <PadiMonitoringTable 
            data={processedPadiData || []}
            totals={padiTotals}
            isLoading={loadingPadi}
            error={errorPadi}
            lastUpdate={lastUpdate}
            selectedYear={selectedYear}
            selectedSubround={selectedSubround}
            jadwal={jadwalPadi} // Prop jadwal diteruskan ke komponen tabel
          />
          
          <PalawijaMonitoringTable
            data={processedPalawijaData || []}
            totals={palawijaTotals}
            isLoading={loadingPalawija}
            error={errorPalawija}
            lastUpdate={lastUpdatePalawija}
            selectedYear={selectedYear}
            selectedSubround={selectedSubround}
            jadwal={jadwalPalawija} // Prop jadwal diteruskan ke komponen tabel
          />
        </>
      )}
    </div>
  );
}