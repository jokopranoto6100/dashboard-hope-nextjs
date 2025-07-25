-- RPC Function untuk get detail records SKGB Pengeringan berdasarkan filter
CREATE OR REPLACE FUNCTION get_skgb_pengeringan_records(
  p_tahun INTEGER DEFAULT NULL,
  p_kdkab TEXT DEFAULT NULL,
  p_kdkec TEXT DEFAULT NULL,
  p_flag_sampel TEXT DEFAULT 'U',
  p_search_term TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id BIGINT,
  kdprov INTEGER,
  nmprov TEXT,
  kdkab TEXT,
  nmkab TEXT,
  kdkec TEXT,
  nmkec TEXT,
  lokasi TEXT,
  idsubsegmen TEXT,
  nks INTEGER,
  fase_amatan INTEGER,
  x DOUBLE PRECISION,
  y DOUBLE PRECISION,
  bulan_panen TEXT,
  flag_sampel TEXT,
  petugas TEXT,
  email_petugas TEXT,
  status_pendataan TEXT,
  date_modified TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  tahun SMALLINT,
  kegiatan_id UUID
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sp.id,
        sp.kdprov,
        sp.nmprov,
        sp.kdkab,
        sp.nmkab,
        sp.kdkec,
        sp.nmkec,
        sp.lokasi,
        sp.idsubsegmen,
        sp.nks,
        sp.fase_amatan,
        sp.x,
        sp.y,
        sp.bulan_panen,
        sp.flag_sampel,
        sp.petugas,
        sp.email_petugas,
        sp.status_pendataan,
        sp.date_modified,
        sp.created_at,
        sp.tahun,
        sp.kegiatan_id
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
           LOWER(sp.petugas) LIKE LOWER('%' || p_search_term || '%'))
    ORDER BY sp.idsubsegmen
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;
