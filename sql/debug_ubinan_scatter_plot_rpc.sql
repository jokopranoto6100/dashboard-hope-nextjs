-- Debug RPC Function untuk Scatter Plot Ubinan - No Grouping Version
-- File: sql/debug_ubinan_scatter_plot_rpc.sql

-- Drop existing function first
DROP FUNCTION IF EXISTS get_ubinan_scatter_plot_data(INTEGER, TEXT, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION get_ubinan_scatter_plot_data(
    tahun_val INTEGER,
    komoditas_val TEXT,
    subround_filter TEXT DEFAULT 'all',
    x_variable TEXT DEFAULT 'r702',
    y_variable TEXT DEFAULT 'r701'
)
RETURNS TABLE (
    kab INTEGER,
    nama_kabupaten TEXT,
    x_value NUMERIC,
    y_value NUMERIC,
    record_count INTEGER,
    komoditas TEXT,
    subround INTEGER,
    tahun INTEGER
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ur.kab::INTEGER,
        CASE 
            WHEN ur.kab::INTEGER = 1 THEN 'Sambas'
            WHEN ur.kab::INTEGER = 2 THEN 'Bengkayang'
            WHEN ur.kab::INTEGER = 3 THEN 'Landak'
            WHEN ur.kab::INTEGER = 4 THEN 'Mempawah'
            WHEN ur.kab::INTEGER = 5 THEN 'Sanggau'
            WHEN ur.kab::INTEGER = 6 THEN 'Ketapang'
            WHEN ur.kab::INTEGER = 7 THEN 'Sintang'
            WHEN ur.kab::INTEGER = 8 THEN 'Kapuas Hulu'
            WHEN ur.kab::INTEGER = 9 THEN 'Sekadau'
            WHEN ur.kab::INTEGER = 10 THEN 'Melawi'
            WHEN ur.kab::INTEGER = 11 THEN 'Kayong Utara'
            WHEN ur.kab::INTEGER = 12 THEN 'Kubu Raya'
            WHEN ur.kab::INTEGER = 71 THEN 'Pontianak'
            WHEN ur.kab::INTEGER = 72 THEN 'Singkawang'
            ELSE 'Unknown'
        END::TEXT,
        (CASE 
            WHEN x_variable = 'r701' THEN COALESCE(ur.r701::NUMERIC, 0)
            WHEN x_variable = 'r702' THEN COALESCE(ur.r702::NUMERIC, 0)
            WHEN x_variable = 'r608' THEN COALESCE(ur.r608::NUMERIC, 0)
            ELSE 0
        END)::NUMERIC,
        (CASE 
            WHEN y_variable = 'r701' THEN COALESCE(ur.r701::NUMERIC, 0)
            WHEN y_variable = 'r702' THEN COALESCE(ur.r702::NUMERIC, 0)
            WHEN y_variable = 'r608' THEN COALESCE(ur.r608::NUMERIC, 0)
            ELSE 0
        END)::NUMERIC,
        1::INTEGER, -- Individual record count
        ur.komoditas::TEXT,
        ur.subround::TEXT::INTEGER,
        ur.tahun::TEXT::INTEGER
    FROM ubinan_raw ur
    WHERE ur.tahun::TEXT = tahun_val::TEXT
      AND ur.komoditas LIKE komoditas_val
      AND (subround_filter = 'all' OR ur.subround::TEXT = subround_filter)
      AND ur.r701 IS NOT NULL 
      AND ur.r702 IS NOT NULL
      AND ur.r701::TEXT ~ '^[0-9]*\.?[0-9]+$'
      AND ur.r702::TEXT ~ '^[0-9]*\.?[0-9]+$'
    ORDER BY ur.kab::INTEGER, ur.komoditas, ur.subround;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_ubinan_scatter_plot_data TO authenticated;

-- Test queries with correct komoditas format
-- Test 1: Count total records for comparison
-- SELECT COUNT(*) as total_raw_records FROM ubinan_raw WHERE tahun = '2024' AND komoditas LIKE '%Padi Sawah%';

-- Test 2: Get scatter plot data and count
-- SELECT COUNT(*) as scatter_plot_records FROM get_ubinan_scatter_plot_data(2024, '%Padi Sawah%', 'all', 'r702', 'r701');

-- Test 3: Sample data
-- SELECT * FROM get_ubinan_scatter_plot_data(2024, '%Padi Sawah%', 'all', 'r702', 'r701') LIMIT 10;

-- Test 4: Check specific subround
-- SELECT * FROM get_ubinan_scatter_plot_data(2025, '%Padi Sawah%', '1', 'r702', 'r701') LIMIT 10;
