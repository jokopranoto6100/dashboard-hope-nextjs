-- SKGB Performance Optimization - Index Creation
-- Performance Issue: SKGB-Data-Fetch took 1350.70ms
-- Target: Optimize queries for dashboard monitoring and data fetching

-- =============================================================================
-- SKGB_PENGERINGAN TABLE INDEXES
-- =============================================================================

-- 1. Index untuk filtering berdasarkan tahun (most common filter)
-- Used in: get_skgb_monitoring_data, get_skgb_pengeringan_records
CREATE INDEX IF NOT EXISTS idx_skgb_pengeringan_tahun 
ON public.skgb_pengeringan (tahun);

-- 2. Index untuk created_at (used for year filtering)
-- Used in: get_skgb_monitoring_data (EXTRACT(YEAR FROM created_at))
-- Strategy: Index on created_at, let PostgreSQL use it for year extraction
CREATE INDEX IF NOT EXISTS idx_skgb_pengeringan_created_at 
ON public.skgb_pengeringan (created_at);

-- 3. Composite index untuk kabupaten + tahun (very common combination)
-- Used in: dashboard monitoring, detail views
CREATE INDEX IF NOT EXISTS idx_skgb_pengeringan_kabupaten_tahun 
ON public.skgb_pengeringan (kdkab, tahun);

-- 4. Composite index untuk kabupaten + created_at (for year filtering)
-- Used in: get_skgb_monitoring_data, get_skgb_detail_by_kabupaten
-- Strategy: Index on (kdkab, created_at), PostgreSQL can use for year extraction
CREATE INDEX IF NOT EXISTS idx_skgb_pengeringan_kabupaten_created_at 
ON public.skgb_pengeringan (kdkab, created_at);

-- 5. Index untuk flag_sampel (critical for U/C filtering)
-- Used in: semua RPC functions untuk menghitung target_utama dan cadangan
CREATE INDEX IF NOT EXISTS idx_skgb_pengeringan_flag_sampel 
ON public.skgb_pengeringan (flag_sampel);

-- 6. Index untuk status_pendataan (critical for realisasi calculation)
-- Used in: semua RPC functions untuk menghitung realisasi
CREATE INDEX IF NOT EXISTS idx_skgb_pengeringan_status_pendataan 
ON public.skgb_pengeringan (status_pendataan);

-- 7. Composite index untuk lokasi + kecamatan (untuk summary calculations)
-- Used in: get_skgb_summary_by_kabupaten_v2
CREATE INDEX IF NOT EXISTS idx_skgb_pengeringan_lokasi_kec 
ON public.skgb_pengeringan (lokasi, kdkec);

-- 8. Composite index untuk kabupaten + kecamatan + tahun
-- Used in: detail filtering by kecamatan
CREATE INDEX IF NOT EXISTS idx_skgb_pengeringan_kab_kec_tahun 
ON public.skgb_pengeringan (kdkab, kdkec, tahun);

-- 9. Index untuk petugas (used in search functionality)
-- Used in: get_skgb_pengeringan_records search
CREATE INDEX IF NOT EXISTS idx_skgb_pengeringan_petugas 
ON public.skgb_pengeringan (petugas);

-- 10. Composite index untuk optimasi WHERE clause yang kompleks
-- Used in: RPC functions dengan multiple filters
CREATE INDEX IF NOT EXISTS idx_skgb_pengeringan_optimal_filter 
ON public.skgb_pengeringan (kdkab, tahun, flag_sampel, status_pendataan) 
WHERE nmkab IS NOT NULL AND kdkab IS NOT NULL;

-- =============================================================================
-- SKGB_PENGGILINGAN TABLE INDEXES
-- =============================================================================

-- 1. Index untuk filtering berdasarkan tahun
-- Used in: get_skgb_penggilingan_monitoring_data, get_skgb_penggilingan_records
CREATE INDEX IF NOT EXISTS idx_skgb_penggilingan_tahun 
ON public.skgb_penggilingan (tahun);

-- 2. Composite index untuk kabupaten + tahun (very common combination)
-- Used in: dashboard monitoring, detail views
CREATE INDEX IF NOT EXISTS idx_skgb_penggilingan_kabupaten_tahun 
ON public.skgb_penggilingan (kdkab, tahun);

-- 3. Index untuk flag_sampel (critical for U/C filtering)
-- Used in: semua RPC functions untuk menghitung target_utama dan cadangan
CREATE INDEX IF NOT EXISTS idx_skgb_penggilingan_flag_sampel 
ON public.skgb_penggilingan (flag_sampel);

-- 4. Index untuk status_pendataan (critical for realisasi calculation)
-- Used in: semua RPC functions untuk menghitung realisasi
CREATE INDEX IF NOT EXISTS idx_skgb_penggilingan_status_pendataan 
ON public.skgb_penggilingan (status_pendataan);

-- 5. Composite index untuk kecamatan level grouping
-- Used in: get_skgb_penggilingan_summary_by_kabupaten
CREATE INDEX IF NOT EXISTS idx_skgb_penggilingan_kec_grouping 
ON public.skgb_penggilingan (kdkab, kdkec, tahun);

-- 6. Composite index untuk desa level grouping
-- Used in: get_skgb_penggilingan_detail_by_kabupaten, summary calculations
CREATE INDEX IF NOT EXISTS idx_skgb_penggilingan_desa_grouping 
ON public.skgb_penggilingan (kdkab, kdkec, kddesa, tahun);

-- 7. Index untuk nama usaha (used in search functionality)
-- Used in: get_skgb_penggilingan_records search
CREATE INDEX IF NOT EXISTS idx_skgb_penggilingan_nama_usaha 
ON public.skgb_penggilingan (nama_usaha);

-- 8. Index untuk petugas (used in search functionality)
-- Used in: get_skgb_penggilingan_records search
CREATE INDEX IF NOT EXISTS idx_skgb_penggilingan_petugas 
ON public.skgb_penggilingan (petugas);

-- 9. Composite index untuk optimasi WHERE clause yang kompleks
-- Used in: RPC functions dengan multiple filters
CREATE INDEX IF NOT EXISTS idx_skgb_penggilingan_optimal_filter 
ON public.skgb_penggilingan (kdkab, tahun, flag_sampel, status_pendataan) 
WHERE nmkab IS NOT NULL AND kdkab IS NOT NULL;

-- 10. Index untuk desa combination (handling duplicate desa codes)
-- Used in: summary calculations dengan kombinasi kddesa + kdkec
CREATE INDEX IF NOT EXISTS idx_skgb_penggilingan_desa_combination 
ON public.skgb_penggilingan (kddesa, kdkec, flag_sampel);

-- =============================================================================
-- ANALYZE TABLES (Update statistics for query planner)
-- =============================================================================

-- Update table statistics for better query planning
ANALYZE public.skgb_pengeringan;
ANALYZE public.skgb_penggilingan;

-- =============================================================================
-- PERFORMANCE MONITORING QUERIES
-- =============================================================================

-- Check index usage statistics
-- Run these queries periodically to monitor index effectiveness

-- Check index usage for skgb_pengeringan
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
WHERE tablename = 'skgb_pengeringan'
ORDER BY idx_scan DESC;

-- Check index usage for skgb_penggilingan
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
WHERE tablename = 'skgb_penggilingan'
ORDER BY idx_scan DESC;

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE tablename IN ('skgb_pengeringan', 'skgb_penggilingan');

-- =============================================================================
-- NOTES & RECOMMENDATIONS
-- =============================================================================

/*
PERFORMANCE OPTIMIZATION STRATEGY:

1. MOST CRITICAL INDEXES (implement first):
   - idx_skgb_pengeringan_kabupaten_tahun
   - idx_skgb_penggilingan_kabupaten_tahun
   - idx_skgb_pengeringan_optimal_filter
   - idx_skgb_penggilingan_optimal_filter

2. SECONDARY INDEXES (implement if still slow):
   - All flag_sampel and status_pendataan indexes
   - Created_at year indexes
   - Grouping indexes for summary calculations

3. QUERY OPTIMIZATION TARGETS:
   - Dashboard monitoring data fetch (1350ms → target <200ms)
   - Detail view loading (kabupaten drill-down)
   - Search functionality in data tables
   - Summary calculations for cards

4. MONITORING:
   - Run ANALYZE regularly (weekly/monthly)
   - Monitor index usage statistics
   - Check for unused indexes after 1 month
   - Consider partial indexes if data is heavily skewed

5. ALTERNATIVE OPTIMIZATIONS:
   - Consider materialized views for dashboard summaries
   - Implement caching layer for frequently accessed data
   - Use connection pooling (already using Supabase pooler)
   - Consider data archiving for old years

6. EXPECTED PERFORMANCE IMPROVEMENTS:
   - Dashboard load: 1350ms → 200-400ms
   - Detail views: 50-80% faster
   - Search queries: 60-90% faster
   - Summary calculations: 70-90% faster
*/
