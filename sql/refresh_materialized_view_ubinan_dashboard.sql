BEGIN
  RAISE NOTICE 'Merefresh materialized view: public.ubinan_dashboard';
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.ubinan_dashboard;
  RAISE NOTICE 'Materialized view public.ubinan_dashboard berhasil direfresh.';
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Gagal merefresh materialized view public.ubinan_dashboard. Error: %', SQLERRM;
    -- Anda bisa memilih untuk melempar error kembali jika refresh adalah kritikal:
    -- RAISE;
END;