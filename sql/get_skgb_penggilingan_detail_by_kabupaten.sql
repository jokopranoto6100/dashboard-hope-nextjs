-- RPC Function untuk detail SKGB Penggilingan per kabupaten (kecamatan + desa level)
-- Different from pengeringan: includes desa level detail

CREATE OR REPLACE FUNCTION get_skgb_penggilingan_detail_by_kabupaten(
  p_kode_kab TEXT,
  p_tahun INTEGER
)
RETURNS TABLE (
  kecamatan TEXT,
  kode_kec TEXT,
  desa TEXT,
  kode_desa TEXT,
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
      COALESCE(sp.nmdesa, 'Unknown') as desa,
      COALESCE(sp.kddesa, 'Unknown') as kode_desa,
      -- Target Utama: flag_sampel = 'U'
      COUNT(CASE WHEN sp.flag_sampel = 'U' THEN 1 END)::INTEGER as target_utama,
      -- Cadangan: flag_sampel = 'C'  
      COUNT(CASE WHEN sp.flag_sampel = 'C' THEN 1 END)::INTEGER as cadangan,
      -- Realisasi: status_pendataan = 'Selesai Didata' AND flag_sampel = 'U'
      COUNT(CASE WHEN sp.status_pendataan = 'Selesai Didata' AND sp.flag_sampel = 'U' THEN 1 END)::INTEGER as realisasi
    FROM skgb_penggilingan sp
    WHERE sp.kdkab = p_kode_kab
      AND sp.tahun = p_tahun
    GROUP BY sp.nmkec, sp.kdkec, sp.nmdesa, sp.kddesa
  )
  SELECT 
    da.kecamatan,
    da.kode_kec,
    da.desa,
    da.kode_desa,
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
  ORDER BY da.kode_kec, da.kode_desa;
END;
$$;
