BEGIN
  -- Pesan log untuk debugging di log database Supabase
  RAISE NOTICE 'Mulai me-refresh materialized view: public.kondisi_panen';

  -- Perintah inti untuk merefresh view-nya
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.kondisi_panen;

  RAISE NOTICE 'Materialized view public.kondisi_panen berhasil direfresh.';
EXCEPTION
  -- Menangkap error jika terjadi sesuatu
  WHEN OTHERS THEN
    RAISE WARNING 'Gagal me-refresh materialized view public.kondisi_panen. Error: %', SQLERRM;
END;