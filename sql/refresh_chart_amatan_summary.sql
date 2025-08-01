BEGIN
  -- Pesan log untuk debugging di log database Supabase
  RAISE NOTICE 'Mulai me-refresh materialized view: public.chart_amatan_summary';
  
  -- Perintah inti untuk merefresh view-nya
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.chart_amatan_summary;
  
  RAISE NOTICE 'Materialized view public.chart_amatan_summary berhasil direfresh.';
EXCEPTION
  -- Menangkap error jika terjadi sesuatu
  WHEN OTHERS THEN
    RAISE WARNING 'Gagal me-refresh materialized view public.chart_amatan_summary. Error: %', SQLERRM;
END;
