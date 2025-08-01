BEGIN
  RAISE NOTICE 'Merefresh materialized view: public.ubinan_anomali';
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.ubinan_anomali;
  RAISE NOTICE 'Materialized view public.ubinan_anomali berhasil direfresh.';
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Gagal merefresh materialized view public.ubinan_anomali. Error: %', SQLERRM;
    -- Anda bisa memilih untuk melempar error kembali jika refresh adalah kritikal:
    -- RAISE;
END;