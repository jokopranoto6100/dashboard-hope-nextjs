-- Standardized Scatter Plot RPC Function dengan Konversi Per Hektar
-- File: sql/standardized_scatter_plot_rpc.sql

-- Drop existing function first
DROP FUNCTION IF EXISTS get_ubinan_scatter_plot_standardized(INTEGER, TEXT, TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION get_ubinan_scatter_plot_standardized(
    tahun_val INTEGER,
    komoditas_val TEXT,
    subround_filter TEXT DEFAULT 'all',
    x_variable TEXT DEFAULT 'r702_per_ha',
    y_variable TEXT DEFAULT 'r701_per_ha'
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
    x_var_base TEXT;
    y_var_base TEXT;
BEGIN
    -- Extract base variable names (remove _per_ha suffix)
    x_var_base := REPLACE(x_variable, '_per_ha', '');
    y_var_base := REPLACE(y_variable, '_per_ha', '');
    
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
        -- X Variable dengan standardisasi per hektar
        (CASE 
            -- r701: kg/plot -> ku/ha (1 plot = 6.25m², 1 ha = 10,000m², convert kg to ku)
            WHEN x_var_base = 'r701' THEN COALESCE(ur.r701::NUMERIC * 16, 0) -- 1600/100 = 16
            
            -- r702: rumpun -> tetap rumpun/plot (TIDAK dikonversi per hektar)
            WHEN x_var_base = 'r702' THEN 
                CASE 
                    WHEN ur.r702 IS NOT NULL THEN ur.r702::NUMERIC
                    ELSE 0 
                END
            
            -- r608, r610_*: kg per luas r604 -> kg/ha
            WHEN x_var_base = 'r608' THEN 
                CASE 
                    WHEN COALESCE(ur.r604::NUMERIC, 0) > 0 THEN 
                        COALESCE(ur.r608::NUMERIC, 0) * 10000 / ur.r604::NUMERIC
                    ELSE 0 
                END
            WHEN x_var_base = 'r610_1' THEN 
                CASE 
                    WHEN COALESCE(ur.r604::NUMERIC, 0) > 0 THEN 
                        COALESCE(ur.r610_1::NUMERIC, 0) * 10000 / ur.r604::NUMERIC
                    ELSE 0 
                END
            WHEN x_var_base = 'r610_2' THEN 
                CASE 
                    WHEN COALESCE(ur.r604::NUMERIC, 0) > 0 THEN 
                        COALESCE(ur.r610_2::NUMERIC, 0) * 10000 / ur.r604::NUMERIC
                    ELSE 0 
                END
            WHEN x_var_base = 'r610_3' THEN 
                CASE 
                    WHEN COALESCE(ur.r604::NUMERIC, 0) > 0 THEN 
                        COALESCE(ur.r610_3::NUMERIC, 0) * 10000 / ur.r604::NUMERIC
                    ELSE 0 
                END
            WHEN x_var_base = 'r610_4' THEN 
                CASE 
                    WHEN COALESCE(ur.r604::NUMERIC, 0) > 0 THEN 
                        COALESCE(ur.r610_4::NUMERIC, 0) * 10000 / ur.r604::NUMERIC
                    ELSE 0 
                END
            WHEN x_var_base = 'r610_5' THEN 
                CASE 
                    WHEN COALESCE(ur.r604::NUMERIC, 0) > 0 THEN 
                        COALESCE(ur.r610_5::NUMERIC, 0) * 10000 / ur.r604::NUMERIC
                    ELSE 0 
                END
            WHEN x_var_base = 'r610_6' THEN 
                CASE 
                    WHEN COALESCE(ur.r604::NUMERIC, 0) > 0 THEN 
                        COALESCE(ur.r610_6::NUMERIC, 0) * 10000 / ur.r604::NUMERIC
                    ELSE 0 
                END
            WHEN x_var_base = 'r610_7' THEN 
                CASE 
                    WHEN COALESCE(ur.r604::NUMERIC, 0) > 0 THEN 
                        COALESCE(ur.r610_7::NUMERIC, 0) * 10000 / ur.r604::NUMERIC
                    ELSE 0 
                END
            ELSE 0
        END)::NUMERIC,
        -- Y Variable dengan standardisasi per hektar (same logic as X)
        (CASE 
            WHEN y_var_base = 'r701' THEN COALESCE(ur.r701::NUMERIC * 16, 0) -- kg/plot -> ku/ha
            WHEN y_var_base = 'r702' THEN COALESCE(ur.r702::NUMERIC, 0) -- TIDAK dikalikan 16
            WHEN y_var_base = 'r608' THEN 
                CASE 
                    WHEN COALESCE(ur.r604::NUMERIC, 0) > 0 THEN 
                        COALESCE(ur.r608::NUMERIC, 0) * 10000 / ur.r604::NUMERIC
                    ELSE 0 
                END
            WHEN y_var_base = 'r610_1' THEN 
                CASE 
                    WHEN COALESCE(ur.r604::NUMERIC, 0) > 0 THEN 
                        COALESCE(ur.r610_1::NUMERIC, 0) * 10000 / ur.r604::NUMERIC
                    ELSE 0 
                END
            WHEN y_var_base = 'r610_2' THEN 
                CASE 
                    WHEN COALESCE(ur.r604::NUMERIC, 0) > 0 THEN 
                        COALESCE(ur.r610_2::NUMERIC, 0) * 10000 / ur.r604::NUMERIC
                    ELSE 0 
                END
            WHEN y_var_base = 'r610_3' THEN 
                CASE 
                    WHEN COALESCE(ur.r604::NUMERIC, 0) > 0 THEN 
                        COALESCE(ur.r610_3::NUMERIC, 0) * 10000 / ur.r604::NUMERIC
                    ELSE 0 
                END
            WHEN y_var_base = 'r610_4' THEN 
                CASE 
                    WHEN COALESCE(ur.r604::NUMERIC, 0) > 0 THEN 
                        COALESCE(ur.r610_4::NUMERIC, 0) * 10000 / ur.r604::NUMERIC
                    ELSE 0 
                END
            WHEN y_var_base = 'r610_5' THEN 
                CASE 
                    WHEN COALESCE(ur.r604::NUMERIC, 0) > 0 THEN 
                        COALESCE(ur.r610_5::NUMERIC, 0) * 10000 / ur.r604::NUMERIC
                    ELSE 0 
                END
            WHEN y_var_base = 'r610_6' THEN 
                CASE 
                    WHEN COALESCE(ur.r604::NUMERIC, 0) > 0 THEN 
                        COALESCE(ur.r610_6::NUMERIC, 0) * 10000 / ur.r604::NUMERIC
                    ELSE 0 
                END
            WHEN y_var_base = 'r610_7' THEN 
                CASE 
                    WHEN COALESCE(ur.r604::NUMERIC, 0) > 0 THEN 
                        COALESCE(ur.r610_7::NUMERIC, 0) * 10000 / ur.r604::NUMERIC
                    ELSE 0 
                END
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
      AND ur.r604 IS NOT NULL
      AND ur.r604::NUMERIC > 0 -- Pastikan r604 > 0 untuk pembagian
      AND ur.r701::TEXT ~ '^[0-9]*\.?[0-9]+$'
      AND ur.r702::TEXT ~ '^[0-9]*\.?[0-9]+$'
      AND ur.r604::TEXT ~ '^[0-9]*\.?[0-9]+$'
    ORDER BY ur.kab::INTEGER, ur.komoditas, ur.subround;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_ubinan_scatter_plot_standardized TO authenticated;

-- Test queries
-- SELECT * FROM get_ubinan_scatter_plot_standardized(2024, '%Padi Sawah%', 'all', 'r702_per_ha', 'r701_per_ha') LIMIT 10;
-- SELECT COUNT(*) FROM get_ubinan_scatter_plot_standardized(2024, '%Padi Sawah%', 'all', 'r608_per_ha', 'r701_per_ha');
