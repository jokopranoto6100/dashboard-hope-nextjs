/* eslint-disable @typescript-eslint/no-explicit-any */
// Lokasi: src/app/(dashboard)/monitoring/ksa-jagung/ksa-jagung-monitoring-client-page.tsx
"use client";

import React, { useMemo, useState } from 'react';
import { useYear } from '@/context/YearContext';
import { useAuth } from '@/context/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useKsaJagungMonitoringData, ProcessedKsaJagungDistrictData, ProcessedKsaJagungNamaData } from '@/hooks/useKsaJagungMonitoringData';
import { useJadwalData } from "@/hooks/useJadwalData";

import { DistrictKsaJagungTable } from './DistrictKsaJagungTable';
import { NamaKsaJagungTable } from './NamaKsaJagungTable';
import { BeritaAcaraJagungModal, BaJagungData } from './components/BeritaAcaraJagungModal'; 
import { LeaderboardCard } from './LeaderboardCard';

type ViewMode = 'district' | 'nama';

export default function KsaJagungMonitoringClientPage() {
  const { selectedYear } = useYear();
  const { supabase } = useAuth();
  const [currentView, setCurrentView] = useState<ViewMode>('district');
  const [selectedKabupatenDetail, setSelectedKabupatenDetail] = useState<ProcessedKsaJagungDistrictData | null>(null);

  const [isBaModalOpen, setIsBaModalOpen] = useState(false);
  const [baModalData, setBaModalData] = useState<BaJagungData[]>([]);
  const [selectedPetugasForBa, setSelectedPetugasForBa] = useState<ProcessedKsaJagungNamaData | null>(null);
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
    kegiatanId: ksaJagungKegiatanId,
  } = useKsaJagungMonitoringData();

  const { jadwalData, isLoading: isJadwalLoading } = useJadwalData(selectedYear);

  const jadwalKsaJagung = React.useMemo(() => 
    !isJadwalLoading && ksaJagungKegiatanId ? jadwalData.find(k => k.id === ksaJagungKegiatanId) : undefined
  , [jadwalData, isJadwalLoading, ksaJagungKegiatanId]);
  
  const handleMonthChange = (newMonthValue: string) => {
    setDisplayMonth(newMonthValue); 
    setCurrentView('district');
    setSelectedKabupatenDetail(null);
    setSelectedKabupatenCode(null);
  };

  const handleDistrictRowClick = (districtData: ProcessedKsaJagungDistrictData) => {
    setSelectedKabupatenDetail(districtData);
    setSelectedKabupatenCode(districtData.kode_kab);
    setCurrentView('nama');
  };

  const handleBackToDistrictView = () => {
    setCurrentView('district');
    setSelectedKabupatenDetail(null);
    setSelectedKabupatenCode(null);
  };
  
  const handleGenerateBaClick = async (petugasData: ProcessedKsaJagungNamaData) => {
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
      // PERBEDAAN: Panggil RPC untuk berita acara jagung (fallback jika belum ada)
      const { data, error: rpcError } = await supabase.rpc('get_berita_acara_jagung_data', {
        p_tahun: selectedYear,
        p_bulan: parseInt(displayMonth),
        p_kode_kab: selectedKabupatenDetail.kode_kab,
        p_nama_petugas: petugasData.nama
      }).then(result => {
        if (result.error && result.error.code === '42883') {
          // Function tidak ditemukan, fallback ke RPC padi
          console.warn("RPC get_berita_acara_jagung_data belum tersedia, menggunakan fallback");
          return supabase.rpc('get_berita_acara_data', {
            p_tahun: selectedYear,
            p_bulan: parseInt(displayMonth),
            p_kode_kab: selectedKabupatenDetail.kode_kab,
            p_nama_petugas: petugasData.nama
          });
        }
        return result;
      });
      
      if (rpcError) throw rpcError;

      setBaModalData(data || []);
      setIsBaModalOpen(true);
    } catch (err: any) {
      console.error("Gagal memanggil RPC:", err);
      alert(`Gagal mengambil data Berita Acara Jagung: ${err.message}`);
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

  const pageIsLoading = isLoading || isJadwalLoading;

  if (error) { 
    return (
      <div className="min-w-0 flex flex-col gap-4">
        <Alert variant="destructive" className="m-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Memuat Data KSA Jagung</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return ( 
    <div className="min-w-0 flex flex-col gap-4">
      <BeritaAcaraJagungModal
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
              <SelectTrigger className="w-full md:w-[180px]"> 
                <SelectValue placeholder="Pilih Bulan" /> 
              </SelectTrigger>
              <SelectContent>
                {months.map(month => ( 
                  <SelectItem key={month.value} value={month.value}> 
                    {month.label} 
                  </SelectItem> 
                ))}
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

          <DistrictKsaJagungTable
            title="Monitoring KSA Jagung"
            description={!isLoading && lastUpdated ? `Terakhir diperbarui: ${lastUpdated}` : ' '}
            data={districtLevelData || []}
            totals={districtTotals}
            uniqueStatusNames={uniqueStatusNames || []}
            onRowClick={handleDistrictRowClick}
            isLoading={isLoading || !displayMonth}
            jadwal={jadwalKsaJagung}
            displayMonth={displayMonth}
          />
        </>
      )}
      
      {currentView === 'nama' && selectedKabupatenDetail && (
        <NamaKsaJagungTable
          title={`Detail KSA Jagung - ${selectedKabupatenDetail.kabupaten}`}
          description={`Data untuk Tahun ${selectedYear} - Bulan ${selectedMonthLabel}`}
          data={namaLevelData || []}
          totals={namaLevelTotals}
          uniqueStatusNames={uniqueStatusNames || []}
          kabupatenName={selectedKabupatenDetail.kabupaten || ''}
          isLoading={isLoading || isBaLoading}
          onGenerateBaClick={handleGenerateBaClick}
          jadwal={jadwalKsaJagung}
          displayMonth={displayMonth}
        />
      )}
    </div>
  );
}
