"use client";

import { useYear } from "@/context/YearContext";
import { usePadiMonitoringData } from "@/hooks/usePadiMonitoringData";
import { useJadwalData } from "@/hooks/useJadwalData";
import { useMemo } from "react";
import { Clock } from "lucide-react";

// Helper function untuk menghitung selisih hari
const getDiffInDays = (d1: Date, d2: Date): number => {
    const timeDiff = d2.getTime() - d1.getTime();
    return Math.round(timeDiff / (1000 * 60 * 60 * 24));
}

export default function TestPage() {
  const { selectedYear } = useYear();
  
  // 1. Panggil kedua hook untuk mendapatkan data
  const { 
    processedPadiData, 
    padiTotals, 
    loadingPadi, 
    errorPadi, 
    lastUpdate, 
    kegiatanId 
  } = usePadiMonitoringData(selectedYear, 'all');

  const {
    jadwalData,
    isLoading: isJadwalLoading,
    error: jadwalError,
  } = useJadwalData(selectedYear);

  // 2. Gunakan useMemo untuk mencari jadwal yang cocok berdasarkan ID
  const jadwalTerkait = useMemo(() => {
    if (isJadwalLoading || !kegiatanId || !jadwalData) return null;
    return jadwalData.find(k => k.id === kegiatanId);
  }, [isJadwalLoading, kegiatanId, jadwalData]);

  // 3. Gunakan useMemo untuk menghitung status hitung mundur dari jadwal yang ditemukan
  const countdownStatus = useMemo(() => {
    if (!jadwalTerkait) return null;

    const allJadwalItems = [
      ...(jadwalTerkait.jadwal || []),
      ...(jadwalTerkait.subKegiatan?.flatMap(sub => sub.jadwal || []) || [])
    ];
    
    if (allJadwalItems.length === 0) return { text: "Tidak ada data tanggal", color: "text-gray-500" };

    const allStartDates = allJadwalItems.map(j => new Date(j.startDate));
    const allEndDates = allJadwalItems.map(j => new Date(j.endDate));
    
    const earliestStart = new Date(Math.min(...allStartDates.map(d => d.getTime())));
    const latestEnd = new Date(Math.max(...allEndDates.map(d => d.getTime())));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (today > latestEnd) {
      return { text: "Telah Berakhir", color: "text-gray-500" };
    }
    
    if (today >= earliestStart && today <= latestEnd) {
      const daysLeft = getDiffInDays(today, latestEnd);
      if (daysLeft === 0) {
        return { text: "Berakhir Hari Ini", color: "text-red-600 font-bold" };
      }
      return { text: `Berakhir dalam ${daysLeft} hari`, color: "text-green-600" };
    }

    if (today < earliestStart) {
      const daysUntil = getDiffInDays(today, earliestStart);
       if (daysUntil === 1) {
        return { text: "Dimulai Besok", color: "text-blue-600" };
      }
      return { text: `Dimulai dalam ${daysUntil} hari`, color: "text-blue-600" };
    }
    
    return null;
  }, [jadwalTerkait]);

  // Gabungkan status loading dari semua hook
  const isPageLoading = loadingPadi || isJadwalLoading;

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Halaman Uji Coba Integrasi Jadwal</h1>
      <p>Menguji `usePadiMonitoringData` dan `useJadwalData` secara bersamaan.</p>

      {isPageLoading && (
        <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
          <p className="font-semibold">Memuat data monitoring dan jadwal...</p>
        </div>
      )}

      {(errorPadi || jadwalError) && (
        <div className="p-4 border-l-4 border-red-500 bg-red-50 text-red-700">
          <p className="font-semibold">Terjadi Error:</p>
          {errorPadi && <p>- Error Padi: {errorPadi}</p>}
          {jadwalError && <p>- Error Jadwal: {jadwalError}</p>}
        </div>
      )}

      {!isPageLoading && !(errorPadi || jadwalError) && (
        <>
          <div className="p-4 mb-4 border rounded-md">
            <h2 className="text-lg font-semibold">Informasi Umum</h2>
            <p><strong>Tahun Terpilih:</strong> {selectedYear}</p>
            <p><strong>ID Kegiatan Terdeteksi (dari Hook Padi):</strong> <span className="font-mono bg-gray-100 px-1 rounded">{kegiatanId || 'Tidak ada'}</span></p>
            <p><strong>Update Terakhir (Monitoring):</strong> {lastUpdate || 'N/A'}</p>
          </div>
          
          <div className="p-4 mb-4 border-l-4 border-green-500 bg-green-50">
            <h2 className="text-lg font-semibold text-green-800">Jadwal Terintegrasi</h2>
            
            {countdownStatus && (
                <div className={`flex items-center mt-2 p-2 rounded-md bg-white dark:bg-slate-700 border`}>
                    <Clock className={`h-5 w-5 mr-3 ${countdownStatus.color}`} />
                    <span className={`text-sm font-medium ${countdownStatus.color}`}>{countdownStatus.text}</span>
                </div>
            )}

            {jadwalTerkait ? (
              <>
                <p className="mt-3 text-sm">Output mentah dari objek jadwal yang ditemukan:</p>
                <pre className="text-sm bg-gray-100 p-2 mt-2 rounded-md overflow-x-auto">
                  {JSON.stringify(jadwalTerkait, null, 2)}
                </pre>
              </>
            ) : (
              <p className="mt-3">Tidak ditemukan jadwal yang cocok untuk ID kegiatan ini di tahun {selectedYear}.</p>
            )}
          </div>

          <div className="p-4 border rounded-md">
            <h2 className="text-lg font-semibold">Output Mentah dari Hook Padi</h2>
            <h3 className="font-medium mt-2">Data Total (Totals)</h3>
            <pre className="text-sm bg-gray-100 p-2 rounded-md overflow-x-auto">
              {JSON.stringify(padiTotals, null, 2)}
            </pre>
            <h3 className="font-medium mt-4">Data Per Kabupaten (2 baris pertama)</h3>
            <pre className="text-sm bg-gray-100 p-2 rounded-md overflow-x-auto">
              {JSON.stringify(processedPadiData?.slice(0, 2), null, 2)}
            </pre>
            {processedPadiData && processedPadiData.length > 2 && <p>... dan {processedPadiData.length - 2} baris lainnya.</p>}
          </div>
        </>
      )}
    </div>
  );
}