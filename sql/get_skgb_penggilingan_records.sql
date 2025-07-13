-- RPC Function untuk get detail records SKGB Penggilingan berdasarkan filter
CREATE OR REPLACE FUNCTION get_skgb_penggilingan_records(
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
  kdprov TEXT,
  nmprov TEXT,
  kdkab TEXT,
  nmkab TEXT,
  kdkec TEXT,
  nmkec TEXT,
  kddesa TEXT,
  nmdesa TEXT,
  id_sbr TEXT,
  nks TEXT,
  nama_usaha TEXT,
  narahubung TEXT,
  telp TEXT,
  alamat_usaha TEXT,
  x DOUBLE PRECISION,
  y DOUBLE PRECISION,
  skala_usaha TEXT,
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
        sp.kddesa,
        sp.nmdesa,
        sp.id_sbr,
        sp.nks,
        sp.nama_usaha,
        sp.narahubung,
        sp.telp,
        sp.alamat_usaha,
        sp.x,
        sp.y,
        sp.skala_usaha,
        sp.flag_sampel,
        sp.petugas,
        sp.email_petugas,
        sp.status_pendataan,
        sp.date_modified,
        sp.created_at,
        sp.tahun,
        sp.kegiatan_id
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
           LOWER(sp.petugas) LIKE LOWER('%' || p_search_term || '%'))
    ORDER BY sp.nmkab, sp.nmkec, sp.nmdesa, sp.nama_usaha
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;
