# Modifikasi SKGB Monitoring - Breakdown Kecamatan dan Desa per Flag Sampel

## Overview
Telah dilakukan modifikasi pada halaman monitoring SKGB untuk menampilkan breakdown jumlah kecamatan dan desa berdasarkan flag_sampel (U dan C).

## Perubahan yang Dilakukan

### 1. RPC Function Baru
- **File**: `sql/get_skgb_summary_by_kabupaten_v2.sql`
- **Function**: `get_skgb_summary_by_kabupaten_v2`
- **Return Fields**:
  - `total_kecamatan_u`: Jumlah kecamatan yang memiliki **minimal satu** flag_sampel = 'U'
  - `total_kecamatan_c`: Jumlah kecamatan yang memiliki **minimal satu** flag_sampel = 'C'
  - `total_desa_u`: Jumlah desa/lokasi yang memiliki **minimal satu** flag_sampel = 'U'
  - `total_desa_c`: Jumlah desa/lokasi yang memiliki **minimal satu** flag_sampel = 'C'
  - `target_utama`: Total sampel dengan flag_sampel = 'U'
  - `cadangan`: Total sampel dengan flag_sampel = 'C'
  - `realisasi`: Total sampel selesai didata dengan flag_sampel = 'U'
  - `persentase`: Persentase realisasi/target_utama * 100
  - `total_petugas`: Placeholder (0, akan di-override frontend)

### 2. Interface TypeScript Update
- **File**: `src/hooks/useSkgbData.ts`
- **Interface**: `SkgbKabupatenSummary`
- **Perubahan**:
  ```typescript
  // Lama
  total_kecamatan: number;
  total_desa: number;
  
  // Baru
  total_kecamatan_u: number;
  total_kecamatan_c: number;
  total_desa_u: number;
  total_desa_c: number;
  ```

### 3. Hook Update
- **File**: `src/hooks/useSkgbData.ts`
- **Function**: `useSkgbSummaryByKabupaten`
- **Perubahan**:
  - Menggunakan RPC `get_skgb_summary_by_kabupaten_v2` alih-alih yang lama
  - Fallback query manual juga diupdate untuk menghitung breakdown kecamatan dan desa per flag_sampel

### 4. UI Component Update
- **File**: `src/app/(dashboard)/monitoring/SKGB/page.tsx`
- **Perubahan**:
  - Grid layout diubah dari 5 kolom menjadi 6 kolom (`lg:grid-cols-6`)
  - Menambah card baru untuk "Kecamatan (C)" dan "Desa/Kelurahan (C)"
  - Card baru hanya muncul ketika dalam view detail kabupaten (`selectedKabupaten`)
  - Summary calculation diupdate untuk menggunakan field baru

## Tampilan Summary Cards

### View Utama (All Kabupaten):
1. **Kabupaten/Kota**: Total kabupaten
2. **Target Utama**: Total sampel flag_sampel = 'U'
3. **Realisasi**: Total sampel selesai didata
4. **Total Petugas**: Jumlah petugas lapangan
5. **Persentase**: Realisasi/Target Utama

### View Detail Kabupaten:
1. **Kecamatan (U)**: Jumlah kecamatan unik flag_sampel = 'U'
2. **Kecamatan (C)**: Jumlah kecamatan unik flag_sampel = 'C'
3. **Desa/Kelurahan (U)**: Jumlah desa unik flag_sampel = 'U'
4. **Desa/Kelurahan (C)**: Jumlah desa unik flag_sampel = 'C'
5. **Realisasi**: Total sampel selesai didata
6. **Total Petugas**: Jumlah petugas lapangan
7. **Persentase**: Realisasi/Target Utama

## Implementasi Database
Untuk mengimplementasikan perubahan ini, jalankan SQL script berikut di database:
```sql
-- Lihat file: sql/get_skgb_summary_by_kabupaten_v2.sql
```

## Testing
- ✅ Interface TypeScript sudah diupdate
- ✅ Hook sudah menggunakan RPC baru dengan fallback
- ✅ UI sudah menampilkan breakdown kecamatan dan desa per flag_sampel
- ✅ Grid layout responsive sudah disesuaikan
- ✅ Cards conditional sudah bekerja dengan benar

## Notes
- RPC function lama (`get_skgb_summary_by_kabupaten`) masih bisa digunakan sebagai fallback
- Total petugas tetap menggunakan hardcoded data di frontend
- Breakdown hanya ditampilkan pada view detail kabupaten untuk menghindari UI yang terlalu crowded

## Logika Perhitungan

### Kecamatan dan Desa Count
RPC menggunakan logika yang benar untuk menghitung:
- **Kecamatan U**: Kecamatan yang memiliki minimal 1 record dengan flag_sampel = 'U'
- **Kecamatan C**: Kecamatan yang memiliki minimal 1 record dengan flag_sampel = 'C'  
- **Desa U**: Desa yang memiliki minimal 1 record dengan flag_sampel = 'U'
- **Desa C**: Desa yang memiliki minimal 1 record dengan flag_sampel = 'C'

Ini berbeda dengan hanya menghitung DISTINCT kecamatan/desa per flag, karena satu kecamatan/desa bisa memiliki kedua flag (U dan C).

### Query Structure
RPC menggunakan 3 CTE:
1. `kecamatan_stats`: Menghitung count flag U dan C per kecamatan
2. `desa_stats`: Menghitung count flag U dan C per desa  
3. `summary_data`: Mengaggregasi hasil final
