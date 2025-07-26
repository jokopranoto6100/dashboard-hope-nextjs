-- Alternative RPC Function dengan approach berbeda
-- File: sql/alternative_scatter_plot_rpc.sql

-- Drop existing function first
DROP FUNCTION IF EXISTS get_ubinan_scatter_plot_data_v2(INTEGER, TEXT, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION get_ubinan_scatter_plot_data_v2(
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
DECLARE
    sql_query TEXT;
    kabupaten_name TEXT;
BEGIN
    -- Build dynamic query without aggregation to get all individual records
    sql_query := format('
        SELECT 
            ur.kab::INTEGER,
            CASE ur.kab::INTEGER
                WHEN 1 THEN ''Sambas''
                WHEN 2 THEN ''Bengkayang''
                WHEN 3 THEN ''Landak''
                WHEN 4 THEN ''Mempawah''
                WHEN 5 THEN ''Sanggau''
                WHEN 6 THEN ''Ketapang''
                WHEN 7 THEN ''Sintang''
                WHEN 8 THEN ''Kapuas Hulu''
                WHEN 9 THEN ''Sekadau''
                WHEN 10 THEN ''Melawi''
                WHEN 11 THEN ''Kayong Utara''
                WHEN 12 THEN ''Kubu Raya''
                WHEN 71 THEN ''Pontianak''
                WHEN 72 THEN ''Singkawang''
                ELSE ''Unknown''
            END::TEXT,
            COALESCE(ur.%I::NUMERIC, 0)::NUMERIC,
            COALESCE(ur.%I::NUMERIC, 0)::NUMERIC,
            1::INTEGER,
            ur.komoditas::TEXT,
            ur.subround::TEXT::INTEGER,
            ur.tahun::TEXT::INTEGER
        FROM ubinan_raw ur
        WHERE ur.tahun::TEXT = %L
          AND ur.komoditas LIKE %L
          AND (%L = ''all'' OR ur.subround::TEXT = %L)
          AND ur.r701 IS NOT NULL 
          AND ur.r702 IS NOT NULL
          AND ur.r701::TEXT ~ ''^[0-9]*\.?[0-9]+$''
          AND ur.r702::TEXT ~ ''^[0-9]*\.?[0-9]+$''
        ORDER BY ur.kab::INTEGER, ur.komoditas, ur.subround',
        x_variable, 
        y_variable,
        tahun_val::TEXT, 
        komoditas_val, 
        subround_filter, 
        subround_filter
    );
    
    -- Execute dynamic query
    RETURN QUERY EXECUTE sql_query;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_ubinan_scatter_plot_data_v2 TO authenticated;

-- Test queries
-- SELECT COUNT(*) FROM get_ubinan_scatter_plot_data_v2(2024, '%Padi Sawah%', 'all', 'r702', 'r701');
-- SELECT * FROM get_ubinan_scatter_plot_data_v2(2024, '%Padi Sawah%', 'all', 'r702', 'r701') LIMIT 10;
