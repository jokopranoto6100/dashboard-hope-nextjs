-- RPC Function untuk summary SKGB Penggilingan berdasarkan kabupaten dengan breakdown kecamatan dan desa per flag_sampel
-- Similar to get_skgb_summary_by_kabupaten_v2 but for penggilingan table with desa granularity

CREATE OR REPLACE FUNCTION get_skgb_penggilingan_summary_by_kabupaten(
  p_kode_kab TEXT,
  p_tahun INTEGER
)
RETURNS TABLE (
  total_kecamatan_u INTEGER,
  total_kecamatan_c INTEGER,
  total_desa_u INTEGER,
  total_desa_c INTEGER,
  target_utama INTEGER,
  cadangan INTEGER,
  realisasi INTEGER,
  persentase NUMERIC,
  total_petugas INTEGER
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH kecamatan_stats AS (
    -- Get kecamatan-level statistics
    SELECT 
      sp.kdkec,
      COUNT(CASE WHEN sp.flag_sampel = 'U' THEN 1 END)::INTEGER as count_u,
      COUNT(CASE WHEN sp.flag_sampel = 'C' THEN 1 END)::INTEGER as count_c
    FROM skgb_penggilingan sp
    WHERE sp.kdkab = p_kode_kab
      AND sp.tahun = p_tahun
    GROUP BY sp.kdkec
  ),
  desa_stats AS (
    -- Get desa-level statistics (kombinasi kddesa + kdkec untuk handling kode desa yang sama di kecamatan berbeda) 
    SELECT 
      sp.kddesa,
      sp.kdkec,
      COUNT(CASE WHEN sp.flag_sampel = 'U' THEN 1 END)::INTEGER as count_u,
      COUNT(CASE WHEN sp.flag_sampel = 'C' THEN 1 END)::INTEGER as count_c
    FROM skgb_penggilingan sp
    WHERE sp.kdkab = p_kode_kab
      AND sp.tahun = p_tahun
    GROUP BY sp.kddesa, sp.kdkec
  ),
  summary_data AS (
    SELECT 
      -- Count kecamatan yang memiliki minimal 1 flag_sampel = 'U'
      (SELECT COUNT(*)::INTEGER FROM kecamatan_stats WHERE count_u > 0) as total_kecamatan_u,
      -- Count kecamatan yang memiliki minimal 1 flag_sampel = 'C'
      (SELECT COUNT(*)::INTEGER FROM kecamatan_stats WHERE count_c > 0) as total_kecamatan_c,
      -- Count desa yang memiliki minimal 1 flag_sampel = 'U'
      (SELECT COUNT(*)::INTEGER FROM desa_stats WHERE count_u > 0) as total_desa_u,
      -- Count desa yang memiliki minimal 1 flag_sampel = 'C'
      (SELECT COUNT(*)::INTEGER FROM desa_stats WHERE count_c > 0) as total_desa_c,
      -- Total target utama (flag_sampel = 'U')
      (SELECT COUNT(*)::INTEGER FROM skgb_penggilingan sp WHERE sp.kdkab = p_kode_kab AND sp.tahun = p_tahun AND sp.flag_sampel = 'U') as target_utama,
      -- Total cadangan (flag_sampel = 'C')
      (SELECT COUNT(*)::INTEGER FROM skgb_penggilingan sp WHERE sp.kdkab = p_kode_kab AND sp.tahun = p_tahun AND sp.flag_sampel = 'C') as cadangan,
      -- Total realisasi (status = 'Selesai Didata' AND flag_sampel = 'U')
      (SELECT COUNT(*)::INTEGER FROM skgb_penggilingan sp WHERE sp.kdkab = p_kode_kab AND sp.tahun = p_tahun AND sp.status_pendataan = '1. Berhasil diwawancarai' AND sp.flag_sampel = 'U') as realisasi
  ),
  petugas_mapping AS (
    SELECT '6101' as kode_kab, 2 as jumlah_petugas  -- Different from pengeringan
    UNION SELECT '6102', 3
    UNION SELECT '6103', 3
    UNION SELECT '6104', 1
    UNION SELECT '6105', 3
    UNION SELECT '6106', 2
    UNION SELECT '6107', 3
    UNION SELECT '6108', 3
    UNION SELECT '6109', 3
    UNION SELECT '6110', 2
    UNION SELECT '6111', 2
    UNION SELECT '6112', 2
    UNION SELECT '6171', 1
    UNION SELECT '6172', 1
  )
  SELECT 
    sd.total_kecamatan_u,
    sd.total_kecamatan_c,
    sd.total_desa_u,
    sd.total_desa_c,
    sd.target_utama,
    sd.cadangan,
    sd.realisasi,
    -- Calculate percentage
    CASE 
      WHEN sd.target_utama > 0 THEN 
        ROUND((sd.realisasi::NUMERIC / sd.target_utama::NUMERIC) * 100, 2)
      ELSE 0 
    END as persentase,
    COALESCE(pm.jumlah_petugas, 0)::INTEGER as total_petugas
  FROM summary_data sd
  CROSS JOIN petugas_mapping pm
  WHERE pm.kode_kab = p_kode_kab;
END;
$$;
