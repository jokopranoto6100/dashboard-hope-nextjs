-- Query untuk debugging dan pengecekan RPC get_skgb_summary_by_kabupaten_v2
-- Jalankan query ini di database untuk memverifikasi logika

-- 1. Cek data mentah untuk kabupaten tertentu
-- Ganti '6101' dengan kode kabupaten yang ingin dicek
-- Ganti 2024 dengan tahun yang ingin dicek
SELECT 
  kdkab,
  kdkec,
  lokasi,
  flag_sampel,
  status_pendataan,
  EXTRACT(YEAR FROM created_at) as tahun,
  created_at
FROM skgb_pengeringan 
WHERE kdkab = '6101' 
  AND EXTRACT(YEAR FROM created_at) = 2024
ORDER BY kdkec, lokasi, flag_sampel;

-- 2. Cek kecamatan stats (sama seperti CTE pertama di RPC)
WITH kecamatan_stats AS (
  SELECT 
    sp.kdkec,
    COUNT(CASE WHEN sp.flag_sampel = 'U' THEN 1 END) as count_u,
    COUNT(CASE WHEN sp.flag_sampel = 'C' THEN 1 END) as count_c,
    COUNT(*) as total_records
  FROM skgb_pengeringan sp
  WHERE sp.kdkab = '6101'
    AND EXTRACT(YEAR FROM sp.created_at) = 2024
  GROUP BY sp.kdkec
)
SELECT 
  kdkec,
  count_u,
  count_c,
  total_records,
  CASE WHEN count_u > 0 THEN 'YES' ELSE 'NO' END as has_flag_u,
  CASE WHEN count_c > 0 THEN 'YES' ELSE 'NO' END as has_flag_c
FROM kecamatan_stats
ORDER BY kdkec;

-- 3. Cek desa stats (sama seperti CTE kedua di RPC)
WITH desa_stats AS (
  SELECT 
    sp.lokasi,
    sp.kdkec,
    COUNT(CASE WHEN sp.flag_sampel = 'U' THEN 1 END) as count_u,
    COUNT(CASE WHEN sp.flag_sampel = 'C' THEN 1 END) as count_c,
    COUNT(*) as total_records
  FROM skgb_pengeringan sp
  WHERE sp.kdkab = '6101'
    AND EXTRACT(YEAR FROM sp.created_at) = 2024
  GROUP BY sp.lokasi, sp.kdkec
)
SELECT 
  kdkec,
  lokasi,
  count_u,
  count_c,
  total_records,
  CASE WHEN count_u > 0 THEN 'YES' ELSE 'NO' END as has_flag_u,
  CASE WHEN count_c > 0 THEN 'YES' ELSE 'NO' END as has_flag_c
FROM desa_stats
ORDER BY kdkec, lokasi;

-- 4. Cek summary final (verifikasi hasil RPC)
WITH kecamatan_stats AS (
  SELECT 
    sp.kdkec,
    COUNT(CASE WHEN sp.flag_sampel = 'U' THEN 1 END) as count_u,
    COUNT(CASE WHEN sp.flag_sampel = 'C' THEN 1 END) as count_c
  FROM skgb_pengeringan sp
  WHERE sp.kdkab = '6101'
    AND EXTRACT(YEAR FROM sp.created_at) = 2024
  GROUP BY sp.kdkec
),
desa_stats AS (
  SELECT 
    sp.lokasi,
    COUNT(CASE WHEN sp.flag_sampel = 'U' THEN 1 END) as count_u,
    COUNT(CASE WHEN sp.flag_sampel = 'C' THEN 1 END) as count_c
  FROM skgb_pengeringan sp
  WHERE sp.kdkab = '6101'
    AND EXTRACT(YEAR FROM sp.created_at) = 2024
  GROUP BY sp.lokasi
),
summary_data AS (
  SELECT 
    -- Count kecamatan yang memiliki minimal 1 flag_sampel = 'U'
    (SELECT COUNT(*) FROM kecamatan_stats WHERE count_u > 0) as total_kecamatan_u,
    -- Count kecamatan yang memiliki minimal 1 flag_sampel = 'C'
    (SELECT COUNT(*) FROM kecamatan_stats WHERE count_c > 0) as total_kecamatan_c,
    -- Count desa yang memiliki minimal 1 flag_sampel = 'U'
    (SELECT COUNT(*) FROM desa_stats WHERE count_u > 0) as total_desa_u,
    -- Count desa yang memiliki minimal 1 flag_sampel = 'C'
    (SELECT COUNT(*) FROM desa_stats WHERE count_c > 0) as total_desa_c,
    -- Target Utama: total record dengan flag_sampel = 'U'
    COUNT(CASE WHEN sp.flag_sampel = 'U' THEN 1 END) as target_utama,
    -- Cadangan: total record dengan flag_sampel = 'C'  
    COUNT(CASE WHEN sp.flag_sampel = 'C' THEN 1 END) as cadangan,
    -- Realisasi: total record dengan status_pendataan = 'Selesai Didata' AND flag_sampel = 'U'
    COUNT(CASE WHEN sp.status_pendataan = 'Selesai Didata' AND sp.flag_sampel = 'U' THEN 1 END) as realisasi
  FROM skgb_pengeringan sp
  WHERE sp.kdkab = '6101'
    AND EXTRACT(YEAR FROM sp.created_at) = 2024
)
SELECT 
  total_kecamatan_u,
  total_kecamatan_c,
  total_desa_u,
  total_desa_c,
  target_utama,
  cadangan,
  realisasi,
  -- Calculate percentage: realisasi / target_utama * 100
  CASE 
    WHEN target_utama > 0 THEN 
      ROUND((realisasi::NUMERIC / target_utama::NUMERIC) * 100, 2)
    ELSE 0 
  END as persentase
FROM summary_data;

-- 5. Test RPC function langsung
SELECT * FROM get_skgb_summary_by_kabupaten_v2('6101', 2024);

-- 6. Verifikasi manual count dengan method sederhana
-- Count kecamatan dengan flag U
SELECT COUNT(DISTINCT kdkec) as kecamatan_dengan_flag_u
FROM skgb_pengeringan 
WHERE kdkab = '6101' 
  AND EXTRACT(YEAR FROM created_at) = 2024
  AND flag_sampel = 'U';

-- Count kecamatan dengan flag C  
SELECT COUNT(DISTINCT kdkec) as kecamatan_dengan_flag_c
FROM skgb_pengeringan 
WHERE kdkab = '6101' 
  AND EXTRACT(YEAR FROM created_at) = 2024
  AND flag_sampel = 'C';

-- Count desa dengan flag U
SELECT COUNT(DISTINCT lokasi) as desa_dengan_flag_u
FROM skgb_pengeringan 
WHERE kdkab = '6101' 
  AND EXTRACT(YEAR FROM created_at) = 2024
  AND flag_sampel = 'U';

-- Count desa dengan flag C
SELECT COUNT(DISTINCT lokasi) as desa_dengan_flag_c
FROM skgb_pengeringan 
WHERE kdkab = '6101' 
  AND EXTRACT(YEAR FROM created_at) = 2024
  AND flag_sampel = 'C';

-- 7. Cek apakah ada kecamatan/desa yang memiliki KEDUA flag U dan C
SELECT 
  'Kecamatan' as level,
  kdkec as nama,
  COUNT(CASE WHEN flag_sampel = 'U' THEN 1 END) as count_u,
  COUNT(CASE WHEN flag_sampel = 'C' THEN 1 END) as count_c
FROM skgb_pengeringan 
WHERE kdkab = '6101' 
  AND EXTRACT(YEAR FROM created_at) = 2024
GROUP BY kdkec
HAVING COUNT(CASE WHEN flag_sampel = 'U' THEN 1 END) > 0 
   AND COUNT(CASE WHEN flag_sampel = 'C' THEN 1 END) > 0

UNION ALL

SELECT 
  'Desa' as level,
  lokasi as nama,
  COUNT(CASE WHEN flag_sampel = 'U' THEN 1 END) as count_u,
  COUNT(CASE WHEN flag_sampel = 'C' THEN 1 END) as count_c
FROM skgb_pengeringan 
WHERE kdkab = '6101' 
  AND EXTRACT(YEAR FROM created_at) = 2024
GROUP BY lokasi
HAVING COUNT(CASE WHEN flag_sampel = 'U' THEN 1 END) > 0 
   AND COUNT(CASE WHEN flag_sampel = 'C' THEN 1 END) > 0;
