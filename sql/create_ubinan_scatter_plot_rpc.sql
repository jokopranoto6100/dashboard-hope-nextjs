-- RPC Function untuk Dynamic Scatter Plot Ubinan
-- File: sql/create_ubinan_scatter_plot_rpc.sql

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
    EXECUTE format('
        SELECT 
            ur.kab,
            CASE 
                WHEN ur.kab = 1 THEN ''Sambas''
                WHEN ur.kab = 2 THEN ''Bengkayang''
                WHEN ur.kab = 3 THEN ''Landak''
                WHEN ur.kab = 4 THEN ''Mempawah''
                WHEN ur.kab = 5 THEN ''Sanggau''
                WHEN ur.kab = 6 THEN ''Ketapang''
                WHEN ur.kab = 7 THEN ''Sintang''
                WHEN ur.kab = 8 THEN ''Kapuas Hulu''
                WHEN ur.kab = 9 THEN ''Sekadau''
                WHEN ur.kab = 10 THEN ''Melawi''
                WHEN ur.kab = 11 THEN ''Kayong Utara''
                WHEN ur.kab = 12 THEN ''Kubu Raya''
                WHEN ur.kab = 71 THEN ''Pontianak''
                WHEN ur.kab = 72 THEN ''Singkawang''
                ELSE ''Tidak Diketahui''
            END as nama_kabupaten,
            ur.%I::NUMERIC as x_value,
            ur.%I::NUMERIC as y_value,
            COUNT(*)::INTEGER as record_count,
            ur.komoditas,
            ur.subround,
            ur.tahun
        FROM ubinan_raw ur
        WHERE ur.tahun = %L
          AND ur.komoditas = %L
          AND (%L = ''all'' OR ur.subround = %L::INTEGER)
          AND ur.%I IS NOT NULL 
          AND ur.%I IS NOT NULL
          AND ur.%I::TEXT ~ ''^[0-9]*\.?[0-9]+$''
          AND ur.%I::TEXT ~ ''^[0-9]*\.?[0-9]+$''
          AND ur.%I::NUMERIC > 0
          AND ur.%I::NUMERIC > 0
        GROUP BY ur.kab, ur.komoditas, ur.subround, ur.tahun, ur.%I::NUMERIC, ur.%I::NUMERIC
        ORDER BY ur.kab, ur.%I::NUMERIC, ur.%I::NUMERIC',
        x_variable, y_variable,
        tahun_val, komoditas_val, 
        subround_filter, subround_filter,
        x_variable, y_variable,
        x_variable, y_variable,
        x_variable, y_variable,
        x_variable, y_variable,
        x_variable, y_variable
    );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_ubinan_scatter_plot_data TO authenticated;

-- Example usage:
-- SELECT * FROM get_ubinan_scatter_plot_data(2024, 'Padi', 'all', 'r702', 'r701');
-- SELECT * FROM get_ubinan_scatter_plot_data(2024, 'Padi', '1', 'r608', 'r701');
-- SELECT * FROM get_ubinan_scatter_plot_data(2024, 'Jagung', 'all', 'r610_1', 'r701');
