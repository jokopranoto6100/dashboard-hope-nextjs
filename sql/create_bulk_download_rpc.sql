-- SQL untuk membuat RPC function yang dibutuhkan untuk bulk download

-- 1. Function untuk mendapatkan summary satker dan file
CREATE OR REPLACE FUNCTION get_satker_file_summary(input_year integer)
RETURNS TABLE (
  kabupaten_kode text,
  file_type text,
  count bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    s.kabupaten_kode::text,
    s.file_type::text,
    COUNT(s.id) as count
  FROM simtp_uploads s
  WHERE s.year = input_year 
    AND s.storage_path IS NOT NULL
  GROUP BY s.kabupaten_kode, s.file_type
  ORDER BY s.kabupaten_kode;
$$;

-- 2. Grant permissions
GRANT EXECUTE ON FUNCTION get_satker_file_summary TO authenticated;

-- 3. Test the function (optional)
-- SELECT * FROM get_satker_file_summary(2025);
