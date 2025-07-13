-- Test query untuk debug SKGB data dengan satker_id 6171
-- Cek apakah data ada di tabel skgb_pengeringan dan skgb_penggilingan

-- Test 1: Cek data SKGB Pengeringan dengan kdkab = '6171'
SELECT 
  COUNT(*) as total_pengeringan,
  COUNT(CASE WHEN flag_sampel = 'U' THEN 1 END) as flag_u,
  COUNT(CASE WHEN flag_sampel = 'C' THEN 1 END) as flag_c
FROM skgb_pengeringan 
WHERE kdkab = '6171';

-- Test 2: Cek data SKGB Penggilingan dengan kdkab = '6171'
SELECT 
  COUNT(*) as total_penggilingan,
  COUNT(CASE WHEN flag_sampel = 'U' THEN 1 END) as flag_u,
  COUNT(CASE WHEN flag_sampel = 'C' THEN 1 END) as flag_c
FROM skgb_penggilingan 
WHERE kdkab = '6171';

-- Test 3: Cek format kdkab yang ada di database
SELECT DISTINCT kdkab, nmkab 
FROM skgb_pengeringan 
WHERE kdkab LIKE '%617%'
ORDER BY kdkab;

-- Test 4: Cek RPC function apakah ada
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name LIKE '%skgb%' 
AND routine_schema = 'public';
