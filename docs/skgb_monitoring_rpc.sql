-- ========================================
-- RPC Function untuk SKGB Monitoring Data
-- ========================================
-- File: skgb_monitoring_rpc.sql
-- 
-- Fungsi ini akan mengembalikan data monitoring SKGB yang sudah diproses
-- berdasarkan kabupaten dengan kolom:
-- - kabupaten: nama kabupaten
-- - kode_kab: kode kabupaten (untuk sorting)
-- - target_utama: jumlah data dengan flag_sampel = 'U'
-- - cadangan: jumlah data dengan flag_sampel = 'C'
-- - realisasi: jumlah data dengan status_pendataan = 'Selesai Didata'
-- - persentase: (realisasi/target_utama) * 100
-- - jumlah_petugas: jumlah petugas per kabupaten (data riil berdasarkan lapangan)

CREATE OR REPLACE FUNCTION get_skgb_monitoring_data(p_tahun INTEGER DEFAULT NULL)
RETURNS TABLE (
    kabupaten TEXT,
    kode_kab TEXT,
    target_utama BIGINT,
    cadangan BIGINT,
    realisasi BIGINT,
    persentase NUMERIC(5,2),
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
            COUNT(CASE WHEN sp.flag_sampel = 'U' THEN 1 END) as target_utama,
            COUNT(CASE WHEN sp.flag_sampel = 'C' THEN 1 END) as cadangan,
            COUNT(CASE WHEN sp.status_pendataan = 'Selesai Didata' THEN 1 END) as realisasi,
            CASE 
                WHEN COUNT(CASE WHEN sp.flag_sampel = 'U' THEN 1 END) > 0 THEN
                    ROUND(
                        (COUNT(CASE WHEN sp.status_pendataan = 'Selesai Didata' THEN 1 END)::NUMERIC / 
                         COUNT(CASE WHEN sp.flag_sampel = 'U' THEN 1 END)::NUMERIC) * 100, 
                        2
                    )
                ELSE 0
            END as persentase
        FROM skgb_pengeringan sp
        WHERE (p_tahun IS NULL OR sp.tahun = p_tahun)
            AND sp.nmkab IS NOT NULL 
            AND sp.kdkab IS NOT NULL
        GROUP BY sp.nmkab, sp.kdkab
    ),
    petugas_mapping AS (
        SELECT '6101'::TEXT as kode_kab, 5 as jumlah_petugas  -- Banda Aceh
        UNION SELECT '6102', 5   -- Sabang
        UNION SELECT '6103', 5   -- Aceh Selatan
        UNION SELECT '6104', 4   -- Aceh Tenggara
        UNION SELECT '6105', 2   -- Aceh Timur
        UNION SELECT '6106', 5   -- Aceh Tengah
        UNION SELECT '6107', 2   -- Aceh Barat
        UNION SELECT '6108', 1   -- Aceh Besar
        UNION SELECT '6109', 2   -- Pidie
        UNION SELECT '6110', 2   -- Bireuen
        UNION SELECT '6111', 2   -- Aceh Utara
        UNION SELECT '6112', 3   -- Aceh Barat Daya
        UNION SELECT '6171', 0   -- Kota Banda Aceh
        UNION SELECT '6172', 3   -- Kota Sabang
    )
    SELECT 
        kd.kabupaten,
        kd.kode_kab,
        kd.target_utama,
        kd.cadangan,
        kd.realisasi,
        kd.persentase,
        COALESCE(pm.jumlah_petugas, 0) as jumlah_petugas
    FROM kabupaten_data kd
    LEFT JOIN petugas_mapping pm ON kd.kode_kab = pm.kode_kab
    ORDER BY kd.kode_kab ASC;
END;
$$;

-- Grant permission to authenticated users
GRANT EXECUTE ON FUNCTION get_skgb_monitoring_data(INTEGER) TO authenticated;

-- Example usage:
-- SELECT * FROM get_skgb_monitoring_data(2024);
-- SELECT * FROM get_skgb_monitoring_data(); -- semua tahun

/*
Expected output format with new jumlah_petugas column:
kabupaten    | kode_kab | target_utama | cadangan | realisasi | persentase | jumlah_petugas
-------------|----------|--------------|----------|-----------|------------|---------------
Banda Aceh   | 6101     | 150          | 30       | 120       | 80.00      | 5
Sabang       | 6102     | 85           | 15       | 70        | 82.35      | 3
...          | ...      | ...          | ...      | ...       | ...        | ...
*/
