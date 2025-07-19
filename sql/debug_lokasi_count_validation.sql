-- Script validasi untuk menguji RPC function yang telah diperbaiki
-- Tes untuk kabupaten Sanggau (6105) tahun 2025

-- 1. Test: Hitung manual lokasi unik berdasarkan kombinasi lokasi + kecamatan
WITH manual_count AS (
  SELECT 
    COUNT(DISTINCT CASE WHEN flag_sampel = 'U' THEN lokasi || '_' || kdkec END) as manual_desa_u,
    COUNT(DISTINCT CASE WHEN flag_sampel = 'C' THEN lokasi || '_' || kdkec END) as manual_desa_c
  FROM skgb_pengeringan 
  WHERE kdkab = '6105' 
    AND EXTRACT(YEAR FROM created_at) = 2025
),

-- 2. Test: Tampilkan semua kombinasi lokasi-kecamatan untuk flag_sampel = 'U'
desa_u_detail AS (
  SELECT DISTINCT lokasi, kdkec, nmkec
  FROM skgb_pengeringan 
  WHERE kdkab = '6105' 
    AND EXTRACT(YEAR FROM created_at) = 2025
    AND flag_sampel = 'U'
  ORDER BY kdkec, lokasi
),

-- 3. Test: Tampilkan semua kombinasi lokasi-kecamatan untuk flag_sampel = 'C'  
desa_c_detail AS (
  SELECT DISTINCT lokasi, kdkec, nmkec
  FROM skgb_pengeringan 
  WHERE kdkab = '6105' 
    AND EXTRACT(YEAR FROM created_at) = 2025
    AND flag_sampel = 'C'
  ORDER BY kdkec, lokasi
)

-- Tampilkan hasil manual count
SELECT 
  'Manual Count' as test_type,
  manual_desa_u,
  manual_desa_c
FROM manual_count

UNION ALL

-- Tampilkan detail untuk debugging
SELECT 
  'U Locations' as test_type,
  COUNT(*)::INTEGER as manual_desa_u,
  0 as manual_desa_c
FROM desa_u_detail

UNION ALL

SELECT 
  'C Locations' as test_type,
  0 as manual_desa_u,
  COUNT(*)::INTEGER as manual_desa_c
FROM desa_c_detail;

-- Tampilkan detail lokasi U untuk verifikasi
SELECT 'DETAIL U LOCATIONS:' as info;
SELECT kdkec, nmkec, lokasi 
FROM desa_u_detail;

-- Tampilkan detail lokasi C untuk verifikasi  
SELECT 'DETAIL C LOCATIONS:' as info;
SELECT kdkec, nmkec, lokasi 
FROM desa_c_detail;

-- Cek khusus untuk RAUT MUARA
SELECT 'RAUT MUARA VERIFICATION:' as info;
SELECT kdkec, nmkec, lokasi, flag_sampel, COUNT(*) as total_records
FROM skgb_pengeringan 
WHERE kdkab = '6105' 
  AND EXTRACT(YEAR FROM created_at) = 2025
  AND lokasi = 'RAUT MUARA'
GROUP BY kdkec, nmkec, lokasi, flag_sampel
ORDER BY kdkec, flag_sampel;
