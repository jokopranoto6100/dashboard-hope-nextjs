-- SQL for SKGB Detail RPC Function
-- This function provides detailed data for a specific kabupaten showing kecamatan and lokasi breakdown
-- To be implemented in Supabase Database

CREATE OR REPLACE FUNCTION get_skgb_detail_by_kabupaten(
  p_kode_kab TEXT,
  p_tahun INTEGER
)
RETURNS TABLE (
  kecamatan TEXT,
  kode_kec TEXT,
  lokasi TEXT,
  target_utama BIGINT,
  cadangan BIGINT,
  realisasi BIGINT,
  persentase NUMERIC
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH detail_aggregation AS (
    SELECT 
      COALESCE(sp.nmkec, 'Unknown') as kecamatan,
      COALESCE(sp.kdkec, 'Unknown') as kode_kec,
      COALESCE(sp.lokasi, 'Unknown') as lokasi,
      -- Target Utama: flag_sampel = 'U'
      COUNT(CASE WHEN sp.flag_sampel = 'U' THEN 1 END) as target_utama,
      -- Cadangan: flag_sampel = 'C'  
      COUNT(CASE WHEN sp.flag_sampel = 'C' THEN 1 END) as cadangan,
      -- Realisasi: status_pendataan = 'Selesai Didata'
      COUNT(CASE WHEN sp.status_pendataan = 'Selesai Didata' THEN 1 END) as realisasi
    FROM skgb_pengeringan sp
    WHERE sp.kdkab = p_kode_kab
      AND EXTRACT(YEAR FROM sp.created_at) = p_tahun
    GROUP BY sp.nmkec, sp.kdkec, sp.lokasi
  )
  SELECT 
    da.kecamatan,
    da.kode_kec,
    da.lokasi,
    da.target_utama,
    da.cadangan,
    da.realisasi,
    -- Calculate percentage: realisasi / target_utama * 100
    CASE 
      WHEN da.target_utama > 0 THEN 
        ROUND((da.realisasi::NUMERIC / da.target_utama::NUMERIC) * 100, 2)
      ELSE 0 
    END as persentase
  FROM detail_aggregation da
  ORDER BY da.kode_kec, da.lokasi;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_skgb_detail_by_kabupaten(TEXT, INTEGER) TO authenticated;

-- Example usage:
-- SELECT * FROM get_skgb_detail_by_kabupaten('1101', 2024);

/*
Expected output format:
kecamatan | kode_kec | lokasi      | target_utama | cadangan | realisasi | persentase
----------|----------|-------------|--------------|----------|-----------|------------
Meuraxa   | 110101   | Desa A      | 10           | 5        | 8         | 80.00
Meuraxa   | 110101   | Desa B      | 15           | 3        | 12        | 80.00
Kuta Alam | 110102   | Desa C      | 8            | 2        | 6         | 75.00
...
*/
