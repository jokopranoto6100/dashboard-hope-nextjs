// File ini TIDAK memiliki 'use server';
// Tujuannya adalah untuk menampung semua definisi tipe dan konstanta.

// 'sumber kebenaran' untuk daftar status
export const ALL_STATUSES = [
    'Aktif Berproduksi',
    'Tidak/Belum Produksi',
    'Tutup Sementara',
    'Alih Subsektor (Nonkehutanan)',
    'Tutup',
    'Tidak Ditemukan',
    'Tidak Bersedia Diwawancarai',
] as const;

// Tipe data spesifik dari daftar status di atas
export type StatusPerusahaan = typeof ALL_STATUSES[number];

// Interface utama untuk data perusahaan
export interface PerusahaanKehutanan {
    id: string;
    nama_perusahaan: string;
    alamat_lengkap: string | null;
    kabupaten: string | null;
    kode_kab: string | null;
    status_perusahaan: StatusPerusahaan | null;
    keterangan: string | null;
    date_modified: string | null;
    user_modified: string | null;
}