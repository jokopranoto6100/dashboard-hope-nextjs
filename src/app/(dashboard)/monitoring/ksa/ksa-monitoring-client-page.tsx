/* eslint-disable @typescript-eslint/no-explicit-any */
// Lokasi: src/app/(dashboard)/monitoring/ksa/ksa-monitoring-client-page.tsx
"use client";

import React, { useMemo, useState } from 'react';
import { useYear } from '@/context/YearContext';
import { useAuth } from '@/context/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useKsaMonitoringData, ProcessedKsaDistrictData, ProcessedKsaNamaData } from '@/hooks/useKsaMonitoringData';
import { useKsaJagungMonitoringData, ProcessedKsaJagungDistrictData, ProcessedKsaJagungNamaData } from '@/hooks/useKsaJagungMonitoringData';
import { useJadwalData } from "@/hooks/useJadwalData";

import { DistrictKsaTable } from './padi/DistrictKsaTable';
import { NamaKsaTable } from './padi/NamaKsaTable';
import { BeritaAcaraModal, BaData } from './padi/components/BeritaAcaraModal'; 
import { LeaderboardCard } from './padi/LeaderboardCard';

// Import komponen KSA Jagung
import { DistrictKsaJagungTable } from './jagung/DistrictKsaJagungTable';
import { NamaKsaJagungTable } from './jagung/NamaKsaJagungTable';
import { BeritaAcaraJagungModal, BaJagungData } from './jagung/components/BeritaAcaraJagungModal';
import { LeaderboardCard as LeaderboardJagungCard } from './jagung/LeaderboardCard';

type ViewMode = 'district' | 'nama';
type KsaType = 'padi' | 'jagung';

export default function KsaMonitoringClientPage() {
  const { selectedYear } = useYear();
  const { supabase } = useAuth();
  const [currentView, setCurrentView] = useState<ViewMode>('district');
  const [selectedKabupatenDetail, setSelectedKabupatenDetail] = useState<ProcessedKsaDistrictData | null>(null);
  const [selectedJagungKabupatenDetail, setSelectedJagungKabupatenDetail] = useState<ProcessedKsaJagungDistrictData | null>(null);
  const [currentKsaType, setCurrentKsaType] = useState<KsaType>('padi');

  const [isBaModalOpen, setIsBaModalOpen] = useState(false);
  const [baModalData, setBaModalData] = useState<BaData[]>([]);
  const [selectedPetugasForBa, setSelectedPetugasForBa] = useState<ProcessedKsaNamaData | null>(null);
  const [isBaLoading, setIsBaLoading] = useState(false);

  // KSA Jagung BA states
  const [isBaJagungModalOpen, setIsBaJagungModalOpen] = useState(false);
  const [baJagungModalData, setBaJagungModalData] = useState<BaJagungData[]>([]);
  const [selectedJagungPetugasForBa, setSelectedJagungPetugasForBa] = useState<ProcessedKsaJagungNamaData | null>(null);
  const [isBaJagungLoading, setIsBaJagungLoading] = useState(false);

  // KSA Padi data
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

  // KSA Jagung data
  const { 
    districtLevelData: jagungDistrictLevelData,
    districtTotals: jagungDistrictTotals,
    isLoading: jagungIsLoading, 
    error: jagungError, 
    lastUpdated: jagungLastUpdated,
    uniqueStatusNames: jagungUniqueStatusNames,
    namaLevelData: jagungNamaLevelData,
    namaLevelTotals: jagungNamaLevelTotals,
    setSelectedKabupatenCode: setJagungSelectedKabupatenCode,
    displayMonth: jagungDisplayMonth,
    setDisplayMonth: setJagungDisplayMonth,
    leaderboardData: jagungLeaderboardData,
  } = useKsaJagungMonitoringData();

  const { jadwalData, isLoading: isJadwalLoading } = useJadwalData(selectedYear);

  const jadwalKsa = React.useMemo(() => 
    !isJadwalLoading && ksaKegiatanId ? jadwalData.find(k => k.id === ksaKegiatanId) : undefined
  , [jadwalData, isJadwalLoading, ksaKegiatanId]);
  
  const handleMonthChange = (newMonthValue: string) => {
    setDisplayMonth(newMonthValue); 
    setJagungDisplayMonth(newMonthValue); // Sync both months
    setCurrentView('district');
    setSelectedKabupatenDetail(null);
    setSelectedJagungKabupatenDetail(null);
    setSelectedKabupatenCode(null);
    setJagungSelectedKabupatenCode(null);
  };

  const handleDistrictRowClick = (districtData: ProcessedKsaDistrictData) => {
    setSelectedKabupatenDetail(districtData);
    setSelectedKabupatenCode(districtData.kode_kab);
    setCurrentView('nama');
    setCurrentKsaType('padi');
  };

  const handleJagungDistrictRowClick = (districtData: ProcessedKsaJagungDistrictData) => {
    setSelectedJagungKabupatenDetail(districtData);
    setJagungSelectedKabupatenCode(districtData.kode_kab);
    setCurrentView('nama');
    setCurrentKsaType('jagung');
  };

  const handleBackToDistrictView = () => {
    setCurrentView('district');
    setSelectedKabupatenDetail(null);
    setSelectedJagungKabupatenDetail(null);
    setSelectedKabupatenCode(null);
    setJagungSelectedKabupatenCode(null);
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

  const handleGenerateJagungBaClick = async (petugasData: ProcessedKsaJagungNamaData) => {
    if (!selectedJagungKabupatenDetail?.kode_kab || !jagungDisplayMonth || !selectedYear) {
      console.error("Gagal memulai Generate BA Jagung karena data tidak lengkap:", {
        "selectedJagungKabupatenDetail.kode_kab": selectedJagungKabupatenDetail?.kode_kab,
        "jagungDisplayMonth": jagungDisplayMonth,
        "selectedYear": selectedYear
      });
      return;
    }
  
    setIsBaJagungLoading(true);
    setSelectedJagungPetugasForBa(petugasData);  

    try {
      const { data, error: rpcError } = await supabase.rpc('get_berita_acara_jagung_data', {
        p_tahun: selectedYear,
        p_bulan: parseInt(jagungDisplayMonth),
        p_kode_kab: selectedJagungKabupatenDetail.kode_kab,
        p_nama_petugas: petugasData.nama
      });
      
      if (rpcError) throw rpcError;

      setBaJagungModalData(data || []);
      setIsBaJagungModalOpen(true);
    } catch (err: any) {
      console.error("Gagal memanggil RPC Jagung:", err);
      alert(`Gagal mengambil data Berita Acara Jagung: ${err.message}`);
    } finally {
      setIsBaJagungLoading(false);
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

  const pageIsLoading = isLoading || jagungIsLoading || isJadwalLoading; // Combine loading states

  if (error || jagungError) { 
    return (
      <div className="min-w-0 flex flex-col gap-4">
        <Alert variant="destructive" className="m-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Memuat Data</AlertTitle>
          <AlertDescription>{error || jagungError}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return ( 
    <div className="min-w-0 flex flex-col gap-4">
      {/* Modals for both KSA types */}
      <BeritaAcaraModal
        isOpen={isBaModalOpen}
        onClose={() => setIsBaModalOpen(false)}
        data={baModalData}
        selectedPetugas={{nama: selectedPetugasForBa?.nama || '', kode_kab: selectedKabupatenDetail?.kode_kab || ''}}
        displayMonth={displayMonth}
        selectedYear={selectedYear}
      />
      
      <BeritaAcaraJagungModal
        isOpen={isBaJagungModalOpen}
        onClose={() => setIsBaJagungModalOpen(false)}
        data={baJagungModalData}
        selectedPetugas={{nama: selectedJagungPetugasForBa?.nama || '', kode_kab: selectedJagungKabupatenDetail?.kode_kab || ''}}
        displayMonth={jagungDisplayMonth}
        selectedYear={selectedYear}
      />
      
      {currentView === 'district' ? (
        <>
          {/* Month selector */}
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

          {/* KSA Padi Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Monitoring KSA Padi</h2>
            
            <LeaderboardCard 
              data={leaderboardData} 
              isLoading={isLoading || !displayMonth}
              monthName={selectedMonthLabel}
              year={selectedYear || new Date().getFullYear()}
            />

            <DistrictKsaTable
              title="KSA Padi - Data Kabupaten"
              description={!isLoading && lastUpdated ? `Terakhir diperbarui: ${lastUpdated}` : ' '}
              data={districtLevelData || []}
              totals={districtTotals}
              uniqueStatusNames={uniqueStatusNames || []}
              onRowClick={handleDistrictRowClick}
              isLoading={isLoading || !displayMonth}
              jadwal={jadwalKsa}
              displayMonth={displayMonth}
            />
          </div>

          {/* KSA Jagung Section */}
          <div className="space-y-4 mt-8">
            <h2 className="text-xl font-semibold text-foreground">Monitoring KSA Jagung</h2>
            
            <LeaderboardJagungCard 
              data={jagungLeaderboardData} 
              isLoading={jagungIsLoading || !jagungDisplayMonth}
              monthName={selectedMonthLabel}
              year={selectedYear || new Date().getFullYear()}
            />

            <DistrictKsaJagungTable
              title="KSA Jagung - Data Kabupaten"
              description={!jagungIsLoading && jagungLastUpdated ? `Terakhir diperbarui: ${jagungLastUpdated}` : ' '}
              data={jagungDistrictLevelData || []}
              totals={jagungDistrictTotals}
              uniqueStatusNames={jagungUniqueStatusNames || []}
              onRowClick={handleJagungDistrictRowClick}
              isLoading={jagungIsLoading || !jagungDisplayMonth}
              jadwal={jadwalKsa}
              displayMonth={jagungDisplayMonth}
            />
          </div>
        </>
      ) : (
        <>
          {/* Back button */}
          <div>
              <Button variant="outline" onClick={handleBackToDistrictView}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar Kabupaten
              </Button>
          </div>

          {/* Detail view for selected kabupaten */}
          {currentKsaType === 'padi' && selectedKabupatenDetail && (
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

          {currentKsaType === 'jagung' && selectedJagungKabupatenDetail && (
            <NamaKsaJagungTable
              title={`Detail KSA Jagung - ${selectedJagungKabupatenDetail.kabupaten}`}
              description={`Data untuk Tahun ${selectedYear} - Bulan ${selectedMonthLabel}`}
              data={jagungNamaLevelData || []}
              totals={jagungNamaLevelTotals}
              uniqueStatusNames={jagungUniqueStatusNames || []}
              kabupatenName={selectedJagungKabupatenDetail.kabupaten || ''}
              isLoading={jagungIsLoading || isBaJagungLoading}
              onGenerateBaClick={handleGenerateJagungBaClick}
              jadwal={jadwalKsa}
              displayMonth={jagungDisplayMonth}
            />
          )}
        </>
      )}
    </div>
  );
}