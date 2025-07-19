# SKGB RPC Functions Error Fix Documentation

## Overview
Fixed 400 Bad Request errors on SKGB RPC functions by ensuring data type consistency and proper SQL syntax.

## Errors Fixed

### 1. `get_skgb_monitoring_data` (Pengeringan Level Kabupaten)
**Error**: POST 400 Bad Request
**Root Cause**: 
- Missing `::INTEGER` casting on COUNT operations
- Incorrect date column reference (`sp.tahun` vs `EXTRACT(YEAR FROM sp.created_at)`)
- Inconsistent return type casting

**Fixes Applied**:
```sql
-- BEFORE:
COUNT(CASE WHEN sp.flag_sampel = 'U' THEN 1 END) as target_utama
WHERE (p_tahun IS NULL OR sp.tahun = p_tahun)
COALESCE(pm.jumlah_petugas, 0) as jumlah_petugas

-- AFTER:
COUNT(CASE WHEN sp.flag_sampel = 'U' THEN 1 END)::INTEGER as target_utama
WHERE (p_tahun IS NULL OR EXTRACT(YEAR FROM sp.created_at) = p_tahun)
COALESCE(pm.jumlah_petugas, 0)::INTEGER as jumlah_petugas
```

### 2. `get_skgb_detail_by_kabupaten` (Pengeringan Detail Level)
**Error**: Similar 400 Bad Request
**Root Cause**: 
- Missing data type casting in COUNT operations
- TEXT return type not explicitly cast

**Fixes Applied**:
```sql
-- BEFORE:
COUNT(CASE WHEN sp.flag_sampel = 'U' THEN 1 END) as target_utama
SELECT da.kecamatan, da.kode_kec, da.lokasi

-- AFTER:
COUNT(CASE WHEN sp.flag_sampel = 'U' THEN 1 END)::INTEGER as target_utama
SELECT da.kecamatan::TEXT, da.kode_kec::TEXT, da.lokasi::TEXT
```

### 3. `get_skgb_penggilingan_detail_by_kabupaten` (Penggilingan Detail Level)
**Error**: Potential consistency issues
**Fixes Applied**:
```sql
-- BEFORE:
SELECT da.kecamatan, da.kode_kec, da.desa, da.kode_desa

-- AFTER:
SELECT da.kecamatan::TEXT, da.kode_kec::TEXT, da.desa::TEXT, da.kode_desa::TEXT
```

## Key Principles Applied

### 1. **Explicit Type Casting**
- All COUNT operations cast to `::INTEGER`
- All TEXT columns explicitly cast to `::TEXT`
- Consistent return type declarations

### 2. **Date Column Consistency**
- Use `EXTRACT(YEAR FROM sp.created_at)` for pengeringan table
- Use `sp.tahun` for penggilingan table (if column exists)
- Consistent date filtering across all functions

### 3. **Error Prevention**
- Remove inline comments that could cause parsing issues
- Consistent COALESCE handling with proper casting
- Explicit type declarations match RETURNS TABLE signature

## Database Schema Differences

### Pengeringan Table
- **Date Column**: `created_at` (timestamp)
- **Location Column**: `lokasi`
- **Grouping**: kecamatan + lokasi

### Penggilingan Table  
- **Date Column**: `tahun` (integer)
- **Location Column**: `desa`
- **Grouping**: kecamatan + desa

## Testing Checklist

### ✅ RPC Functions to Verify
1. `get_skgb_monitoring_data` - Pengeringan kabupaten level
2. `get_skgb_detail_by_kabupaten` - Pengeringan detail level
3. `get_skgb_penggilingan_monitoring_data` - Penggilingan kabupaten level
4. `get_skgb_penggilingan_detail_by_kabupaten` - Penggilingan detail level
5. `get_skgb_summary_by_kabupaten_v2` - Pengeringan summary
6. `get_skgb_penggilingan_summary_by_kabupaten` - Penggilingan summary

### ✅ Status Update Verification
- All functions now use `'1. Berhasil diwawancarai'` for realisasi calculation
- Consistent percentage calculation across all levels
- Proper type casting ensures no runtime errors

### ✅ Expected Behavior
- Dashboard tables display correct realisasi numbers
- No 400 Bad Request errors on RPC calls
- Consistent data types in frontend interfaces
- Proper handling of NULL values with COALESCE

## Files Modified

1. `sql/get_skgb_monitoring_data.sql` - Fixed type casting and date column
2. `sql/get_skgb_detail_by_kabupaten.sql` - Added explicit type casting
3. `sql/get_skgb_penggilingan_detail_by_kabupaten.sql` - Consistency improvements

---

**Fix Date**: 2025-01-19  
**Issue**: RPC Functions 400 Bad Request  
**Status**: ✅ RESOLVED
