-- RPC Function untuk count total records SKGB Pengeringan berdasarkan filter
CREATE OR REPLACE FUNCTION get_skgb_pengeringan_count(
  p_tahun INTEGER DEFAULT NULL,
  p_kdkab TEXT DEFAULT NULL,
  p_kdkec TEXT DEFAULT NULL,
  p_flag_sampel TEXT DEFAULT 'U',
  p_search_term TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    total_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO total_count
    FROM public.skgb_pengeringan sp
    WHERE (p_tahun IS NULL OR sp.tahun = p_tahun)
      AND (p_kdkab IS NULL OR sp.kdkab = p_kdkab)
      AND (p_kdkec IS NULL OR sp.kdkec = p_kdkec)
      AND (p_flag_sampel = 'ALL' OR sp.flag_sampel = p_flag_sampel)
      AND (p_search_term IS NULL OR p_search_term = '' OR
           LOWER(sp.nmkab) LIKE LOWER('%' || p_search_term || '%') OR
           LOWER(sp.nmkec) LIKE LOWER('%' || p_search_term || '%') OR
           LOWER(sp.lokasi) LIKE LOWER('%' || p_search_term || '%') OR
           LOWER(sp.idsubsegmen) LIKE LOWER('%' || p_search_term || '%') OR
           LOWER(sp.petugas) LIKE LOWER('%' || p_search_term || '%'));
    
    RETURN total_count;
END;
$$;

-- RPC Function untuk count total records SKGB Penggilingan berdasarkan filter
CREATE OR REPLACE FUNCTION get_skgb_penggilingan_count(
  p_tahun INTEGER DEFAULT NULL,
  p_kdkab TEXT DEFAULT NULL,
  p_kdkec TEXT DEFAULT NULL,
  p_flag_sampel TEXT DEFAULT 'U',
  p_search_term TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    total_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO total_count
    FROM public.skgb_penggilingan sp
    WHERE (p_tahun IS NULL OR sp.tahun = p_tahun)
      AND (p_kdkab IS NULL OR sp.kdkab = p_kdkab)
      AND (p_kdkec IS NULL OR sp.kdkec = p_kdkec)
      AND (p_flag_sampel = 'ALL' OR sp.flag_sampel = p_flag_sampel)
      AND (p_search_term IS NULL OR p_search_term = '' OR
           LOWER(sp.nmkab) LIKE LOWER('%' || p_search_term || '%') OR
           LOWER(sp.nmkec) LIKE LOWER('%' || p_search_term || '%') OR
           LOWER(sp.nmdesa) LIKE LOWER('%' || p_search_term || '%') OR
           LOWER(sp.nama_usaha) LIKE LOWER('%' || p_search_term || '%') OR
           LOWER(sp.petugas) LIKE LOWER('%' || p_search_term || '%'));
    
    RETURN total_count;
END;
$$;
