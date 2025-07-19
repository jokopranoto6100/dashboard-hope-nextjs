-- SKGB Performance Optimization - Phase 2 Advanced Indexes
-- Current: 1350ms → 1080ms (improvement 270ms)
-- Target: <400ms (need additional 680ms improvement)

-- Analysis: Need more aggressive index strategy and query optimization

-- =============================================================================
-- ADVANCED PARTIAL INDEXES (Most Effective for Large Tables)
-- =============================================================================

-- 1. Partial indexes for non-null critical columns (exclude bad data)
CREATE INDEX IF NOT EXISTS idx_skgb_pengeringan_optimal_partial 
ON public.skgb_pengeringan (kdkab, tahun, flag_sampel, status_pendataan) 
WHERE nmkab IS NOT NULL 
  AND kdkab IS NOT NULL 
  AND tahun IS NOT NULL 
  AND flag_sampel IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_skgb_penggilingan_optimal_partial 
ON public.skgb_penggilingan (kdkab, tahun, flag_sampel, status_pendataan) 
WHERE nmkab IS NOT NULL 
  AND kdkab IS NOT NULL 
  AND tahun IS NOT NULL 
  AND flag_sampel IS NOT NULL;

-- 2. Specialized indexes for realisasi calculation (most critical path)
CREATE INDEX IF NOT EXISTS idx_skgb_pengeringan_realisasi_focus 
ON public.skgb_pengeringan (kdkab, status_pendataan) 
WHERE status_pendataan = '1. Berhasil diwawancarai' 
  AND flag_sampel = 'U';

CREATE INDEX IF NOT EXISTS idx_skgb_penggilingan_realisasi_focus 
ON public.skgb_penggilingan (kdkab, status_pendataan) 
WHERE status_pendataan = '1. Berhasil diwawancarai' 
  AND flag_sampel = 'U';

-- 3. Year-specific partial indexes (hot data)
CREATE INDEX IF NOT EXISTS idx_skgb_pengeringan_current_year 
ON public.skgb_pengeringan (kdkab, flag_sampel, status_pendataan) 
WHERE tahun = 2025 AND nmkab IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_skgb_penggilingan_current_year 
ON public.skgb_penggilingan (kdkab, flag_sampel, status_pendataan) 
WHERE tahun = 2025 AND nmkab IS NOT NULL;

-- 4. Covering indexes with included columns (avoid table lookups)
CREATE INDEX IF NOT EXISTS idx_skgb_pengeringan_covering 
ON public.skgb_pengeringan (kdkab, tahun) 
INCLUDE (nmkab, flag_sampel, status_pendataan, created_at);

CREATE INDEX IF NOT EXISTS idx_skgb_penggilingan_covering 
ON public.skgb_penggilingan (kdkab, tahun) 
INCLUDE (nmkab, flag_sampel, status_pendataan);

-- =============================================================================
-- SPECIALIZED GROUPING INDEXES (For Dashboard Aggregations)
-- =============================================================================

-- 5. Multi-column indexes for GROUP BY operations
CREATE INDEX IF NOT EXISTS idx_skgb_pengeringan_group_by_optimized 
ON public.skgb_pengeringan (nmkab, kdkab, flag_sampel, status_pendataan, tahun) 
WHERE nmkab IS NOT NULL AND kdkab IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_skgb_penggilingan_group_by_optimized 
ON public.skgb_penggilingan (nmkab, kdkab, flag_sampel, status_pendataan, tahun) 
WHERE nmkab IS NOT NULL AND kdkab IS NOT NULL;

-- 6. Count-optimized indexes (for COUNT operations)
CREATE INDEX IF NOT EXISTS idx_skgb_pengeringan_count_U 
ON public.skgb_pengeringan (kdkab, tahun) 
WHERE flag_sampel = 'U' AND nmkab IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_skgb_pengeringan_count_C 
ON public.skgb_pengeringan (kdkab, tahun) 
WHERE flag_sampel = 'C' AND nmkab IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_skgb_penggilingan_count_U 
ON public.skgb_penggilingan (kdkab, tahun) 
WHERE flag_sampel = 'U' AND nmkab IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_skgb_penggilingan_count_C 
ON public.skgb_penggilingan (kdkab, tahun) 
WHERE flag_sampel = 'C' AND nmkab IS NOT NULL;

-- =============================================================================
-- STATISTICAL OPTIMIZATION
-- =============================================================================

-- 7. Increase statistics target for key columns (better query planning)
ALTER TABLE public.skgb_pengeringan 
ALTER COLUMN kdkab SET STATISTICS 1000,
ALTER COLUMN tahun SET STATISTICS 1000,
ALTER COLUMN flag_sampel SET STATISTICS 1000,
ALTER COLUMN status_pendataan SET STATISTICS 1000;

ALTER TABLE public.skgb_penggilingan 
ALTER COLUMN kdkab SET STATISTICS 1000,
ALTER COLUMN tahun SET STATISTICS 1000,
ALTER COLUMN flag_sampel SET STATISTICS 1000,
ALTER COLUMN status_pendataan SET STATISTICS 1000;

-- =============================================================================
-- VACUUM AND ANALYZE (Critical for Performance)
-- =============================================================================

-- 8. Full vacuum and analyze to update statistics and defragment
VACUUM ANALYZE public.skgb_pengeringan;
VACUUM ANALYZE public.skgb_penggilingan;

-- =============================================================================
-- MONITORING QUERIES FOR VALIDATION
-- =============================================================================

-- Check index usage effectiveness
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch,
    ROUND(100.0 * idx_scan / GREATEST(seq_scan + idx_scan, 1), 2) as index_usage_pct
FROM pg_stat_user_indexes 
WHERE tablename IN ('skgb_pengeringan', 'skgb_penggilingan')
ORDER BY idx_scan DESC;

-- Check for sequential scans (should be minimal after optimization)
SELECT 
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    idx_tup_fetch,
    CASE 
        WHEN seq_scan + idx_scan > 0 
        THEN ROUND(100.0 * seq_scan / (seq_scan + idx_scan), 2) 
        ELSE 0 
    END as seq_scan_pct
FROM pg_stat_user_tables 
WHERE tablename IN ('skgb_pengeringan', 'skgb_penggilingan');

-- Test specific query performance
EXPLAIN (ANALYZE, BUFFERS) 
SELECT 
    COALESCE(sp.nmkab, 'Unknown')::TEXT as kabupaten,
    COALESCE(sp.kdkab, 'Unknown')::TEXT as kode_kab,
    COUNT(CASE WHEN sp.flag_sampel = 'U' THEN 1 END)::INTEGER as target_utama,
    COUNT(CASE WHEN sp.flag_sampel = 'C' THEN 1 END)::INTEGER as cadangan,
    COUNT(CASE WHEN sp.status_pendataan = '1. Berhasil diwawancarai' THEN 1 END)::INTEGER as realisasi
FROM skgb_pengeringan sp
WHERE EXTRACT(YEAR FROM sp.created_at) = 2025
    AND sp.nmkab IS NOT NULL 
    AND sp.kdkab IS NOT NULL
GROUP BY sp.nmkab, sp.kdkab;

-- =============================================================================
-- ADDITIONAL PERFORMANCE RECOMMENDATIONS
-- =============================================================================

/*
NEXT STEPS IF STILL SLOW:

1. MATERIALIZED VIEWS (for dashboard data):
CREATE MATERIALIZED VIEW mv_skgb_dashboard_pengeringan AS
SELECT kdkab, nmkab, tahun,
       COUNT(CASE WHEN flag_sampel = 'U' THEN 1 END) as target_utama,
       COUNT(CASE WHEN flag_sampel = 'C' THEN 1 END) as cadangan,
       COUNT(CASE WHEN status_pendataan = '1. Berhasil diwawancarai' THEN 1 END) as realisasi
FROM skgb_pengeringan
WHERE nmkab IS NOT NULL AND kdkab IS NOT NULL
GROUP BY kdkab, nmkab, tahun;

2. APPLICATION-LEVEL CACHING:
- Implement Redis caching for dashboard data
- Cache results for 5-10 minutes
- Use cache invalidation on data updates

3. CONNECTION OPTIMIZATION:
- Increase work_mem for complex queries
- Optimize shared_buffers
- Use prepared statements

4. DATA ARCHIVING:
- Move old year data to separate tables
- Partition tables by year
- Implement data retention policies

EXPECTED IMPROVEMENTS:
- Phase 2 indexes: Additional 400-600ms improvement
- Target: 1080ms → 300-500ms
- Combined with Phase 1: 1350ms → 300-500ms (70-80% improvement)
*/
