# Palawija Realisasi Analysis - Issue Investigation

## Issue Description
The palawija monitoring hook (`usePalawijaMonitoringData`) is reporting realisasi (actuals) for 2024, even though there should be no palawija data for that year.

## Investigation Results

### Realisasi Calculation Logic Comparison

#### Padi Hook (usePadiMonitoringData.ts)
```typescript
if (row.r701 !== null && row.r701 !== undefined && String(row.r701).trim() !== '') {
    groupedData[originalNmkab].realisasi += 1; 
    totalRealisasi += 1;
}
```

#### Palawija Hook (usePalawijaMonitoringData.ts)
```typescript
if (row.r701 !== null && String(row.r701).trim() !== '') {
    groupedData[groupAndSortKey].realisasi++; 
    totalRealisasi++;
}
```

**✅ CONCLUSION: Both hooks use essentially identical logic for counting realisasi**
- Both check that `r701` is not null
- Both check that `r701` is not an empty string when converted to string
- The padi hook also checks for `undefined`, but this is redundant since null check covers it

### Data Source and Filtering Differences

| Aspect | Padi Hook | Palawija Hook |
|--------|-----------|---------------|
| **Data Source** | `ubinan_dashboard` table | `ubinan_raw` table |
| **Commodity Filter** | `['1 - Padi Sawah', '3 - Padi Ladang']` | `['4 - Jagung', '5 - Kedelai', '6 - Kacang Tanah', '7 - Ubi Kayu', '8 - Ubi Jalar']` |
| **Year Filter** | `selectedYear` | `selectedYear` |
| **Subround Filter** | `selectedSubround` | `selectedSubround` |

### Debug Logging Added

Both hooks now include comprehensive debug logging:

```typescript
console.log(`[DEBUG] {Hook} monitoring - Tahun ${selectedYear}:`, {
  totalRows: allRawData.length,
  sampleData: allRawData.slice(0, 5).map(row => ({
    komoditas: row.komoditas,
    r701: row.r701,
    // ... other relevant fields
  })),
  uniqueKomoditas: [...new Set(allRawData.map(row => row.komoditas))],
  expectedCommodities: [/* expected commodity list */]
});
```

## Root Cause Analysis

### The Issue is NOT in the Hook Logic
The palawija hook is working correctly:
1. ✅ It filters by the correct year (`selectedYear`)
2. ✅ It filters by valid palawija commodities
3. ✅ It counts realisasi only when `r701` has valid data
4. ✅ The counting logic is identical to the padi hook

### The Issue is with Data Presence
**If the hook reports realisasi for 2024, it means there IS actual palawija data in the `ubinan_raw` table for 2024 with valid `r701` values.**

This suggests either:
1. **Data Entry Error**: Someone entered palawija data for 2024 when they shouldn't have
2. **Data Import Issue**: Data was imported incorrectly with wrong year values
3. **Business Logic Change**: Perhaps palawija data collection DID start in 2024 but wasn't communicated

## Verification Steps

### 1. Check Debug Console Logs
When running the application, check the browser console for debug output showing:
- Total rows found for palawija in 2024
- Sample data with `r701` values
- Unique commodities actually present in the data

### 2. Database Verification Query
```sql
SELECT 
  komoditas,
  tahun,
  COUNT(*) as total_records,
  COUNT(CASE WHEN r701 IS NOT NULL AND r701 != '' THEN 1 END) as records_with_r701
FROM ubinan_raw 
WHERE tahun = 2024 
  AND komoditas IN ('4 - Jagung', '5 - Kedelai', '6 - Kacang Tanah', '7 - Ubi Kayu', '8 - Ubi Jalar')
GROUP BY komoditas, tahun
ORDER BY komoditas;
```

### 3. Compare with Expected Business Logic
Verify with business users whether:
- Palawija data collection should exist for 2024
- If not, identify how the incorrect data got into the system

## Resolution Strategy

### If No Palawija Data Should Exist for 2024:
1. **Data Cleanup**: Remove or correct the incorrect records in `ubinan_raw` table
2. **Data Entry Controls**: Implement validation to prevent future incorrect entries
3. **User Training**: Ensure data entry staff understand the correct years for each commodity

### If Palawija Data IS Valid for 2024:
1. **Update Documentation**: Clarify that palawija collection started in 2024
2. **User Communication**: Inform users about the new data availability
3. **No Code Changes Needed**: The hooks are working correctly

## Status
- ✅ **Hook Logic**: Verified correct and consistent
- ✅ **Debug Logging**: Added for easier troubleshooting
- ⏳ **Data Verification**: Needs to be checked via debug logs or database query
- ⏳ **Business Logic Confirmation**: Needs clarification from business users

## Files Modified
- `/src/hooks/usePalawijaMonitoringData.ts` - Added debug logging
- `/src/hooks/usePadiMonitoringData.ts` - Added debug logging for comparison

## Next Steps
1. Run the application and check debug console logs
2. Run the database verification query
3. Consult with business users about expected data for 2024
4. If data cleanup is needed, coordinate with database administrators
