# Padi Monitoring Hook Logic Update

## Changes Made

### 1. Removed Commodity Filter
- **REMOVED**: `queryPadi = queryPadi.in('komoditas', ['1 - Padi Sawah', '3 - Padi Ladang']);`
- **REASON**: All data in `ubinan_dashboard` table is already padi commodity, so filtering by commodity is redundant

### 2. Updated Column Selection
- **REMOVED**: `'komoditas'` from `selectColumns` array
- **KEPT**: All other essential columns for padi monitoring
- **RESULT**: More efficient query with fewer unnecessary columns

### 3. Updated Debug Logging
- **REMOVED**: `komoditas` and `uniqueKomoditas` from debug output
- **ADDED**: `jenissSampelDistribution` to show breakdown of sample types:
  - `utama`: Count of records with `jenis_sampel = 'U'`
  - `cadangan`: Count of records with `jenis_sampel = 'C'`  
  - `lainnya`: Count of records with other sample types

## Target Calculation Logic (Unchanged)

The core logic for calculating targets remains the same:

```typescript
// Target Utama: jenis_sampel = "U"
if (row.jenis_sampel === "U") {
    groupedData[originalNmkab].targetUtama += 1; 
    totalTargetUtama += 1;
}

// Cadangan: jenis_sampel = "C"
if (row.jenis_sampel === "C") {
    groupedData[originalNmkab].cadangan += 1; 
    totalCadangan += 1;
}

// Realisasi: r701 has valid data
if (row.r701 !== null && row.r701 !== undefined && String(row.r701).trim() !== '') {
    groupedData[originalNmkab].realisasi += 1; 
    totalRealisasi += 1;
}
```

## Final Query Structure

The hook now performs this equivalent SQL query:

```sql
SELECT nmkab, jenis_sampel, r701, tahun, subround, kab, anomali, 
       timestamp_refresh, status, kegiatan_id, [lastMonthColumn], 
       [lewatPanenColumns...]
FROM ubinan_dashboard 
WHERE tahun = [selectedYear]
  AND subround = [selectedSubround]  -- if not 'all'
-- No commodity filter needed since all data is padi
```

## Benefits

1. **Simplified Logic**: Removed unnecessary commodity filtering
2. **Better Performance**: Fewer columns selected, no redundant filtering
3. **More Accurate**: Relies on the fact that `ubinan_dashboard` contains only padi data
4. **Better Debugging**: New debug output shows sample type distribution

## Verification

- ✅ TypeScript compilation successful
- ✅ All target calculation logic preserved
- ✅ Debug logging enhanced for better monitoring
- ✅ Query optimization implemented
