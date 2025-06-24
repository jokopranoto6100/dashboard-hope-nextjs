'use server';

import { createSupabaseServerClientWithUserContext } from "@/lib/supabase-server";
import { kabMap } from "@/lib/satker-data";

// DIHAPUS: Baris impor yang menyebabkan circular dependency
// import { SimtpKpiData } from "./getSimtpKpiAction"; 

// Definisikan dan langsung ekspor tipe datanya
export interface SimtpKpiData {
  monthly: {
    reportForMonthName: string;
    uploadedCount: number;
    totalDistricts: number;
    percentage: number;
  };
  annual: {
    reportForYear: number;
    lahanCount: number;
    alsinCount: number;
    benihCount: number;
    totalDistricts: number;
  };
  lastUpdate: string | null;
}

// DIHAPUS: Baris ekspor alias yang tidak diperlukan
// export { SimtpKpiData };

export async function getSimtpKpiData(): Promise<SimtpKpiData> {
  const supabase = await createSupabaseServerClientWithUserContext();
  const now = new Date();
  const totalDistricts = kabMap.length;

  // --- Kalkulasi KPI Bulanan ---
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth(); 
  
  const kpiStartDate = new Date(Date.UTC(currentYear, currentMonthIndex, 1));
  const kpiEndDate = new Date(Date.UTC(currentYear, currentMonthIndex + 1, 1));

  const reportForMonthName = new Date(now.getFullYear(), currentMonthIndex - 1).toLocaleString('id-ID', { month: 'long' });

  const { count: monthlyUploadedCount, error: monthlyError } = await supabase
    .from('simtp_uploads')
    .select('kabupaten_kode', { count: 'exact', head: true })
    .eq('file_type', 'STP_BULANAN')
    .gte('uploaded_at', kpiStartDate.toISOString())
    .lt('uploaded_at', kpiEndDate.toISOString());
    
  if (monthlyError) throw new Error("Gagal mengambil data KPI bulanan SIMTP.");

  // --- Kalkulasi KPI Tahunan ---
  const annualDataYear = currentYear - 1;
  const { data: annualData, error: annualError } = await supabase
    .from('simtp_uploads')
    .select('file_type, kabupaten_kode')
    .eq('year', annualDataYear)
    .in('file_type', ['LAHAN_TAHUNAN', 'ALSIN_TAHUNAN', 'BENIH_TAHUNAN']);

  if (annualError) throw new Error("Gagal mengambil data KPI tahunan SIMTP.");
  
  const lahanCount = new Set(annualData.filter(d => d.file_type === 'LAHAN_TAHUNAN').map(d => d.kabupaten_kode)).size;
  const alsinCount = new Set(annualData.filter(d => d.file_type === 'ALSIN_TAHUNAN').map(d => d.kabupaten_kode)).size;
  const benihCount = new Set(annualData.filter(d => d.file_type === 'BENIH_TAHUNAN').map(d => d.kabupaten_kode)).size;

  // --- Dapatkan data update terakhir ---
  const { data: lastUpdateData } = await supabase
    .from('simtp_uploads')
    .select('uploaded_at')
    .order('uploaded_at', { ascending: false })
    .limit(1)
    .single();

  return {
    monthly: {
      reportForMonthName,
      uploadedCount: monthlyUploadedCount || 0,
      totalDistricts,
      percentage: ((monthlyUploadedCount || 0) / totalDistricts) * 100,
    },
    annual: {
      reportForYear: annualDataYear,
      lahanCount,
      alsinCount,
      benihCount,
      totalDistricts,
    },
    lastUpdate: lastUpdateData ? new Date(lastUpdateData.uploaded_at).toLocaleString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric', hour:'2-digit', minute: '2-digit'
    }) : null,
  };
}