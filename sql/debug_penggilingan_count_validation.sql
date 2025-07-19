-- Script validasi untuk menguji RPC function penggilingan yang telah diperbaiki
-- Test untuk kabupaten Sanggau (6105) tahun 2025

-- 1. Test: Hitung manual desa unik berdasarkan kombinasi kddesa + kdkec
WITH manual_count AS (
  SELECT 
    COUNT(DISTINCT CASE WHEN flag_sampel = 'U' THEN kddesa || '_' || kdkec END) as manual_desa_u,
    COUNT(DISTINCT CASE WHEN flag_sampel = 'C' THEN kddesa || '_' || kdkec END) as manual_desa_c
  FROM skgb_penggilingan 
  WHERE kdkab = '6105' 
    AND tahun = 2025
),

-- 2. Test: Tampilkan semua kombinasi desa-kecamatan untuk flag_sampel = 'U'
desa_u_detail AS (
  SELECT DISTINCT kddesa, nmdesa, kdkec, nmkec
  FROM skgb_penggilingan 
  WHERE kdkab = '6105' 
    AND tahun = 2025
    AND flag_sampel = 'U'
  ORDER BY kdkec, kddesa
),

-- 3. Test: Tampilkan semua kombinasi desa-kecamatan untuk flag_sampel = 'C'  
desa_c_detail AS (
  SELECT DISTINCT kddesa, nmdesa, kdkec, nmkec
  FROM skgb_penggilingan 
  WHERE kdkab = '6105' 
    AND tahun = 2025
    AND flag_sampel = 'C'
  ORDER BY kdkec, kddesa
),

-- 4. Test: Cari duplikasi kode desa di kecamatan yang sama
duplicate_check AS (
  SELECT 
    kddesa, 
    kdkec,
    nmkec,
    flag_sampel,
    COUNT(*) as duplicate_count
  FROM skgb_penggilingan 
  WHERE kdkab = '6105' 
    AND tahun = 2025
  GROUP BY kddesa, kdkec, nmkec, flag_sampel
  HAVING COUNT(*) > 1
  ORDER BY kdkec, kddesa, flag_sampel
)

-- Tampilkan hasil manual count
SELECT 
  'Manual Count' as test_type,
  manual_desa_u,
  manual_desa_c
FROM manual_count

UNION ALL

-- Tampilkan jumlah detail untuk debugging
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

-- Tampilkan detail desa U untuk verifikasi
SELECT 'DETAIL U LOCATIONS:' as info;
SELECT kdkec, nmkec, kddesa, nmdesa 
FROM desa_u_detail;

-- Tampilkan detail desa C untuk verifikasi  
SELECT 'DETAIL C LOCATIONS:' as info;
SELECT kdkec, nmkec, kddesa, nmdesa 
FROM desa_c_detail;

-- Tampilkan duplikasi untuk investigasi
SELECT 'DUPLICATE CHECK:' as info;
SELECT kdkec, nmkec, kddesa, flag_sampel, duplicate_count
FROM duplicate_check;

-- Verifikasi kasus-kasus duplikasi spesifik yang ditemukan dalam analisis manual
SELECT 'SPECIFIC DUPLICATES VERIFICATION:' as info;

-- Cek JANGKANG BENUA di kecamatan JANGKANG
SELECT 'JANGKANG BENUA cases:' as case_type, kdkec, nmkec, kddesa, nmdesa, flag_sampel, COUNT(*) as count
FROM skgb_penggilingan 
WHERE kdkab = '6105' 
  AND tahun = 2025
  AND nmdesa = 'JANGKANG BENUA'
  AND nmkec = 'JANGKANG'
GROUP BY kdkec, nmkec, kddesa, nmdesa, flag_sampel
ORDER BY flag_sampel

UNION ALL

-- Cek TANGGUNG di kecamatan JANGKANG
SELECT 'TANGGUNG cases:' as case_type, kdkec, nmkec, kddesa, nmdesa, flag_sampel, COUNT(*) as count
FROM skgb_penggilingan 
WHERE kdkab = '6105' 
  AND tahun = 2025
  AND nmdesa = 'TANGGUNG'
  AND nmkec = 'JANGKANG'
GROUP BY kdkec, nmkec, kddesa, nmdesa, flag_sampel
ORDER BY flag_sampel

UNION ALL

-- Cek SEI TEKAM di kecamatan SEKAYAM
SELECT 'SEI TEKAM cases:' as case_type, kdkec, nmkec, kddesa, nmdesa, flag_sampel, COUNT(*) as count
FROM skgb_penggilingan 
WHERE kdkab = '6105' 
  AND tahun = 2025
  AND nmdesa = 'SEI TEKAM'
  AND nmkec = 'SEKAYAM'
GROUP BY kdkec, nmkec, kddesa, nmdesa, flag_sampel
ORDER BY flag_sampel;
