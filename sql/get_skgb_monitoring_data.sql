-- RPC Function untuk monitoring SKGB Pengeringan per kabupaten
-- Similar to get_skgb_penggilingan_monitoring_data but for pengeringan table

CREATE OR REPLACE FUNCTION get_skgb_monitoring_data(
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
            COUNT(CASE WHEN sp.status_pendataan = '1. Berhasil diwawancarai' THEN 1 END)::INTEGER as realisasi,
            CASE 
                WHEN COUNT(CASE WHEN sp.flag_sampel = 'U' THEN 1 END) > 0 THEN
                    ROUND(
                        (COUNT(CASE WHEN sp.status_pendataan = '1. Berhasil diwawancarai' THEN 1 END)::NUMERIC / 
                         COUNT(CASE WHEN sp.flag_sampel = 'U' THEN 1 END)::NUMERIC) * 100, 
                        2
                    )
                ELSE 0
            END as persentase
        FROM skgb_pengeringan sp
        WHERE (p_tahun IS NULL OR EXTRACT(YEAR FROM sp.created_at) = p_tahun)
            AND sp.nmkab IS NOT NULL 
            AND sp.kdkab IS NOT NULL
        GROUP BY sp.nmkab, sp.kdkab
    ),
    petugas_mapping AS (
        SELECT '6101'::TEXT as kode_kab, 5 as jumlah_petugas
        UNION SELECT '6102', 5   
        UNION SELECT '6103', 5   
        UNION SELECT '6104', 4   
        UNION SELECT '6105', 2  
        UNION SELECT '6106', 5   
        UNION SELECT '6107', 2   
        UNION SELECT '6108', 1   
        UNION SELECT '6109', 2  
        UNION SELECT '6110', 2   
        UNION SELECT '6111', 2   
        UNION SELECT '6112', 3   
        UNION SELECT '6171', 0   
        UNION SELECT '6172', 3   
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
