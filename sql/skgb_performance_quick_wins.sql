-- SKGB Performance Optimization - Quick Win Analysis & Action Plan
-- Current Status: 1350ms → 1080ms (20% improvement)
-- Target: <400ms (need 70-80% total improvement)

-- =============================================================================
-- ROOT CAUSE ANALYSIS (Why Still Slow)
-- =============================================================================

/*
1. QUERY PATTERN ANALYSIS:
   - Dashboard calls get_skgb_monitoring_data RPC
   - This does GROUP BY on (nmkab, kdkab)
   - COUNT operations on flag_sampel and status_pendataan
   - EXTRACT(YEAR FROM created_at) filtering

2. INDEX EFFECTIVENESS CHECK:
   - Basic indexes created, but may not be optimal for specific query patterns
   - Need partial indexes for better selectivity
   - Covering indexes to avoid table lookups

3. REMAINING BOTTLENECKS:
   - Large table scans for GROUP BY operations
   - COUNT operations on filtered data
   - Date extraction functions
   - Lack of covering indexes
*/

-- =============================================================================
-- IMMEDIATE QUICK WINS (Execute First)
-- =============================================================================

-- 1. Drop unused or redundant indexes first (cleanup)
DROP INDEX IF EXISTS idx_skgb_pengeringan_created_at;
DROP INDEX IF EXISTS idx_skgb_pengeringan_kabupaten_created_at;

-- 2. Create highly selective partial indexes (most effective)
CREATE INDEX IF NOT EXISTS idx_skgb_pengeringan_dashboard_optimized 
ON public.skgb_pengeringan (nmkab, kdkab, flag_sampel, status_pendataan) 
WHERE nmkab IS NOT NULL 
  AND kdkab IS NOT NULL 
  AND tahun = 2025;

CREATE INDEX IF NOT EXISTS idx_skgb_penggilingan_dashboard_optimized 
ON public.skgb_penggilingan (nmkab, kdkab, flag_sampel, status_pendataan) 
WHERE nmkab IS NOT NULL 
  AND kdkab IS NOT NULL 
  AND tahun = 2025;

-- 3. Covering indexes for dashboard queries (avoid table lookups)
CREATE INDEX IF NOT EXISTS idx_skgb_pengeringan_covering_dashboard 
ON public.skgb_pengeringan (nmkab, kdkab) 
INCLUDE (flag_sampel, status_pendataan, created_at)
WHERE nmkab IS NOT NULL AND kdkab IS NOT NULL AND tahun = 2025;

CREATE INDEX IF NOT EXISTS idx_skgb_penggilingan_covering_dashboard 
ON public.skgb_penggilingan (nmkab, kdkab) 
INCLUDE (flag_sampel, status_pendataan)
WHERE nmkab IS NOT NULL AND kdkab IS NOT NULL AND tahun = 2025;

-- 4. Statistics update for better query planning
ANALYZE public.skgb_pengeringan;
ANALYZE public.skgb_penggilingan;

-- =============================================================================
-- ALTERNATIVE: MATERIALIZED VIEW APPROACH (Fastest Solution)
-- =============================================================================

-- Create materialized view for dashboard data (refresh every hour)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_skgb_dashboard_pengeringan AS
SELECT 
    COALESCE(sp.nmkab, 'Unknown')::TEXT as kabupaten,
    COALESCE(sp.kdkab, 'Unknown')::TEXT as kode_kab,
    sp.tahun,
    COUNT(CASE WHEN sp.flag_sampel = 'U' THEN 1 END)::INTEGER as target_utama,
    COUNT(CASE WHEN sp.flag_sampel = 'C' THEN 1 END)::INTEGER as cadangan,
    COUNT(CASE WHEN sp.status_pendataan = '1. Berhasil diwawancarai' THEN 1 END)::INTEGER as realisasi,
    CASE 
        WHEN COUNT(CASE WHEN sp.flag_sampel = 'U' THEN 1 END) > 0 THEN
            ROUND(
                (COUNT(CASE WHEN sp.status_pendataan = '1. Berhasil diwawancarai' THEN 1 END)::NUMERIC / 
                 COUNT(CASE WHEN sp.flag_sampel = 'U' THEN 1 END)::NUMERIC) * 100, 
                2
            )
        ELSE 0
    END as persentase,
    NOW() as last_updated
FROM skgb_pengeringan sp
WHERE sp.nmkab IS NOT NULL 
    AND sp.kdkab IS NOT NULL
GROUP BY sp.nmkab, sp.kdkab, sp.tahun;

-- Index on materialized view
CREATE INDEX IF NOT EXISTS idx_mv_skgb_dashboard_pengeringan_year 
ON mv_skgb_dashboard_pengeringan (tahun, kode_kab);

-- Similar for penggilingan
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_skgb_dashboard_penggilingan AS
SELECT 
    COALESCE(sp.nmkab, 'Unknown')::TEXT as kabupaten,
    COALESCE(sp.kdkab, 'Unknown')::TEXT as kode_kab,
    sp.tahun,
    COUNT(CASE WHEN sp.flag_sampel = 'U' THEN 1 END)::INTEGER as target_utama,
    COUNT(CASE WHEN sp.flag_sampel = 'C' THEN 1 END)::INTEGER as cadangan,
    COUNT(CASE WHEN sp.status_pendataan = '1. Berhasil diwawancarai' AND sp.flag_sampel = 'U' THEN 1 END)::INTEGER as realisasi,
    CASE 
        WHEN COUNT(CASE WHEN sp.flag_sampel = 'U' THEN 1 END) > 0 THEN
            ROUND(
                (COUNT(CASE WHEN sp.status_pendataan = '1. Berhasil diwawancarai' AND sp.flag_sampel = 'U' THEN 1 END)::NUMERIC / 
                 COUNT(CASE WHEN sp.flag_sampel = 'U' THEN 1 END)::NUMERIC) * 100, 
                2
            )
        ELSE 0
    END as persentase,
    NOW() as last_updated
FROM skgb_penggilingan sp
WHERE sp.nmkab IS NOT NULL 
    AND sp.kdkab IS NOT NULL
GROUP BY sp.nmkab, sp.kdkab, sp.tahun;

CREATE INDEX IF NOT EXISTS idx_mv_skgb_dashboard_penggilingan_year 
ON mv_skgb_dashboard_penggilingan (tahun, kode_kab);

-- =============================================================================
-- MODIFIED RPC FUNCTIONS (Use Materialized Views)
-- =============================================================================

-- Faster version using materialized view
CREATE OR REPLACE FUNCTION get_skgb_monitoring_data_fast(
  p_tahun INTEGER
)
RETURNS TABLE (
  kabupaten TEXT,
  kode_kab TEXT,
  target_utama INTEGER,
  cadangan INTEGER,
  realisasi INTEGER,
  persentase NUMERIC,
  jumlah_petugas INTEGER
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH petugas_mapping AS (
        SELECT '6101'::TEXT as kode_kab, 5 as jumlah_petugas
        UNION SELECT '6102', 5   
        UNION SELECT '6103', 5   
        UNION SELECT '6104', 4   
        UNION SELECT '6105', 2  
        UNION SELECT '6106', 5   
        UNION SELECT '6107', 2   
        UNION SELECT '6108', 1   
        UNION SELECT '6109', 2   
        UNION SELECT '6110', 2   
        UNION SELECT '6111', 2   
        UNION SELECT '6112', 3   
        UNION SELECT '6171', 1   
        UNION SELECT '6172', 1   
    )
    SELECT 
        mv.kabupaten,
        mv.kode_kab,
        mv.target_utama,
        mv.cadangan,
        mv.realisasi,
        mv.persentase,
        COALESCE(pm.jumlah_petugas, 0)::INTEGER as jumlah_petugas
    FROM mv_skgb_dashboard_pengeringan mv
    LEFT JOIN petugas_mapping pm ON mv.kode_kab = pm.kode_kab
    WHERE (p_tahun IS NULL OR mv.tahun = p_tahun)
    ORDER BY mv.kode_kab ASC;
END;
$$;

-- Similar for penggilingan
CREATE OR REPLACE FUNCTION get_skgb_penggilingan_monitoring_data_fast(
  p_tahun INTEGER
)
RETURNS TABLE (
  kabupaten TEXT,
  kode_kab TEXT,
  target_utama INTEGER,
  cadangan INTEGER,
  realisasi INTEGER,
  persentase NUMERIC,
  jumlah_petugas INTEGER
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH petugas_mapping AS (
        SELECT '6101'::TEXT as kode_kab, 2 as jumlah_petugas  -- Sambas
        UNION SELECT '6102', 3   -- Bengkayang
        UNION SELECT '6103', 3   -- Landak
        UNION SELECT '6104', 1   -- Mempawah
        UNION SELECT '6105', 3   -- Sanggau
        UNION SELECT '6106', 2   -- Ketapang
        UNION SELECT '6107', 3   -- Sintang
        UNION SELECT '6108', 3   -- Kapuas Hulu
        UNION SELECT '6109', 3   -- Sekadau
        UNION SELECT '6110', 2   -- Melawi
        UNION SELECT '6111', 2   -- Kayong Utara
        UNION SELECT '6112', 2   -- Kbu Raya
        UNION SELECT '6171', 1   -- Kota Pontianak
        UNION SELECT '6172', 1   -- Kota Singkawang
    )
    SELECT 
        mv.kabupaten,
        mv.kode_kab,
        mv.target_utama,
        mv.cadangan,
        mv.realisasi,
        mv.persentase,
        COALESCE(pm.jumlah_petugas, 0)::INTEGER as jumlah_petugas
    FROM mv_skgb_dashboard_penggilingan mv
    LEFT JOIN petugas_mapping pm ON mv.kode_kab = pm.kode_kab
    WHERE (p_tahun IS NULL OR mv.tahun = p_tahun)
    ORDER BY mv.kode_kab ASC;
END;
$$;

-- =============================================================================
-- REFRESH STRATEGY
-- =============================================================================

-- Auto-refresh materialized views (run every hour)
-- Can be set up as a cron job or scheduled task

-- Manual refresh command:
-- REFRESH MATERIALIZED VIEW mv_skgb_dashboard_pengeringan;
-- REFRESH MATERIALIZED VIEW mv_skgb_dashboard_penggilingan;

-- =============================================================================
-- PERFORMANCE TESTING
-- =============================================================================

-- Test the new fast functions
-- EXPLAIN ANALYZE SELECT * FROM get_skgb_monitoring_data_fast(2025);
-- EXPLAIN ANALYZE SELECT * FROM get_skgb_penggilingan_monitoring_data_fast(2025);

-- Compare with original functions
-- EXPLAIN ANALYZE SELECT * FROM get_skgb_monitoring_data(2025);
-- EXPLAIN ANALYZE SELECT * FROM get_skgb_penggilingan_monitoring_data(2025);

-- =============================================================================
-- IMPLEMENTATION STRATEGY
-- =============================================================================

/*
OPTION A: Quick Indexes (Safer, Moderate Improvement)
1. Execute the quick wins section
2. Test performance: expect 1080ms → 600-700ms
3. If still slow, proceed to Option B

OPTION B: Materialized Views (Fastest, Requires Code Changes)
1. Create materialized views
2. Update React hooks to use _fast RPC functions
3. Set up refresh schedule
4. Expected: 1080ms → 50-100ms (98% improvement)

RECOMMENDATION: Start with Option A, then implement Option B if needed
*/
