/* eslint-disable @typescript-eslint/no-explicit-any */
// Lokasi: src/app/(dashboard)/monitoring/ksa/ksa-monitoring-client-page.tsx
"use client";

import React, { useMemo, useState } from 'react';
import { useYear } from '@/context/YearContext';
import { useAuth } from '@/context/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, ArrowLeft, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useKsaMonitoringData, ProcessedKsaDistrictData, ProcessedKsaNamaData } from '@/hooks/useKsaMonitoringData';
import { useJadwalData } from "@/hooks/useJadwalData";
import { useCountdown } from "@/hooks/useCountdown";

import { DistrictKsaTable } from './DistrictKsaTable';
import { NamaKsaTable } from './NamaKsaTable';
import { BeritaAcaraModal, BaData } from './components/BeritaAcaraModal'; 
import { LeaderboardCard } from './LeaderboardCard';

// Helper function untuk menghitung selisih hari (dikembalikan secara lokal)
const getDiffInDays = (d1: Date, d2: Date): number => {
  const utc1 = Date.UTC(d1.getFullYear(), d1.getMonth(), d1.getDate());
  const utc2 = Date.UTC(d2.getFullYear(), d2.getMonth(), d2.getDate());
  return Math.round((utc2 - utc1) / (1000 * 60 * 60 * 24));
};

type ViewMode = 'district' | 'nama';

export default function KsaMonitoringClientPage() {
  const { selectedYear } = useYear();
  const { supabase } = useAuth();
  const [currentView, setCurrentView] = useState<ViewMode>('district');
  const [selectedKabupatenDetail, setSelectedKabupatenDetail] = useState<ProcessedKsaDistrictData | null>(null);

  const [isBaModalOpen, setIsBaModalOpen] = useState(false);
  const [baModalData, setBaModalData] = useState<BaData[]>([]);
  const [selectedPetugasForBa, setSelectedPetugasForBa] = useState<ProcessedKsaNamaData | null>(null);
  const [isBaLoading, setIsBaLoading] = useState(false);

  const { 
    districtLevelData,
    districtTotals,
    isLoading, 
    error, 
    lastUpdated,
    uniqueStatusNames,
    namaLevelData,
    namaLevelTotals,
    setSelectedKabupatenCode,
    displayMonth,
    setDisplayMonth,
    leaderboardData,
    kegiatanId: ksaKegiatanId,
  } = useKsaMonitoringData();

  const { jadwalData, isLoading: isJadwalLoading } = useJadwalData(selectedYear);

  const jadwalKsa = React.useMemo(() => 
    !isJadwalLoading && ksaKegiatanId ? jadwalData.find(k => k.id === ksaKegiatanId) : undefined
  , [jadwalData, isJadwalLoading, ksaKegiatanId]);
  
  const handleMonthChange = (newMonthValue: string) => {
    setDisplayMonth(newMonthValue); 
    setCurrentView('district');
    setSelectedKabupatenDetail(null);
    setSelectedKabupatenCode(null);
  };

  const handleDistrictRowClick = (districtData: ProcessedKsaDistrictData) => {
    setSelectedKabupatenDetail(districtData);
    setSelectedKabupatenCode(districtData.kode_kab);
    setCurrentView('nama');
  };

  const handleBackToDistrictView = () => {
    setCurrentView('district');
    setSelectedKabupatenDetail(null);
    setSelectedKabupatenCode(null);
  };
  
  const handleGenerateBaClick = async (petugasData: ProcessedKsaNamaData) => {
    if (!selectedKabupatenDetail?.kode_kab || !displayMonth || !selectedYear) {
      console.error("Gagal memulai Generate BA karena data tidak lengkap:", {
        "selectedKabupatenDetail.kode_kab": selectedKabupatenDetail?.kode_kab,
        "displayMonth": displayMonth,
        "selectedYear": selectedYear
      });
      return;
    }
  
    setIsBaLoading(true);
    setSelectedPetugasForBa(petugasData);  

    try {
      const { data, error: rpcError } = await supabase.rpc('get_berita_acara_data', {
        p_tahun: selectedYear,
        p_bulan: parseInt(displayMonth),
        p_kode_kab: selectedKabupatenDetail.kode_kab,
        p_nama_petugas: petugasData.nama
      });
      
      if (rpcError) throw rpcError;

      setBaModalData(data || []);
      setIsBaModalOpen(true);
    } catch (err: any) {
      console.error("Gagal memanggil RPC:", err);
      alert(`Gagal mengambil data Berita Acara: ${err.message}`);
    } finally {
      setIsBaLoading(false);
    }
  };

  const months = useMemo(() => [
    { value: "1", label: "Januari" }, { value: "2", label: "Februari" }, { value: "3", label: "Maret" }, 
    { value: "4", label: "April" }, { value: "5", label: "Mei" }, { value: "6", label: "Juni" },
    { value: "7", label: "Juli" }, { value: "8", label: "Agustus" }, { value: "9", label: "September" },
    { value: "10", label: "Oktober" }, { value: "11", label: "November" }, { value: "12", label: "Desember" }
  ], []);

  const selectedMonthLabel = useMemo(() => {
    return months.find(m => m.value === displayMonth)?.label || '';
  }, [displayMonth, months]);

  const pageIsLoading = isLoading || isJadwalLoading; // Combine loading states

  if (error) { 
    return (
      <div className="min-w-0 flex flex-col gap-4">
        <Alert variant="destructive" className="m-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Memuat Data</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return ( 
    <div className="min-w-0 flex flex-col gap-4">
      <BeritaAcaraModal
        isOpen={isBaModalOpen}
        onClose={() => setIsBaModalOpen(false)}
        data={baModalData}
        selectedPetugas={{nama: selectedPetugasForBa?.nama || '', kode_kab: selectedKabupatenDetail?.kode_kab || ''}}
        displayMonth={displayMonth}
        selectedYear={selectedYear}
      />
      
      {currentView === 'district' ? (
        <div className="flex flex-wrap items-center justify-end gap-4">
          {pageIsLoading && !displayMonth ? (
             <Skeleton className="h-10 w-full md:w-[180px]" />
          ) : (
            <Select onValueChange={handleMonthChange} value={displayMonth}>
              <SelectTrigger className="w-full md:w-[180px]"> <SelectValue placeholder="Pilih Bulan" /> </SelectTrigger>
              <SelectContent>
                {months.map(month => ( <SelectItem key={month.value} value={month.value}> {month.label} </SelectItem> ))}
              </SelectContent>
            </Select>
          )}
          
        </div>
      ) : (
        <div>
            <Button variant="outline" onClick={handleBackToDistrictView}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar Kabupaten
            </Button>
        </div>
      )}

      {currentView === 'district' && (
        <>
          <LeaderboardCard 
            data={leaderboardData} 
            isLoading={isLoading || !displayMonth}
            monthName={selectedMonthLabel}
            year={selectedYear || new Date().getFullYear()}
          />

          <DistrictKsaTable
            title="Monitoring KSA Padi"
            description={!isLoading && lastUpdated ? `Terakhir diperbarui: ${lastUpdated}` : ' '}
            data={districtLevelData || []}
            totals={districtTotals}
            uniqueStatusNames={uniqueStatusNames || []}
            onRowClick={handleDistrictRowClick}
            isLoading={isLoading || !displayMonth}
            jadwal={jadwalKsa}
            displayMonth={displayMonth}
          />
        </>
      )}
      
      {currentView === 'nama' && selectedKabupatenDetail && (
        <NamaKsaTable
          title={`Detail KSA Padi - ${selectedKabupatenDetail.kabupaten}`}
          description={`Data untuk Tahun ${selectedYear} - Bulan ${selectedMonthLabel}`}
          data={namaLevelData || []}
          totals={namaLevelTotals}
          uniqueStatusNames={uniqueStatusNames || []}
          kabupatenName={selectedKabupatenDetail.kabupaten || ''}
          isLoading={isLoading || isBaLoading}
          onGenerateBaClick={handleGenerateBaClick}
          jadwal={jadwalKsa}
          displayMonth={displayMonth}
        />
      )}
    </div>
  );
}