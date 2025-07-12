-- Perbandingan logika lama vs baru untuk SKGB summary
-- Ganti '6101' dengan kode kabupaten dan 2024 dengan tahun yang ingin dicek

-- ================================================
-- LOGIKA LAMA (yang salah)
-- ================================================
SELECT 
  'LOGIKA LAMA' as metode,
  COUNT(DISTINCT CASE WHEN flag_sampel = 'U' THEN kdkec END) as total_kecamatan_u,
  COUNT(DISTINCT CASE WHEN flag_sampel = 'C' THEN kdkec END) as total_kecamatan_c,
  COUNT(DISTINCT CASE WHEN flag_sampel = 'U' THEN lokasi END) as total_desa_u,
  COUNT(DISTINCT CASE WHEN flag_sampel = 'C' THEN lokasi END) as total_desa_c
FROM skgb_pengeringan 
WHERE kdkab = '6101' 
  AND EXTRACT(YEAR FROM created_at) = 2024;

-- ================================================  
-- LOGIKA BARU (yang benar)
-- ================================================
WITH kecamatan_stats AS (
  SELECT 
    kdkec,
    COUNT(CASE WHEN flag_sampel = 'U' THEN 1 END) as count_u,
    COUNT(CASE WHEN flag_sampel = 'C' THEN 1 END) as count_c
  FROM skgb_pengeringan 
  WHERE kdkab = '6101' 
    AND EXTRACT(YEAR FROM created_at) = 2024
  GROUP BY kdkec
),
desa_stats AS (
  SELECT 
    lokasi,
    COUNT(CASE WHEN flag_sampel = 'U' THEN 1 END) as count_u,
    COUNT(CASE WHEN flag_sampel = 'C' THEN 1 END) as count_c
  FROM skgb_pengeringan 
  WHERE kdkab = '6101' 
    AND EXTRACT(YEAR FROM created_at) = 2024
  GROUP BY lokasi
)
SELECT 
  'LOGIKA BARU' as metode,
  (SELECT COUNT(*) FROM kecamatan_stats WHERE count_u > 0) as total_kecamatan_u,
  (SELECT COUNT(*) FROM kecamatan_stats WHERE count_c > 0) as total_kecamatan_c,
  (SELECT COUNT(*) FROM desa_stats WHERE count_u > 0) as total_desa_u,
  (SELECT COUNT(*) FROM desa_stats WHERE count_c > 0) as total_desa_c;

-- ================================================
-- ANALISIS PERBEDAAN
-- ================================================
-- Query ini menunjukkan mengapa hasil bisa berbeda
-- Contoh: Jika ada kecamatan yang memiliki KEDUA flag U dan C,
-- maka logika lama akan menghitung kecamatan tersebut 2 kali
-- tapi logika baru akan menghitung dengan benar

SELECT 
  kdkec,
  COUNT(CASE WHEN flag_sampel = 'U' THEN 1 END) as records_flag_u,
  COUNT(CASE WHEN flag_sampel = 'C' THEN 1 END) as records_flag_c,
  CASE 
    WHEN COUNT(CASE WHEN flag_sampel = 'U' THEN 1 END) > 0 
     AND COUNT(CASE WHEN flag_sampel = 'C' THEN 1 END) > 0 
    THEN 'KEDUA FLAG'
    WHEN COUNT(CASE WHEN flag_sampel = 'U' THEN 1 END) > 0 
    THEN 'HANYA U'
    WHEN COUNT(CASE WHEN flag_sampel = 'C' THEN 1 END) > 0 
    THEN 'HANYA C'
    ELSE 'TIDAK ADA'
  END as kategori_kecamatan
FROM skgb_pengeringan 
WHERE kdkab = '6101' 
  AND EXTRACT(YEAR FROM created_at) = 2024
GROUP BY kdkec
ORDER BY kdkec;
