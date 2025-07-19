'use server';

import { createSupabaseServerClientWithUserContext } from '@/lib/supabase-server';
import { SimtpMonitoringData } from './types';

// Tipe return diubah untuk menyertakan kegiatanId
export async function getSimtpMonitoringData(monitoringYear: number): Promise<{
  data: SimtpMonitoringData;
  lastUpdate: string | null;
  kegiatanId: string | null; // Properti baru
}> {
  const supabase = await createSupabaseServerClientWithUserContext();
  const processedData: SimtpMonitoringData = {};
  let latestTimestamp: Date | null = null;

  // Jalankan semua query yang dibutuhkan secara paralel
  const [
    monthlyResult,
    annualResult,
    kegiatanResult
  ] = await Promise.all([
    supabase
      .from('simtp_uploads')
      .select('kabupaten_kode, file_type, file_name, uploaded_at, month')
      .eq('file_type', 'STP_BULANAN')
      .eq('year', monitoringYear),
    supabase
      .from('simtp_uploads')
      .select('kabupaten_kode, file_type, file_name, uploaded_at')
      .eq('year', monitoringYear - 1)
      .in('file_type', ['LAHAN_TAHUNAN', 'ALSIN_TAHUNAN', 'BENIH_TAHUNAN']),
    // Query tambahan untuk mengambil ID kegiatan 'SIMTP'
    supabase
      .from('kegiatan')
      .select('id')
      .eq('nama_kegiatan', 'SIMTP')
      .single()
  ]);

  if (monthlyResult.error) {
    console.error('Error fetching SIMTP monthly data:', monthlyResult.error);
    throw new Error('Gagal mengambil data monitoring bulanan.');
  }
  const monthlyData = monthlyResult.data;

  if (annualResult.error) {
    console.error('Error fetching SIMTP annual data:', annualResult.error);
    throw new Error('Gagal mengambil data monitoring tahunan.');
  }
  const annualData = annualResult.data;

  // Proses data bulanan
  for (const row of monthlyData) {
    const { kabupaten_kode, file_type, file_name, uploaded_at, month } = row;
    
    // Use the month column directly (which now represents data period)
    const reportMonth = month;

    if (!processedData[kabupaten_kode]) {
      processedData[kabupaten_kode] = { months: {}, annuals: {} };
    }
    
    processedData[kabupaten_kode].months[reportMonth] = {
      file_type,
      file_name,
      uploaded_at,
    };

    const uploadDate = new Date(uploaded_at);
    if (!latestTimestamp || uploadDate > latestTimestamp) {
      latestTimestamp = uploadDate;
    }
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

  // Ekstrak ID dari hasil query kegiatan
  const kegiatanId = kegiatanResult.data?.id || null;

  // Kembalikan objek yang sudah mencakup kegiatanId
  return { data: processedData, lastUpdate, kegiatanId };
}