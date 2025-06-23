'use server';

import { createSupabaseServerClientWithUserContext } from '@/lib/supabase-server';
import { SimtpMonitoringData } from './types';

export async function getSimtpMonitoringData(monitoringYear: number): Promise<{
  data: SimtpMonitoringData;
  lastUpdate: string | null;
}> {
  const supabase = await createSupabaseServerClientWithUserContext();

  const startDate = `${monitoringYear}-02-01T00:00:00Z`;
  const endDate = `${monitoringYear + 1}-02-01T00:00:00Z`;

  const { data, error } = await supabase
    .from('simtp_uploads')
    .select('kabupaten_kode, file_type, file_name, uploaded_at')
    .gte('uploaded_at', startDate)
    .lt('uploaded_at', endDate);

  if (error) {
    console.error('Error fetching SIMTP monitoring data:', error);
    throw new Error('Gagal mengambil data monitoring SIMTP.');
  }

  const processedData: SimtpMonitoringData = {};
  let latestTimestamp: string | null = null;

  for (const row of data) {
    // DIKEMBALIKAN: Kita bisa pakai `kabupaten_kode` lagi karena tipe sudah diperbaiki.
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
      processedData[kabupaten_kode] = {
        months: {},
        annuals: {},
      };
    }
    
    if (file_type === 'STP_BULANAN') {
      processedData[kabupaten_kode].months[reportMonth] = {
        file_type,
        file_name,
        uploaded_at,
      };
    } else if (['LAHAN_TAHUNAN', 'ALSIN_TAHUNAN', 'BENIH_TAHUNAN'].includes(file_type)) {
      processedData[kabupaten_kode].annuals[file_type as keyof typeof processedData[string]['annuals']] = {
        uploaded_at,
        file_name,
      };
    }

    if (!latestTimestamp || uploadDate > new Date(latestTimestamp)) {
        latestTimestamp = uploaded_at;
    }
  }
  
  const lastUpdate = latestTimestamp ? 
    new Date(latestTimestamp).toLocaleString('id-ID', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }) : null;

  return { data: processedData, lastUpdate };
}