-- RPC Function untuk detail SKGB Pengeringan per kabupaten
-- Returns detail data grouped by kecamatan and location

CREATE OR REPLACE FUNCTION get_skgb_detail_by_kabupaten(
  p_kode_kab TEXT,
  p_tahun INTEGER
)
RETURNS TABLE (
  kecamatan TEXT,
  kode_kec TEXT,
  lokasi TEXT,
  target_utama INTEGER,
  cadangan INTEGER,
  realisasi INTEGER,
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
      COUNT(CASE WHEN sp.flag_sampel = 'U' THEN 1 END)::INTEGER as target_utama,
      -- Cadangan: flag_sampel = 'C'  
      COUNT(CASE WHEN sp.flag_sampel = 'C' THEN 1 END)::INTEGER as cadangan,
      -- Realisasi: status_pendataan = '1. Berhasil diwawancarai'
      COUNT(CASE WHEN sp.status_pendataan = '1. Berhasil diwawancarai' THEN 1 END)::INTEGER as realisasi
    FROM skgb_pengeringan sp
    WHERE sp.kdkab = p_kode_kab
      AND EXTRACT(YEAR FROM sp.created_at) = p_tahun
    GROUP BY sp.nmkec, sp.kdkec, sp.lokasi
  )
  SELECT 
    da.kecamatan::TEXT,
    da.kode_kec::TEXT,
    da.lokasi::TEXT,
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
