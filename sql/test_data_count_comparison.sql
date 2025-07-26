-- Test Data Count Comparison
-- File: sql/test_data_count_comparison.sql

-- 1. Count total records in ubinan_raw for 2024 Padi Sawah
SELECT 
    'Total Raw Records' as description,
    COUNT(*) as count 
FROM ubinan_raw 
WHERE tahun = '2024' 
  AND komoditas LIKE '%Padi Sawah%'
  AND r701 IS NOT NULL 
  AND r702 IS NOT NULL
  AND r701::TEXT ~ '^[0-9]*\.?[0-9]+$'
  AND r702::TEXT ~ '^[0-9]*\.?[0-9]+$'

UNION ALL

-- 2. Count records returned by RPC function
SELECT 
    'RPC Function Records' as description,
    COUNT(*) as count
FROM get_ubinan_scatter_plot_data(2024, '%Padi Sawah%', 'all', 'r702', 'r701')

UNION ALL

-- 3. Count by subround
SELECT 
    CONCAT('Subround ', subround, ' Records') as description,
    COUNT(*) as count
FROM ubinan_raw 
WHERE tahun = '2024' 
  AND komoditas LIKE '%Padi Sawah%'
  AND r701 IS NOT NULL 
  AND r702 IS NOT NULL
  AND r701::TEXT ~ '^[0-9]*\.?[0-9]+$'
  AND r702::TEXT ~ '^[0-9]*\.?[0-9]+$'
GROUP BY subround
ORDER BY description;

-- 4. Sample data untuk verifikasi
SELECT 
    'Sample Data' as title,
    kab,
    nama_kabupaten,
    x_value,
    y_value,
    komoditas,
    subround,
    tahun
FROM get_ubinan_scatter_plot_data(2024, '%Padi Sawah%', 'all', 'r702', 'r701')
LIMIT 20;

-- 5. Check distinct values
SELECT 
    'Distinct Values Check' as title,
    COUNT(DISTINCT kab) as distinct_kab,
    COUNT(DISTINCT subround) as distinct_subround,
    COUNT(DISTINCT komoditas) as distinct_komoditas,
    MIN(x_value) as min_x,
    MAX(x_value) as max_x,
    MIN(y_value) as min_y,
    MAX(y_value) as max_y
FROM get_ubinan_scatter_plot_data(2024, '%Padi Sawah%', 'all', 'r702', 'r701');
