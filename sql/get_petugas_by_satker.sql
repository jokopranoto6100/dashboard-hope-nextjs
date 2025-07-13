-- RPC Function untuk get petugas berdasarkan satker_id
CREATE OR REPLACE FUNCTION get_petugas_by_satker(
  p_satker_id TEXT
)
RETURNS TABLE (
  id BIGINT,
  nama_petugas TEXT,
  email_petugas TEXT,
  satker_id TEXT,
  jabatan TEXT,
  no_hp TEXT,
  status TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.nama_petugas,
        p.email_petugas,
        p.satker_id,
        p.jabatan,
        p.no_hp,
        p.status
    FROM public.petugas_db p
    WHERE p.satker_id = p_satker_id 
      AND p.status = 'aktif'
    ORDER BY p.nama_petugas ASC;
END;
$$;
