// /app/(dashboard)/evaluasi/ubinan/_actions.ts
'use server';

import { supabaseServer } from '@/lib/supabase-server';
import * as XLSX from 'xlsx';

export async function downloadAnomaliExcelAction(tahun: number) {
  try {
    const { data, error } = await supabaseServer
      .from('ubinan_anomali')
      .select('*')
      .eq('tahun', tahun);

    if (error) {
      throw new Error(`Gagal mengambil data anomali: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return { success: false, message: 'Tidak ada data anomali untuk tahun yang dipilih.' };
    }

    // --- PERBAIKAN DI SINI ---
    // Transformasi data sebelum membuat worksheet.
    // Kita akan mengubah kolom 'anomali' dari array menjadi string yang dipisahkan koma.
    const transformedData = data.map(row => ({
      ...row,
      // Cek apakah 'anomali' adalah array, lalu gabungkan. Jika tidak, biarkan apa adanya.
      anomali: Array.isArray(row.anomali) ? row.anomali.join(', ') : row.anomali,
    }));
    // --- AKHIR PERBAIKAN ---

    // Gunakan data yang sudah ditransformasi untuk membuat Excel
    const worksheet = XLSX.utils.json_to_sheet(transformedData); 
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Anomali Ubinan');

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    const base64 = buffer.toString('base64');

    return {
      success: true,
      data: base64,
      fileName: `anomali_ubinan_${tahun}.xlsx`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan tidak diketahui.';
    return { success: false, message: errorMessage };
  }
}