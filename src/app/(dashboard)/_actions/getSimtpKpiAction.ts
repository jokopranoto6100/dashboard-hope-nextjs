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

export async function getSimtpKpiData(): Promise<SimtpKpiData> {
  const supabase = await createSupabaseServerClientWithUserContext();
  const now = new Date();
  const totalDistricts = kabMap.length;

  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth(); 
  
  const kpiStartDate = new Date(Date.UTC(currentYear, currentMonthIndex, 1));
  const kpiEndDate = new Date(Date.UTC(currentYear, currentMonthIndex + 1, 1));
  const reportForMonthName = new Date(now.getFullYear(), currentMonthIndex - 1).toLocaleString('id-ID', { month: 'long' });
  const annualDataYear = currentYear - 1;

  const [
    monthlyResult,
    annualResult,
    lastUpdateResult,
    kegiatanResult
  ] = await Promise.all([
    supabase.from('simtp_uploads').select('kabupaten_kode', { count: 'exact', head: true }).eq('file_type', 'STP_BULANAN').gte('uploaded_at', kpiStartDate.toISOString()).lt('uploaded_at', kpiEndDate.toISOString()),
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
      day: '2-digit', month: 'long', year: 'numeric', hour:'2-digit', minute: '2-digit'
  }) : null;

  const kegiatanId = kegiatanResult.data?.id || null;

  const result = {
    kegiatanId,
    monthly: { reportForMonthName, uploadedCount: monthlyUploadedCount, totalDistricts, percentage: ((monthlyUploadedCount) / totalDistricts) * 100, },
    annual: { reportForYear: annualDataYear, lahanCount, alsinCount, benihCount, totalDistricts, },
    lastUpdate,
  };

  return result;
}