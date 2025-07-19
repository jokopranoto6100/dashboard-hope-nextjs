# SKGB Status Pendataan Enhancement Documentation

## Overview
Updated SKGB status pendataan system from hardcoded 2-option binary system to comprehensive 7-option workflow management with different status sets for penggilingan and pengeringan.

## Changes Made

### 1. Status Options Expansion

#### Previous System (Hardcoded)
- "Belum Didata"
- "Selesai Didata"

#### New System (Comprehensive)

**Penggilingan Status Options:**
1. "Belum Didata" *(default)*
2. "1. Berhasil diwawancarai"
3. "2. Tidak bersedia diwawancarai"
4. "3. Tidak dapat diwawancarai sampai dengan batas akhir pencacahan"
5. "4. Belum berproduksi atau tidak melakukan penggilingan gabah"
6. "5. Bukan perusahaan/usaha penggilingan (termasuk yang ganda)"
7. "6. Pindah ke luar kabupaten/kota atau tidak ditemukan"
8. "7. Tutup"

**Pengeringan Status Options:**
1. "Belum Didata" *(default)*
2. "1. Berhasil diwawancarai"
3. "2. Tidak bersedia diwawancarai"
4. "3. Tidak dapat diwawancarai sampai batas akhir pencacahan"
5. "4. Belum panen sampai batas waktu pendataan"
6. "5. Lewat panen"
7. "6. Gagal panen"
8. "7. Tidak diwawancarai dengan alasan lainnya"

### 2. Code Changes

#### A. SkgbEditForm.tsx Updates

**Status Constants:**
```typescript
// Status pendataan options untuk Penggilingan
const PENGGILINGAN_STATUS_OPTIONS = [
  "Belum Didata",
  "1. Berhasil diwawancarai",
  "2. Tidak bersedia diwawancarai", 
  "3. Tidak dapat diwawancarai sampai dengan batas akhir pencacahan",
  "4. Belum berproduksi atau tidak melakukan penggilingan gabah",
  "5. Bukan perusahaan/usaha penggilingan (termasuk yang ganda)",
  "6. Pindah ke luar kabupaten/kota atau tidak ditemukan",
  "7. Tutup"
] as const;

// Status pendataan options untuk Pengeringan
const PENGERINGAN_STATUS_OPTIONS = [
  "Belum Didata",
  "1. Berhasil diwawancarai",
  "2. Tidak bersedia diwawancarai",
  "3. Tidak dapat diwawancarai sampai batas akhir pencacahan", 
  "4. Belum panen sampai batas waktu pendataan",
  "5. Lewat panen",
  "6. Gagal panen",
  "7. Tidak diwawancarai dengan alasan lainnya"
] as const;
```

**Dynamic Schema Creation:**
```typescript
// Create dynamic schema based on SKGB type
const createFormSchema = (skgbType: 'pengeringan' | 'penggilingan') => {
  const statusOptions = skgbType === 'penggilingan' ? PENGGILINGAN_STATUS_OPTIONS : PENGERINGAN_STATUS_OPTIONS;
  
  return z.object({
    petugas: z.string().min(1, "Petugas harus dipilih"),
    email_petugas: z.string().email("Email petugas tidak valid"),
    status_pendataan: z.enum(statusOptions, {
      errorMap: () => ({ message: "Status pendataan tidak valid" })
    }),
  });
};
```

**Dynamic Select Options:**
```typescript
<SelectContent>
  {(skgbType === 'penggilingan' ? PENGGILINGAN_STATUS_OPTIONS : PENGERINGAN_STATUS_OPTIONS).map((status) => (
    <SelectItem key={status} value={status}>
      {status}
    </SelectItem>
  ))}
</SelectContent>
```

**Badge Variant Logic:**
```typescript
// Helper function to get badge variant based on status
const getStatusBadgeVariant = (status: string | null) => {
  if (!status || status === "Belum Didata") return "secondary";
  if (status === "1. Berhasil diwawancarai") return "default";
  return "outline";
};
```

#### B. RPC Functions Updates

**Pengeringan Level Kabupaten (get_skgb_monitoring_data.sql):**
```sql
-- NEW FILE: Created for district-level pengeringan monitoring
-- Updated realisasi calculation
-- OLD: status_pendataan = 'Selesai Didata'
-- NEW: status_pendataan = '1. Berhasil diwawancarai'
COUNT(CASE WHEN sp.status_pendataan = '1. Berhasil diwawancarai' AND sp.flag_sampel = 'U' THEN 1 END)::INTEGER as realisasi
```

**Pengeringan Detail Level (get_skgb_detail_by_kabupaten.sql):**
```sql
-- NEW FILE: Created for detail-level pengeringan monitoring
-- Updated realisasi calculation
-- OLD: status_pendataan = 'Selesai Didata'
-- NEW: status_pendataan = '1. Berhasil diwawancarai'
COUNT(CASE WHEN sp.status_pendataan = '1. Berhasil diwawancarai' AND sp.flag_sampel = 'U' THEN 1 END)::INTEGER as realisasi
```

**Pengeringan (get_skgb_summary_by_kabupaten_v2.sql):**
```sql
-- Updated realisasi calculation
-- OLD: status_pendataan = 'Selesai Didata'
-- NEW: status_pendataan = '1. Berhasil diwawancarai'
COUNT(CASE WHEN sp.status_pendataan = '1. Berhasil diwawancarai' AND sp.flag_sampel = 'U' THEN 1 END)::INTEGER as realisasi
```

**Penggilingan Level Kabupaten (get_skgb_penggilingan_monitoring_data.sql):**
```sql
-- Updated realisasi calculation
-- OLD: status_pendataan = 'Selesai Didata'
-- NEW: status_pendataan = '1. Berhasil diwawancarai'
COUNT(CASE WHEN sp.status_pendataan = '1. Berhasil diwawancarai' AND sp.flag_sampel = 'U' THEN 1 END)::INTEGER as realisasi
```

**Penggilingan Detail Level (get_skgb_penggilingan_detail_by_kabupaten.sql):**
```sql
-- Updated realisasi calculation
-- OLD: status_pendataan = 'Selesai Didata'
-- NEW: status_pendataan = '1. Berhasil diwawancarai'
COUNT(CASE WHEN sp.status_pendataan = '1. Berhasil diwawancarai' AND sp.flag_sampel = 'U' THEN 1 END)::INTEGER as realisasi
```

**Penggilingan (get_skgb_penggilingan_summary_by_kabupaten.sql):**
```sql
-- Updated realisasi calculation
-- OLD: status_pendataan = 'Selesai Didata'
-- NEW: status_pendataan = '1. Berhasil diwawancarai'
(SELECT COUNT(*)::INTEGER FROM skgb_penggilingan sp WHERE sp.kdkab = p_kode_kab AND sp.tahun = p_tahun AND sp.status_pendataan = '1. Berhasil diwawancarai' AND sp.flag_sampel = 'U') as realisasi
```

### 3. Business Logic Updates

#### Realisasi Calculation Change
- **Previous**: Counted records with `status_pendataan = 'Selesai Didata'`
- **New**: Counts records with `status_pendataan = '1. Berhasil diwawancarai'`
- **Impact**: More precise realisasi tracking as it only counts successfully interviewed records, not all completed data collection attempts

#### Default Status Behavior
- **Default Status**: "Belum Didata" (maintained for both penggilingan and pengeringan)
- **Form Population**: Dynamic validation ensures only appropriate status options are used based on skgbType
- **Backward Compatibility**: Existing records with old status values are handled gracefully

### 4. Type Safety Improvements

#### Dynamic Form Schema
- Form schema now adapts based on `skgbType` prop
- Conditional validation ensures only valid status options for each SKGB type
- Type-safe form handling with proper TypeScript inference

#### Status Option Management
- Centralized status option constants for maintainability
- Consistent status options across form validation, select components, and badge display
- Type-safe status handling with compile-time validation

### 5. UI/UX Enhancements

#### Status Display
- Dynamic badge colors based on status type:
  - `secondary` (gray): "Belum Didata" 
  - `default` (blue): "1. Berhasil diwawancarai"
  - `outline` (border): Other status options

#### Form Experience
- Context-aware status options (different for penggilingan vs pengeringan)
- Improved select component with comprehensive workflow status options
- Maintains "Belum Didata" as default for new records

### 6. Database Impact

#### Status Values in Database
- Database now stores more granular status information
- Better tracking of data collection workflow stages
- Improved reporting capabilities with detailed status breakdown

#### KPI Calculation Accuracy
- Realisasi calculation now reflects actual successful interviews
- More accurate progress tracking and completion rates
- Better alignment with field data collection workflow

### 7. Testing Considerations

#### Status Validation Testing
- Test form validation with all status options for both penggilingan and pengeringan
- Verify proper handling of legacy data with old status values
- Ensure correct badge display for all status types

#### RPC Function Testing
- Verify realisasi calculation accuracy with new status criteria
- Test KPI calculations with mixed old/new status data
- Validate proper counting for "1. Berhasil diwawancarai" status

#### UI Component Testing
- Test dynamic status options rendering based on skgbType
- Verify form reset and population with various status values
- Ensure proper TypeScript compilation and type safety

## Migration Notes

### Data Migration
- Existing records with "Selesai Didata" status should be evaluated and potentially migrated to "1. Berhasil diwawancarai" if they represent successful interviews
- Consider running data analysis to understand current status distribution

### User Training
- Users should be trained on new status options and their meanings
- Clear documentation needed for when to use each status option
- Field staff should understand the distinction between various non-interview status codes

### Monitoring
- Monitor realisasi calculation changes after deployment
- Track usage patterns of new status options
- Ensure KPI dashboards reflect accurate completion rates

## Files Modified

1. **src/app/(dashboard)/monitoring/skgb/components/SkgbEditForm.tsx**
   - Added status option constants
   - Implemented dynamic form schema
   - Updated select component options
   - Enhanced badge variant logic
   - Improved form population handling

2. **sql/get_skgb_summary_by_kabupaten_v2.sql**
   - Updated realisasi calculation logic

3. **sql/get_skgb_penggilingan_summary_by_kabupaten.sql**
   - Updated realisasi calculation logic

4. **sql/get_skgb_monitoring_data.sql** *(NEW)*
   - Created district-level monitoring RPC for pengeringan
   - Updated realisasi calculation logic

5. **sql/get_skgb_detail_by_kabupaten.sql** *(NEW)*
   - Created detail-level monitoring RPC for pengeringan
   - Updated realisasi calculation logic

6. **sql/get_skgb_penggilingan_monitoring_data.sql**
   - Updated realisasi calculation logic

7. **sql/get_skgb_penggilingan_detail_by_kabupaten.sql**
   - Updated realisasi calculation logic

## Completion Status

✅ **Completed:**
- Status option constants defined for both penggilingan and pengeringan
- Dynamic form schema creation based on skgbType
- Updated select component with appropriate status options
- Enhanced badge variant logic for better status visualization
- Updated RPC functions for accurate realisasi calculation
- Type safety improvements with proper TypeScript validation
- Form population handling for legacy data compatibility

🔄 **Future Enhancements:**
- Consider adding status change history tracking
- Implement validation rules for status progression
- Add reporting capabilities for status distribution analysis
- Consider automated status updates based on certain conditions

---

**Implementation Date**: 2025-01-19  
**Developer**: GitHub Copilot  
**Status**: ✅ Complete and Ready for Testing
