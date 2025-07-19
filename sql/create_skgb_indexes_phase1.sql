-- SKGB Performance Optimization - Phase 1 Critical Indexes
-- Simplified version without computed columns
-- Performance Issue: SKGB-Data-Fetch took 1350.70ms → Target <400ms

-- =============================================================================
-- PHASE 1: CRITICAL PERFORMANCE INDEXES (IMPLEMENT FIRST)
-- =============================================================================

-- Most impactful indexes for dashboard performance
-- These should reduce 70-85% of the performance issues

-- 1. Kabupaten + Tahun composite (most common filter combination)
CREATE INDEX IF NOT EXISTS idx_skgb_pengeringan_kabupaten_tahun 
ON public.skgb_pengeringan (kdkab, tahun) 
WHERE nmkab IS NOT NULL AND kdkab IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_skgb_penggilingan_kabupaten_tahun 
ON public.skgb_penggilingan (kdkab, tahun) 
WHERE nmkab IS NOT NULL AND kdkab IS NOT NULL;

-- 2. Optimal composite for complex WHERE clauses
CREATE INDEX IF NOT EXISTS idx_skgb_pengeringan_optimal_filter 
ON public.skgb_pengeringan (kdkab, tahun, flag_sampel, status_pendataan);

CREATE INDEX IF NOT EXISTS idx_skgb_penggilingan_optimal_filter 
ON public.skgb_penggilingan (kdkab, tahun, flag_sampel, status_pendataan);

-- 3. Created_at for year filtering (simple date index)
CREATE INDEX IF NOT EXISTS idx_skgb_pengeringan_created_at 
ON public.skgb_pengeringan (created_at);

-- 4. Flag_sampel for U/C filtering (heavily used in counts)
CREATE INDEX IF NOT EXISTS idx_skgb_pengeringan_flag_sampel 
ON public.skgb_pengeringan (flag_sampel);

CREATE INDEX IF NOT EXISTS idx_skgb_penggilingan_flag_sampel 
ON public.skgb_penggilingan (flag_sampel);

-- 5. Status_pendataan for realisasi calculations
CREATE INDEX IF NOT EXISTS idx_skgb_pengeringan_status_pendataan 
ON public.skgb_pengeringan (status_pendataan);

CREATE INDEX IF NOT EXISTS idx_skgb_penggilingan_status_pendataan 
ON public.skgb_penggilingan (status_pendataan);

-- =============================================================================
-- PHASE 2: SUPPORTING INDEXES (IMPLEMENT AFTER TESTING PHASE 1)
-- =============================================================================

-- 6. Kabupaten + created_at for monitoring queries
CREATE INDEX IF NOT EXISTS idx_skgb_pengeringan_kabupaten_created_at 
ON public.skgb_pengeringan (kdkab, created_at);

-- 7. Grouping indexes for summary calculations
CREATE INDEX IF NOT EXISTS idx_skgb_pengeringan_lokasi_kec 
ON public.skgb_pengeringan (lokasi, kdkec);

CREATE INDEX IF NOT EXISTS idx_skgb_penggilingan_desa_grouping 
ON public.skgb_penggilingan (kdkab, kdkec, kddesa, tahun);

-- 8. Search functionality indexes
CREATE INDEX IF NOT EXISTS idx_skgb_pengeringan_petugas 
ON public.skgb_pengeringan (petugas);

CREATE INDEX IF NOT EXISTS idx_skgb_penggilingan_nama_usaha 
ON public.skgb_penggilingan (nama_usaha);

CREATE INDEX IF NOT EXISTS idx_skgb_penggilingan_petugas 
ON public.skgb_penggilingan (petugas);

-- =============================================================================
-- UPDATE STATISTICS FOR QUERY PLANNER
-- =============================================================================

-- Critical: Update statistics after creating indexes
ANALYZE public.skgb_pengeringan;
ANALYZE public.skgb_penggilingan;

-- =============================================================================
-- PERFORMANCE MONITORING QUERIES
-- =============================================================================

-- Check if indexes are being used
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
WHERE tablename IN ('skgb_pengeringan', 'skgb_penggilingan')
ORDER BY tablename, idx_scan DESC;

-- Check table and index sizes
SELECT 
    t.tablename,
    pg_size_pretty(pg_total_relation_size(c.oid)) as table_size,
    pg_size_pretty(pg_indexes_size(c.oid)) as index_size
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE t.tablename IN ('skgb_pengeringan', 'skgb_penggilingan')
AND t.schemaname = 'public';

-- Test query performance (run before and after indexing)
-- EXPLAIN ANALYZE 
-- SELECT COUNT(*) FROM skgb_pengeringan 
-- WHERE kdkab = '6101' AND tahun = 2025 AND flag_sampel = 'U';

-- =============================================================================
-- SUCCESS METRICS TO MONITOR
-- =============================================================================

/*
EXPECTED IMPROVEMENTS:

1. Dashboard monitoring queries:
   - Before: 1350ms (full table scan)
   - After: 200-400ms (index scan)
   - Improvement: 70-85%

2. Detail view queries:
   - Before: 500-800ms
   - After: 100-200ms  
   - Improvement: 60-80%

3. Search functionality:
   - Before: 300-600ms
   - After: 50-150ms
   - Improvement: 75-90%

VALIDATION CHECKLIST:
☐ All indexes created without errors
☐ ANALYZE completed successfully
☐ Dashboard loads in <400ms
☐ Detail views load in <200ms
☐ Search responds in <150ms
☐ Index usage shows in pg_stat_user_indexes
☐ No sequential scans on large result sets

IMPLEMENTATION ORDER:
1. Run Phase 1 indexes first
2. Test dashboard performance
3. Run ANALYZE
4. Monitor for 24-48 hours
5. Implement Phase 2 if needed
6. Remove unused indexes after 1 month
*/
