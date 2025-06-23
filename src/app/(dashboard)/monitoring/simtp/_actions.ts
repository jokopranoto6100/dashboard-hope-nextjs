'use server';

import { createSupabaseServerClientWithUserContext } from '@/lib/supabase-server';
import { SimtpMonitoringData } from './types';

export async function getSimtpMonitoringData(monitoringYear: number): Promise<{
  data: SimtpMonitoringData;
  lastUpdate: string | null;
}> {
  const supabase = await createSupabaseServerClientWithUserContext();
  const processedData: SimtpMonitoringData = {};
  let latestTimestamp: Date | null = null;

  // --- 1. Ambil data BULANAN untuk tahun monitoring (logika bulan N+1) ---
  const monthlyStartDate = `${monitoringYear}-02-01T00:00:00Z`;
  const monthlyEndDate = `${monitoringYear + 1}-02-01T00:00:00Z`;

  const { data: monthlyData, error: monthlyError } = await supabase
    .from('simtp_uploads')
    .select('kabupaten_kode, file_type, file_name, uploaded_at')
    .eq('file_type', 'STP_BULANAN')
    .gte('uploaded_at', monthlyStartDate)
    .lt('uploaded_at', monthlyEndDate);

  if (monthlyError) {
    console.error('Error fetching SIMTP monthly data:', monthlyError);
    throw new Error('Gagal mengambil data monitoring bulanan.');
  }

  // Proses data bulanan
  for (const row of monthlyData) {
    const { kabupaten_kode, file_type, file_name, uploaded_at } = row;
    const uploadDate = new Date(uploaded_at);
    
    let reportMonth = uploadDate.getUTCMonth();
    let reportYear = uploadDate.getUTCFullYear();

    if (reportMonth === 0) {
      reportMonth = 12;
      reportYear = reportYear - 1;
    }

    if (reportYear !== monitoringYear) {
      continue;
    }

    if (!processedData[kabupaten_kode]) {
      processedData[kabupaten_kode] = { months: {}, annuals: {} };
    }
    
    processedData[kabupaten_kode].months[reportMonth] = {
      file_type,
      file_name,
      uploaded_at,
    };

    if (!latestTimestamp || uploadDate > latestTimestamp) {
      latestTimestamp = uploadDate;
    }
  }

  // --- 2. Ambil data TAHUNAN untuk periode tahun monitoring - 1 ---
  const annualDataYear = monitoringYear - 1;
  const { data: annualData, error: annualError } = await supabase
    .from('simtp_uploads')
    .select('kabupaten_kode, file_type, file_name, uploaded_at')
    .eq('year', annualDataYear)
    .in('file_type', ['LAHAN_TAHUNAN', 'ALSIN_TAHUNAN', 'BENIH_TAHUNAN']);

  if (annualError) {
    console.error('Error fetching SIMTP annual data:', annualError);
    throw new Error('Gagal mengambil data monitoring tahunan.');
  }
  
  // Gabungkan data tahunan ke dalam hasil
  for (const row of annualData) {
    const { kabupaten_kode, file_type, uploaded_at, file_name } = row;
    if (!processedData[kabupaten_kode]) {
      processedData[kabupaten_kode] = { months: {}, annuals: {} };
    }
    processedData[kabupaten_kode].annuals[file_type as keyof typeof processedData[string]['annuals']] = {
      uploaded_at,
      file_name,
    };
    
    const uploadDate = new Date(uploaded_at);
    if (!latestTimestamp || uploadDate > latestTimestamp) {
        latestTimestamp = uploadDate;
    }
  }

  const lastUpdate = latestTimestamp ? 
    latestTimestamp.toLocaleString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }) : null;

  return { data: processedData, lastUpdate };
}