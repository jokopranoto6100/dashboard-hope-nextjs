-- Fungsi get_jadwal_by_year yang diperbaiki untuk menghindari duplikasi subkegiatan
-- File: sql/get_jadwal_by_year_fixed.sql

CREATE OR REPLACE FUNCTION get_jadwal_by_year(target_year INTEGER)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (
    SELECT jsonb_agg(kegiatan_data)
    FROM (
      -- HANYA ambil kegiatan utama (parent_id IS NULL) beserta subkegiatannya
      SELECT
        k.id,
        k.nama_kegiatan AS kegiatan,
        k.parent_id,
        (
          SELECT jsonb_agg(j_data) FROM (
            SELECT j.id, j.kegiatan_id, j.nama, j.keterangan, 
                   to_char(j.start_date, 'YYYY-MM-DD') AS "startDate", 
                   to_char(j.end_date, 'YYYY-MM-DD') AS "endDate", 
                   j.warna
            FROM jadwal j 
            WHERE j.kegiatan_id = k.id 
              AND (EXTRACT(YEAR FROM j.start_date) = target_year 
                   OR EXTRACT(YEAR FROM j.end_date) = target_year)
          ) j_data
        ) AS jadwal,
        (
          SELECT jsonb_agg(sub) FROM (
            SELECT
              sk.id,
              sk.nama_kegiatan AS kegiatan,
              sk.parent_id,
              (
                SELECT jsonb_agg(sj_data) FROM (
                  SELECT sj.id, sj.kegiatan_id, sj.nama, sj.keterangan, 
                         to_char(sj.start_date, 'YYYY-MM-DD') AS "startDate", 
                         to_char(sj.end_date, 'YYYY-MM-DD') AS "endDate", 
                         sj.warna
                  FROM jadwal sj 
                  WHERE sj.kegiatan_id = sk.id 
                    AND (EXTRACT(YEAR FROM sj.start_date) = target_year 
                         OR EXTRACT(YEAR FROM sj.end_date) = target_year)
                ) sj_data
              ) AS jadwal
            FROM kegiatan sk
            WHERE sk.parent_id = k.id
          ) sub
        ) AS "subKegiatan"
      FROM kegiatan k
      WHERE k.parent_id IS NULL  -- HANYA kegiatan utama
      ORDER BY k.nama_kegiatan
    ) kegiatan_data
  );
END;
$$;

-- Contoh penggunaan:
-- SELECT get_jadwal_by_year(2025);
