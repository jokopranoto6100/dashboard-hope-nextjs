'use server';

import { createSupabaseServerClientWithUserContext } from '@/lib/supabase-server'; 
import { kabMap } from "@/lib/satker-data";

export interface SimtpKpiData {
  kegiatanId: string | null;
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

export async function getSimtpKpiData(selectedYear: number): Promise<SimtpKpiData> {
  const supabase = await createSupabaseServerClientWithUserContext();
  const now = new Date();
  const totalDistricts = kabMap.length;

  // Use selectedYear instead of hardcoded current year
  const currentMonthIndex = now.getMonth() + 1; // Convert to 1-based month
  
  // For SIMTP, we report data for the previous month
  // If current month is January (1), we report December of previous year
  let reportMonth: number;
  let reportYear: number;
  
  if (currentMonthIndex === 1) {
    reportMonth = 12;
    reportYear = selectedYear - 1;
  } else {
    reportMonth = currentMonthIndex - 1;
    reportYear = selectedYear;
  }
  
  const reportForMonthName = new Date(reportYear, reportMonth - 1).toLocaleString('id-ID', { month: 'long' });
  const annualDataYear = selectedYear - 1;

  const [
    monthlyResult,
    annualResult,
    lastUpdateResult,
    kegiatanResult
  ] = await Promise.all([
    supabase.from('simtp_uploads')
      .select('kabupaten_kode', { count: 'exact', head: true })
      .eq('file_type', 'STP_BULANAN')
      .eq('year', reportYear)
      .eq('month', reportMonth),
    supabase.from('simtp_uploads').select('file_type, kabupaten_kode').eq('year', annualDataYear).in('file_type', ['LAHAN_TAHUNAN', 'ALSIN_TAHUNAN', 'BENIH_TAHUNAN']),
    supabase.from('simtp_uploads').select('uploaded_at').order('uploaded_at', { ascending: false }).limit(1).single(),
    supabase.from('kegiatan').select('id, nama_kegiatan').eq('nama_kegiatan', 'SIMTP').single()
  ]);

  if (monthlyResult.error) throw new Error(`Gagal mengambil data KPI bulanan: ${monthlyResult.error.message}`);
  if (annualResult.error) throw new Error(`Gagal mengambil data KPI tahunan: ${annualResult.error.message}`);
  
  const monthlyUploadedCount = monthlyResult.count || 0;
  const annualData = annualResult.data || [];
  
  const lahanCount = new Set(annualData.filter(d => d.file_type === 'LAHAN_TAHUNAN').map(d => d.kabupaten_kode)).size;
  const alsinCount = new Set(annualData.filter(d => d.file_type === 'ALSIN_TAHUNAN').map(d => d.kabupaten_kode)).size;
  const benihCount = new Set(annualData.filter(d => d.file_type === 'BENIH_TAHUNAN').map(d => d.kabupaten_kode)).size;

  const lastUpdate = lastUpdateResult.data ? new Date(lastUpdateResult.data.uploaded_at).toLocaleString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric', hour:'2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta'
  }) + ' WIB' : null;

  const kegiatanId = kegiatanResult.data?.id || null;

  const result = {
    kegiatanId,
    monthly: { reportForMonthName, uploadedCount: monthlyUploadedCount, totalDistricts, percentage: ((monthlyUploadedCount) / totalDistricts) * 100, },
    annual: { reportForYear: annualDataYear, lahanCount, alsinCount, benihCount, totalDistricts, },
    lastUpdate,
  };

  return result;
}