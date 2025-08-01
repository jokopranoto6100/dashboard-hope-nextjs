BEGIN
  EXECUTE 'REFRESH MATERIALIZED VIEW CONCURRENTLY ' || quote_ident(view_name);
EXCEPTION
  WHEN OTHERS THEN
    -- Jika CONCURRENTLY gagal (misalnya karena tidak ada UNIQUE INDEX), coba refresh biasa
    EXECUTE 'REFRESH MATERIALIZED VIEW ' || quote_ident(view_name);
END;