// src/app/(dashboard)/monitoring/ubinan/page.tsx
"use client";

import * as React from "react";
import { useYear } from '@/context/YearContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Impor hooks
import { usePadiMonitoringData } from '@/hooks/usePadiMonitoringData';
import { usePalawijaMonitoringData } from '@/hooks/usePalawijaMonitoringData';

// Impor komponen tabel
import { PadiMonitoringTable } from './PadiTable'; 
import { PalawijaMonitoringTable } from './PalawijaTable';

export default function UbinanMonitoringPage() {
  const { selectedYear } = useYear();
  const [selectedSubround, setSelectedSubround] = React.useState<string>('all');

  const { processedPadiData, padiTotals, loadingPadi, errorPadi, lastUpdate } = usePadiMonitoringData(selectedYear, selectedSubround);
  const { processedPalawijaData, palawijaTotals, loadingPalawija, errorPalawija, lastUpdatePalawija } = usePalawijaMonitoringData(selectedYear, selectedSubround);

  return (
    <div className="flex flex-col gap-8 min-w-0">
      {/* ✅ 1. UBAH TATA LETAK FILTER AGAR FLEKSIBEL DAN RESPONSIVE */}
      <div className="flex items-center justify-end flex-wrap gap-2">
        {/*
          - 'flex-wrap' akan membuat item turun baris jika tidak muat.
          - 'gap-2' memberi jarak yang konsisten.
          - Elemen filter Tahun dan Tema Toggle Anda (yang ada di layout.tsx) akan otomatis menyesuaikan diri.
        */}
        <Select value={selectedSubround} onValueChange={setSelectedSubround}>
           {/* ✅ 2. UBAH LEBAR DROPDOWN MENJADI RESPONSIVE */}
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

      <PadiMonitoringTable 
        data={processedPadiData || []}
        totals={padiTotals}
        isLoading={loadingPadi}
        error={errorPadi}
        lastUpdate={lastUpdate}
        selectedYear={selectedYear}
        selectedSubround={selectedSubround}
      />
      
      <PalawijaMonitoringTable
        data={processedPalawijaData || []}
        totals={palawijaTotals}
        isLoading={loadingPalawija}
        error={errorPalawija}
        lastUpdate={lastUpdatePalawija}
        selectedYear={selectedYear}
        selectedSubround={selectedSubround}
      />
    </div>
  );
}