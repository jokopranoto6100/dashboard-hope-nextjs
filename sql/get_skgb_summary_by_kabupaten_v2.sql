-- RPC Function untuk mendapatkan summary SKGB berdasarkan kabupaten dengan breakdown kecamatan dan desa per flag_sampel
-- Menggantikan get_skgb_summary_by_kabupaten yang lama

CREATE OR REPLACE FUNCTION get_skgb_summary_by_kabupaten_v2(
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
    FROM skgb_pengeringan sp
    WHERE sp.kdkab = p_kode_kab
      AND EXTRACT(YEAR FROM sp.created_at) = p_tahun
    GROUP BY sp.kdkec
  ),
  desa_stats AS (
    -- Get desa-level statistics (kombinasi lokasi + kecamatan untuk handling nama lokasi yang sama di kecamatan berbeda)
    SELECT 
      sp.lokasi,
      sp.kdkec,
      COUNT(CASE WHEN sp.flag_sampel = 'U' THEN 1 END)::INTEGER as count_u,
      COUNT(CASE WHEN sp.flag_sampel = 'C' THEN 1 END)::INTEGER as count_c
    FROM skgb_pengeringan sp
    WHERE sp.kdkab = p_kode_kab
      AND EXTRACT(YEAR FROM sp.created_at) = p_tahun
    GROUP BY sp.lokasi, sp.kdkec
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
      -- Target Utama: total record dengan flag_sampel = 'U'
      COUNT(CASE WHEN sp.flag_sampel = 'U' THEN 1 END)::INTEGER as target_utama,
      -- Cadangan: total record dengan flag_sampel = 'C'  
      COUNT(CASE WHEN sp.flag_sampel = 'C' THEN 1 END)::INTEGER as cadangan,
      -- Realisasi: total record dengan status_pendataan = 'Selesai Didata' AND flag_sampel = 'U'
      COUNT(CASE WHEN sp.status_pendataan = 'Selesai Didata' AND sp.flag_sampel = 'U' THEN 1 END)::INTEGER as realisasi
    FROM skgb_pengeringan sp
    WHERE sp.kdkab = p_kode_kab
      AND EXTRACT(YEAR FROM sp.created_at) = p_tahun
  )
  SELECT 
    sd.total_kecamatan_u,
    sd.total_kecamatan_c,
    sd.total_desa_u,
    sd.total_desa_c,
    sd.target_utama,
    sd.cadangan,
    sd.realisasi,
    -- Calculate percentage: realisasi / target_utama * 100
    CASE 
      WHEN sd.target_utama > 0 THEN 
        ROUND((sd.realisasi::NUMERIC / sd.target_utama::NUMERIC) * 100, 2)
      ELSE 0 
    END as persentase,
    -- Return 0 for total_petugas, will be overridden by frontend hardcoded data
    0 as total_petugas
  FROM summary_data sd;
END;
$$;
