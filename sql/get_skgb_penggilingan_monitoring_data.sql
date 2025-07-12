-- RPC Function untuk monitoring SKGB Penggilingan per kabupaten
-- Similar to get_skgb_monitoring_data but for penggilingan table

CREATE OR REPLACE FUNCTION get_skgb_penggilingan_monitoring_data(
  p_tahun INTEGER
)
RETURNS TABLE (
  kabupaten TEXT,
  kode_kab TEXT,
  target_utama INTEGER,
  cadangan INTEGER,
  realisasi INTEGER,
  persentase NUMERIC,
  jumlah_petugas INTEGER
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH kabupaten_data AS (
        SELECT 
            COALESCE(sp.nmkab, 'Unknown')::TEXT as kabupaten,
            COALESCE(sp.kdkab, 'Unknown')::TEXT as kode_kab,
            COUNT(CASE WHEN sp.flag_sampel = 'U' THEN 1 END)::INTEGER as target_utama,
            COUNT(CASE WHEN sp.flag_sampel = 'C' THEN 1 END)::INTEGER as cadangan,
            COUNT(CASE WHEN sp.status_pendataan = 'Selesai Didata' AND sp.flag_sampel = 'U' THEN 1 END)::INTEGER as realisasi,
            CASE 
                WHEN COUNT(CASE WHEN sp.flag_sampel = 'U' THEN 1 END) > 0 THEN
                    ROUND(
                        (COUNT(CASE WHEN sp.status_pendataan = 'Selesai Didata' AND sp.flag_sampel = 'U' THEN 1 END)::NUMERIC / 
                         COUNT(CASE WHEN sp.flag_sampel = 'U' THEN 1 END)::NUMERIC) * 100, 
                        2
                    )
                ELSE 0
            END as persentase
        FROM skgb_penggilingan sp
        WHERE (p_tahun IS NULL OR sp.tahun = p_tahun)
            AND sp.nmkab IS NOT NULL 
            AND sp.kdkab IS NOT NULL
        GROUP BY sp.nmkab, sp.kdkab
    ),
    petugas_mapping AS (
        SELECT '6101'::TEXT as kode_kab, 2 as jumlah_petugas  -- Sambas
        UNION SELECT '6102', 3   -- Bengkayang
        UNION SELECT '6103', 3   -- Landak
        UNION SELECT '6104', 1   -- Mempawah
        UNION SELECT '6105', 3   -- Sanggau
        UNION SELECT '6106', 2   -- Ketapang
        UNION SELECT '6107', 3   -- Sintang
        UNION SELECT '6108', 3   -- Kapuas Hulu
        UNION SELECT '6109', 3   -- Sekadau
        UNION SELECT '6110', 2   -- Melawi
        UNION SELECT '6111', 2   -- Kayong Utara
        UNION SELECT '6112', 2   -- Kbu Raya
        UNION SELECT '6171', 1   -- Kota Pontianak
        UNION SELECT '6172', 1   -- Kota Singkawang
    )
    SELECT 
        kd.kabupaten,
        kd.kode_kab,
        kd.target_utama,
        kd.cadangan,
        kd.realisasi,
        kd.persentase,
        COALESCE(pm.jumlah_petugas, 0)::INTEGER as jumlah_petugas
    FROM kabupaten_data kd
    LEFT JOIN petugas_mapping pm ON kd.kode_kab = pm.kode_kab
    ORDER BY kd.kode_kab ASC;
END;
$$;
