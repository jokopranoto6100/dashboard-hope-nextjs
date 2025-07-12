-- Query untuk memahami struktur data SKGB yang sebenarnya
-- Jalankan ini untuk memahami apakah ada masalah dengan asumsi kita

-- 1. Cek struktur data dasar
SELECT 
  COUNT(*) as total_records,
  COUNT(DISTINCT kdkab) as total_kabupaten,
  COUNT(DISTINCT kdkec) as total_kecamatan,
  COUNT(DISTINCT lokasi) as total_lokasi,
  MIN(created_at) as data_paling_lama,
  MAX(created_at) as data_paling_baru
FROM skgb_pengeringan;

-- 2. Cek distribusi flag_sampel
SELECT 
  flag_sampel,
  COUNT(*) as jumlah_record,
  COUNT(DISTINCT kdkab) as jumlah_kabupaten,
  COUNT(DISTINCT kdkec) as jumlah_kecamatan,
  COUNT(DISTINCT lokasi) as jumlah_lokasi
FROM skgb_pengeringan 
GROUP BY flag_sampel
ORDER BY flag_sampel;

-- 3. Cek distribusi status_pendataan
SELECT 
  status_pendataan,
  flag_sampel,
  COUNT(*) as jumlah_record
FROM skgb_pengeringan 
GROUP BY status_pendataan, flag_sampel
ORDER BY status_pendataan, flag_sampel;

-- 4. Cek untuk kabupaten '6101' tahun 2024 (atau ganti sesuai kebutuhan)
SELECT 
  'Total Records' as info,
  COUNT(*) as nilai
FROM skgb_pengeringan 
WHERE kdkab = '6101' 
  AND EXTRACT(YEAR FROM created_at) = 2024

UNION ALL

SELECT 
  'Records Flag U' as info,
  COUNT(*) as nilai
FROM skgb_pengeringan 
WHERE kdkab = '6101' 
  AND EXTRACT(YEAR FROM created_at) = 2024
  AND flag_sampel = 'U'

UNION ALL

SELECT 
  'Records Flag C' as info,
  COUNT(*) as nilai
FROM skgb_pengeringan 
WHERE kdkab = '6101' 
  AND EXTRACT(YEAR FROM created_at) = 2024
  AND flag_sampel = 'C'

UNION ALL

SELECT 
  'Distinct Kecamatan Total' as info,
  COUNT(DISTINCT kdkec) as nilai
FROM skgb_pengeringan 
WHERE kdkab = '6101' 
  AND EXTRACT(YEAR FROM created_at) = 2024

UNION ALL

SELECT 
  'Distinct Kecamatan Flag U' as info,
  COUNT(DISTINCT kdkec) as nilai
FROM skgb_pengeringan 
WHERE kdkab = '6101' 
  AND EXTRACT(YEAR FROM created_at) = 2024
  AND flag_sampel = 'U'

UNION ALL

SELECT 
  'Distinct Kecamatan Flag C' as info,
  COUNT(DISTINCT kdkec) as nilai
FROM skgb_pengeringan 
WHERE kdkab = '6101' 
  AND EXTRACT(YEAR FROM created_at) = 2024
  AND flag_sampel = 'C';

-- 5. Cek apakah benar-benar ada kecamatan yang memiliki kedua flag
SELECT 
  kdkec,
  COUNT(CASE WHEN flag_sampel = 'U' THEN 1 END) as count_u,
  COUNT(CASE WHEN flag_sampel = 'C' THEN 1 END) as count_c,
  COUNT(*) as total_records_per_kecamatan
FROM skgb_pengeringan 
WHERE kdkab = '6101' 
  AND EXTRACT(YEAR FROM created_at) = 2024
GROUP BY kdkec
ORDER BY kdkec;

-- 6. Cek apakah benar-benar ada desa yang memiliki kedua flag
SELECT 
  lokasi,
  kdkec,
  COUNT(CASE WHEN flag_sampel = 'U' THEN 1 END) as count_u,
  COUNT(CASE WHEN flag_sampel = 'C' THEN 1 END) as count_c,
  COUNT(*) as total_records_per_desa
FROM skgb_pengeringan 
WHERE kdkab = '6101' 
  AND EXTRACT(YEAR FROM created_at) = 2024
GROUP BY lokasi, kdkec
ORDER BY kdkec, lokasi;

-- 7. Bandingkan hasil RPC dengan perhitungan manual sederhana
-- Jika hasilnya sama, berarti tidak ada kecamatan/desa dengan kedua flag
-- Jika berbeda, berarti ada kecamatan/desa dengan kedua flag

-- Manual calculation (logika lama - mungkin sebenarnya benar untuk SKGB)
SELECT 
  'MANUAL SIMPLE' as method,
  COUNT(DISTINCT CASE WHEN flag_sampel = 'U' THEN kdkec END) as kecamatan_u,
  COUNT(DISTINCT CASE WHEN flag_sampel = 'C' THEN kdkec END) as kecamatan_c,
  COUNT(DISTINCT CASE WHEN flag_sampel = 'U' THEN lokasi END) as desa_u,
  COUNT(DISTINCT CASE WHEN flag_sampel = 'C' THEN lokasi END) as desa_c
FROM skgb_pengeringan 
WHERE kdkab = '6101' 
  AND EXTRACT(YEAR FROM created_at) = 2024;

-- RPC result untuk perbandingan
-- SELECT * FROM get_skgb_summary_by_kabupaten_v2('6101', 2024);
