// Lokasi: src/app/(dashboard)/jadwal/jadwal.config.ts

export interface JadwalItem {
  id: string;          // ✅ BARU: ID unik untuk item jadwal ini
  kegiatan_id: string; // ✅ BARU: ID dari kegiatan induk
  nama: string;
  keterangan: string;
  startDate: string;   // Format 'YYYY-MM-DD'
  endDate: string;
  warna: 'blue' | 'green' | 'amber' | 'sky' | 'slate' | 'mint' | 'coral' | 'lavender' | 'peach';
}

export interface Kegiatan {
  id: string;
  kegiatan: string;
  jadwal?: JadwalItem[]; 
  parent_id?: string | null; // ✅ BARU: Tambahkan properti opsional ini
  subKegiatan?: Kegiatan[]; 
}
  