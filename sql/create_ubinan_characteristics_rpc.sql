-- RPC Function untuk Analisis Karakteristik Sampel Ubinan
-- File: sql/create_ubinan_characteristics_rpc.sql

CREATE OR REPLACE FUNCTION get_ubinan_characteristics_data(
    tahun_val INTEGER,
    komoditas_val TEXT,
    subround_filter TEXT DEFAULT 'all',
    kab_filter INTEGER DEFAULT NULL
)
RETURNS TABLE (
    -- Karakteristik Lahan & Tanam
    luas_lahan_kategori TEXT,
    jenis_lahan TEXT,
    cara_penanaman TEXT,
    jajar_legowo TEXT,
    
    -- Varietas Benih (conditional per komoditas)
    jenis_varietas TEXT,
    
    -- Penggunaan Pupuk
    menggunakan_pupuk TEXT,
    
    -- Dukungan Program
    bantuan_benih TEXT,
    bantuan_pupuk TEXT,
    anggota_poktan TEXT,
    
    -- Summary data
    jumlah_sampel INTEGER,
    rata_rata_luas NUMERIC,
    
    -- Metadata
    kab INTEGER,
    nama_kabupaten TEXT,
    komoditas TEXT,
    subround INTEGER,
    tahun INTEGER
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        -- Kategorisasi luas lahan (konversi dari m² ke ha: dibagi 10,000)
        CASE 
            WHEN (ur.r604::NUMERIC / 10000) < 0.5 THEN 'Gurem (<0.5 ha)'
            WHEN (ur.r604::NUMERIC / 10000) < 1.0 THEN 'Kecil (0.5-1 ha)'
            WHEN (ur.r604::NUMERIC / 10000) < 2.0 THEN 'Sedang (1-2 ha)'
            ELSE 'Besar (>2 ha)'
        END as luas_lahan_kategori,
        
        -- Jenis lahan (hardcoded mapping dengan lebih fleksibel)
        CASE 
            WHEN ur.r601_label = '1 - Sawah irigasi' OR TRIM(LOWER(ur.r601_label)) LIKE '%sawah%irigasi%' THEN 'Sawah Irigasi'
            WHEN ur.r601_label = '2 - Sawah tadah hujan' OR TRIM(LOWER(ur.r601_label)) LIKE '%sawah%tadah%hujan%' THEN 'Sawah Tadah Hujan'
            WHEN ur.r601_label = '3 - Sawah rawa pasang surut' OR TRIM(LOWER(ur.r601_label)) LIKE '%sawah%rawa%pasang%surut%' THEN 'Sawah Rawa Pasang Surut'
            WHEN ur.r601_label = '4 - Sawah rawa lebak' OR TRIM(LOWER(ur.r601_label)) LIKE '%sawah%rawa%lebak%' THEN 'Sawah Rawa Lebak'
            WHEN ur.r601_label = '5 - Bukan sawah' OR TRIM(LOWER(ur.r601_label)) LIKE '%bukan%sawah%' THEN 'Bukan Sawah'
            WHEN ur.r601_label IS NULL OR TRIM(ur.r601_label) = '' THEN 'Tidak Diketahui'
            ELSE CONCAT('Unknown: "', ur.r601_label, '"')
        END as jenis_lahan,
        
        -- Cara penanaman (pastikan tipe data text dengan trim, lebih fleksibel)
        CASE 
            WHEN TRIM(LOWER(ur.r605_value)) IN ('1', '1.0', 'monokultur') THEN 'Monokultur'
            WHEN TRIM(LOWER(ur.r605_value)) IN ('2', '2.0', 'campuran', 'tumpangsari') THEN 'Campuran/Tumpangsari'
            WHEN ur.r605_value IS NULL OR TRIM(ur.r605_value) = '' THEN 'Tidak Diketahui'
            ELSE CONCAT('Unknown: "', ur.r605_value, '"')
        END as cara_penanaman,
        
        -- Sistem jajar legowo (pastikan tipe data text dengan trim, lebih fleksibel)
        CASE 
            WHEN TRIM(LOWER(ur.r606a_value)) IN ('1', '1.0', 'ya', 'y') THEN 'Ya'
            WHEN TRIM(LOWER(ur.r606a_value)) IN ('2', '2.0', 'tidak', 'no', 'n') THEN 'Tidak'
            WHEN ur.r606a_value IS NULL OR TRIM(ur.r606a_value) = '' THEN 'Tidak Diketahui'
            ELSE CONCAT('Unknown: "', ur.r606a_value, '"')
        END as jajar_legowo,
        
        -- Jenis Varietas classification
        CASE 
            WHEN ur.komoditas ILIKE '%padi%' THEN
                CASE 
                    WHEN ur.r609_value IN ('1', '1.0') THEN 'Hibrida'
                    WHEN ur.r609_value IN ('2', '2.0') THEN 'Inbrida'
                    ELSE CONCAT('Unknown Padi: ', ur.r609_value)
                END
            WHEN ur.komoditas ILIKE '%jagung%' THEN
                CASE 
                    WHEN ur.r609_value IN ('21', '21.0') THEN 'Hibrida'
                    WHEN ur.r609_value IN ('22', '22.0') THEN 'Komposit'
                    WHEN ur.r609_value IN ('23', '23.0') THEN 'Lokal'
                    ELSE CONCAT('Unknown Jagung: ', ur.r609_value)
                END
            ELSE CONCAT('Unknown Komoditas: ', ur.komoditas, ' Value: ', ur.r609_value)
        END AS jenis_varietas,
        
        -- Penggunaan pupuk (jika ada salah satu r610_* > 0)
        CASE 
            WHEN COALESCE(ur.r610_1::NUMERIC, 0) > 0 OR 
                 COALESCE(ur.r610_2::NUMERIC, 0) > 0 OR 
                 COALESCE(ur.r610_3::NUMERIC, 0) > 0 OR 
                 COALESCE(ur.r610_4::NUMERIC, 0) > 0 OR 
                 COALESCE(ur.r610_5::NUMERIC, 0) > 0 OR 
                 COALESCE(ur.r610_6::NUMERIC, 0) > 0 OR 
                 COALESCE(ur.r610_7::NUMERIC, 0) > 0 
            THEN 'Menggunakan Pupuk'
            ELSE 'Tidak Menggunakan Pupuk'
        END as menggunakan_pupuk,
        
        -- Bantuan benih (r801a_value adalah text, lebih fleksibel)
        CASE 
            WHEN TRIM(LOWER(ur.r801a_value)) IN ('1', '1.0', 'ya', 'y', 'yes') THEN 'Ya'
            WHEN TRIM(LOWER(ur.r801a_value)) IN ('2', '2.0', 'tidak', 'no', 'n') THEN 'Tidak'
            WHEN ur.r801a_value IS NULL OR TRIM(ur.r801a_value) = '' THEN 'Tidak Diketahui'
            ELSE CONCAT('Unknown: "', ur.r801a_value, '"')
        END as bantuan_benih,
        
        -- Bantuan pupuk (r802a_value adalah text, lebih fleksibel)
        CASE 
            WHEN TRIM(LOWER(ur.r802a_value)) IN ('1', '1.0', 'gratis') THEN 'Ya, Gratis'
            WHEN TRIM(LOWER(ur.r802a_value)) IN ('2', '2.0', 'subsidi') THEN 'Ya, Subsidi Harga'
            WHEN TRIM(LOWER(ur.r802a_value)) IN ('3', '3.0', 'tidak', 'no') THEN 'Tidak'
            WHEN ur.r802a_value IS NULL OR TRIM(ur.r802a_value) = '' THEN 'Tidak Diketahui'
            ELSE CONCAT('Unknown: "', ur.r802a_value, '"')
        END as bantuan_pupuk,
        
        -- Anggota kelompok tani (r803a_value adalah text, lebih fleksibel)
        CASE 
            WHEN TRIM(LOWER(ur.r803a_value)) IN ('1', '1.0', 'ya', 'y', 'yes') THEN 'Ya'
            WHEN TRIM(LOWER(ur.r803a_value)) IN ('2', '2.0', 'tidak', 'no', 'n') THEN 'Tidak'
            WHEN ur.r803a_value IS NULL OR TRIM(ur.r803a_value) = '' THEN 'Tidak Diketahui'
            ELSE CONCAT('Unknown: "', ur.r803a_value, '"')
        END as anggota_poktan,
        
        -- Summary data (konversi rata-rata luas dari m² ke ha)
        COUNT(*)::INTEGER as jumlah_sampel,
        AVG(ur.r604::NUMERIC / 10000) as rata_rata_luas,
        
        -- Metadata
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
        END::TEXT as nama_kabupaten,
        ur.komoditas::TEXT,
        ur.subround::TEXT::INTEGER,
        ur.tahun::TEXT::INTEGER
        
    FROM ubinan_raw ur
    WHERE ur.tahun::TEXT = tahun_val::TEXT
      AND ur.komoditas LIKE komoditas_val
      AND (subround_filter = 'all' OR ur.subround::TEXT = subround_filter)
      AND (kab_filter IS NULL OR ur.kab::INTEGER = kab_filter)
      AND ur.r604 IS NOT NULL 
      AND ur.r604::TEXT ~ '^[0-9]*\.?[0-9]+$'
      AND ur.r604::NUMERIC > 0
      -- Tambahan debug: pastikan ada data untuk field yang bermasalah
      AND (ur.r605_value IS NOT NULL OR ur.r606a_value IS NOT NULL OR ur.r801a_value IS NOT NULL)
    GROUP BY 
        luas_lahan_kategori,
        jenis_lahan,
        cara_penanaman,
        jajar_legowo,
        jenis_varietas,
        menggunakan_pupuk,
        bantuan_benih,
        bantuan_pupuk,
        anggota_poktan,
        ur.kab,
        ur.komoditas,
        ur.subround,
        ur.tahun
    ORDER BY ur.kab::INTEGER, jumlah_sampel DESC;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_ubinan_characteristics_data TO authenticated;

-- Example usage:
-- SELECT * FROM get_ubinan_characteristics_data(2024, '%Padi Sawah%', 'all', NULL);
-- SELECT * FROM get_ubinan_characteristics_data(2024, '%Padi Sawah%', '1', 1);
-- SELECT * FROM get_ubinan_characteristics_data(2024, '%Jagung%', 'all', NULL);

-- Debug query untuk cek nilai unik di field bermasalah:
-- SELECT DISTINCT r609_value, r609_label, komoditas, tahun FROM ubinan_raw WHERE tahun IN ('2024', '2025') AND komoditas ILIKE '%jagung%' ORDER BY komoditas, r609_value;
