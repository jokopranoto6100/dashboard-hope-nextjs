# Testing Instructions untuk SKGB Summary RPC

## Langkah-langkah Testing

### 1. Cek Struktur Data Dasar
```sql
-- Jalankan file ini untuk memahami struktur data SKGB
\i sql/analyze_skgb_structure.sql
```

### 2. Debug RPC Function  
```sql
-- Jalankan file ini untuk debug detail
\i sql/debug_skgb_summary.sql
```

### 3. Bandingkan Logika
```sql
-- Jalankan file ini untuk membandingkan logika lama vs baru
\i sql/compare_skgb_logic.sql
```

## Yang Perlu Diperiksa

### A. Apakah Ada Data untuk Kabupaten yang Dicek?
Pastikan ada data di tabel `skgb_pengeringan` untuk:
- `kdkab = '6101'` (atau kode kabupaten lain)
- `EXTRACT(YEAR FROM created_at) = 2024` (atau tahun lain)

### B. Apakah Ada Kecamatan/Desa dengan Kedua Flag?
Periksa hasil query #5 dan #6 di file `analyze_skgb_structure.sql`:
- Jika tidak ada kecamatan/desa dengan kedua flag U dan C, maka logika lama (simple DISTINCT) sebenarnya sudah benar
- Jika ada kecamatan/desa dengan kedua flag, maka logika baru (dengan CTE) yang benar

### C. Bandingkan Hasil Manual vs RPC
```sql
-- Manual simple
SELECT 
  COUNT(DISTINCT CASE WHEN flag_sampel = 'U' THEN kdkec END) as kecamatan_u,
  COUNT(DISTINCT CASE WHEN flag_sampel = 'C' THEN kdkec END) as kecamatan_c
FROM skgb_pengeringan 
WHERE kdkab = '6101' AND EXTRACT(YEAR FROM created_at) = 2024;

-- RPC result
SELECT total_kecamatan_u, total_kecamatan_c 
FROM get_skgb_summary_by_kabupaten_v2('6101', 2024);
```

## Kemungkinan Masalah

### 1. Data Kosong
Jika tidak ada data untuk kabupaten/tahun yang dicek, semua hasil akan 0.

### 2. Logika Berlebihan
Jika dalam data SKGB tidak ada kecamatan/desa yang memiliki kedua flag U dan C, maka:
- Logika simple (COUNT DISTINCT) sudah cukup
- Logika kompleks (dengan CTE) tidak diperlukan

### 3. Parameter Salah
Pastikan parameter yang digunakan sesuai dengan data yang ada:
- Format `kdkab` (string '6101' bukan integer 6101)
- Tahun yang benar (2024, 2023, dll)

## Rekomendasi

Setelah menjalankan query testing:

1. **Jika hasil manual = RPC**: Logika sudah benar
2. **Jika hasil manual ≠ RPC**: Ada masalah di logika
3. **Jika semua hasil = 0**: Tidak ada data untuk parameter tersebut

Berdasarkan hasil testing, kita bisa tentukan apakah perlu:
- Menggunakan logika simple (revert ke COUNT DISTINCT)
- Atau memperbaiki logika kompleks yang sekarang
- Atau ada masalah parameter/data
