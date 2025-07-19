# SKGB Performance Optimization Analysis

## Performance Issue Identified
**Problem**: `🐌 Slow operation detected: SKGB-Data-Fetch took 1350.70ms`
**Target**: Reduce to <400ms for acceptable dashboard performance

## Root Cause Analysis

### Current Query Patterns
Berdasarkan analisis RPC functions yang digunakan dashboard:

1. **get_skgb_monitoring_data**: 
   - `WHERE (p_tahun IS NULL OR EXTRACT(YEAR FROM sp.created_at) = p_tahun)`
   - `GROUP BY sp.nmkab, sp.kdkab`
   - **No indexes on**: `EXTRACT(YEAR FROM created_at)`, kabupaten grouping

2. **get_skgb_penggilingan_monitoring_data**:
   - `WHERE (p_tahun IS NULL OR sp.tahun = p_tahun)`
   - `GROUP BY sp.nmkab, sp.kdkab`
   - **No indexes on**: tahun, kabupaten grouping

3. **Detail queries** (get_skgb_detail_by_kabupaten):
   - Multiple WHERE filters: `kdkab`, `tahun`, `flag_sampel`, `status_pendataan`
   - **No composite indexes** for combined filters

### Performance Bottlenecks

1. **Missing Primary Indexes**:
   - `tahun` column (heavily filtered)
   - `EXTRACT(YEAR FROM created_at)` (computed column)
   - `flag_sampel` (U/C filtering)
   - `status_pendataan` (realisasi calculation)

2. **Missing Composite Indexes**:
   - `(kdkab, tahun)` - most common combination
   - `(kdkab, tahun, flag_sampel, status_pendataan)` - complex filters
   - `(lokasi, kdkec)` - untuk pengeringan summary
   - `(kddesa, kdkec)` - untuk penggilingan summary

3. **Table Scans on Large Tables**:
   - COUNT operations without proper indexes
   - GROUP BY operations without covering indexes
   - Search functionality tanpa text indexes

## Recommended Index Strategy

### Phase 1: Critical Performance Indexes (Implement First)
```sql
-- Most impactful for dashboard performance
CREATE INDEX idx_skgb_pengeringan_kabupaten_tahun ON skgb_pengeringan (kdkab, tahun);
CREATE INDEX idx_skgb_penggilingan_kabupaten_tahun ON skgb_penggilingan (kdkab, tahun);

-- Optimal composite indexes for complex WHERE clauses
CREATE INDEX idx_skgb_pengeringan_optimal_filter ON skgb_pengeringan (kdkab, tahun, flag_sampel, status_pendataan);
CREATE INDEX idx_skgb_penggilingan_optimal_filter ON skgb_penggilingan (kdkab, tahun, flag_sampel, status_pendataan);
```

### Phase 2: Supporting Indexes
```sql
-- Individual column indexes for flexibility
CREATE INDEX idx_skgb_pengeringan_flag_sampel ON skgb_pengeringan (flag_sampel);
CREATE INDEX idx_skgb_pengeringan_status_pendataan ON skgb_pengeringan (status_pendataan);
CREATE INDEX idx_skgb_penggilingan_flag_sampel ON skgb_penggilingan (flag_sampel);
CREATE INDEX idx_skgb_penggilingan_status_pendataan ON skgb_penggilingan (status_pendataan);
```

### Phase 3: Specialized Indexes
```sql
-- For summary calculations and grouping
CREATE INDEX idx_skgb_pengeringan_lokasi_kec ON skgb_pengeringan (lokasi, kdkec);
CREATE INDEX idx_skgb_penggilingan_desa_grouping ON skgb_penggilingan (kdkab, kdkec, kddesa, tahun);

-- For search functionality
CREATE INDEX idx_skgb_pengeringan_petugas ON skgb_pengeringan (petugas);
CREATE INDEX idx_skgb_penggilingan_nama_usaha ON skgb_penggilingan (nama_usaha);
```

## Expected Performance Improvements

### Query Performance Targets
- **Dashboard monitoring data**: 1350ms → 200-400ms (70-85% improvement)
- **Detail views (kabupaten drill-down)**: 50-80% faster
- **Search functionality**: 60-90% faster
- **Summary calculations**: 70-90% faster

### Specific RPC Function Optimizations

1. **get_skgb_monitoring_data**:
   - Before: Full table scan + EXTRACT function
   - After: Index scan on `(kdkab, created_year)` 
   - Expected: 80-90% faster

2. **get_skgb_penggilingan_monitoring_data**:
   - Before: Full table scan on tahun + GROUP BY
   - After: Index scan on `(kdkab, tahun)`
   - Expected: 75-85% faster

3. **Detail queries**:
   - Before: Multiple filter table scans
   - After: Single composite index scan
   - Expected: 70-80% faster

## Implementation Priority

### High Priority (Implement Immediately)
1. `idx_skgb_pengeringan_kabupaten_tahun`
2. `idx_skgb_penggilingan_kabupaten_tahun` 
3. `idx_skgb_pengeringan_optimal_filter`
4. `idx_skgb_penggilingan_optimal_filter`

### Medium Priority (Next Week)
5. Flag_sampel indexes
6. Status_pendataan indexes
7. Created_at year indexes

### Low Priority (Monitor Performance First)
8. Search indexes
9. Specialized grouping indexes
10. Partial indexes for data subsets

## Monitoring & Validation

### Performance Metrics to Track
```sql
-- Monitor index usage
SELECT tablename, indexname, idx_scan, idx_tup_read 
FROM pg_stat_user_indexes 
WHERE tablename IN ('skgb_pengeringan', 'skgb_penggilingan');

-- Check query performance
EXPLAIN ANALYZE SELECT ... -- your dashboard queries
```

### Success Criteria
- [ ] Dashboard load time < 400ms
- [ ] Detail views load < 200ms
- [ ] Search response < 100ms
- [ ] All indexes showing usage in pg_stat_user_indexes
- [ ] No sequential scans on large tables

## Alternative Optimizations (Future)

### Caching Strategy
- Browser caching for static lookups
- Redis caching for frequent queries
- Supabase realtime subscriptions

### Database Architecture
- Materialized views for dashboard summaries
- Partitioning by year for historical data
- Read replicas for reporting queries

### Application Level
- Implement query result caching
- Batch multiple queries into single RPC calls
- Use pagination for large result sets

## Risk Assessment

### Low Risk
- Standard B-tree indexes on commonly queried columns
- Composite indexes for known query patterns
- PostgreSQL automatically maintains indexes

### Medium Risk
- Index maintenance overhead (minimal for read-heavy workload)
- Slightly increased INSERT/UPDATE time (acceptable for dashboard)
- Storage overhead (~20-30% increase)

### Mitigation
- Monitor index usage after 1 month
- Remove unused indexes
- Regular ANALYZE for optimal query plans
- Set up monitoring alerts for slow queries

## Conclusion

The 1350ms performance issue is primarily due to missing indexes on frequently queried columns and composite filters. Implementing the recommended index strategy should reduce dashboard load times by 70-85%, providing a much better user experience.

**Next Steps**:
1. Run the index creation script
2. Monitor performance improvements
3. Validate with dashboard testing
4. Implement additional optimizations as needed
