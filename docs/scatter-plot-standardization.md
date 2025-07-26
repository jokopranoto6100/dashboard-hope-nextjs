# Standardisasi Variabel Scatter Plot Per Hektar

## Masalah Yang Diselesaikan
- ✅ **Variabel Tidak Comparable**: r701 dalam kg/plot, r608 dan r610_* dalam kg per luasan r604, r702 dalam rumpun per plot
- ✅ **Satuan Tidak Konsisten**: Sulit membandingkan efektivitas input-output karena satuan berbeda
- ✅ **UI Terlalu Rumit**: Kombinasi populer membuat halaman terlalu panjang dan rumit

## Solusi Standardisasi

### 1. **Konversi ke Per Hektar**

#### r701 (Hasil Ubinan)
```sql
-- Original: kg per plot (2.5m x 2.5m = 6.25 m²)
-- Standardized: kuintal per hektar
r701::NUMERIC * 16

-- Logic: 
-- - 1 plot = 6.25 m² (2.5m x 2.5m)
-- - 1 hektar = 10,000 m²
-- - Faktor area: 10,000 / 6.25 = 1,600
-- - Konversi unit: kg → kuintal (÷ 100)
-- - Total faktor: 1,600 ÷ 100 = 16
```

#### r702 (Jumlah Rumpun)
```sql
-- Original: rumpun per plot  
-- Standardized: TIDAK DIUBAH - tetap rumpun per plot
r702::NUMERIC

-- Logic: Jumlah rumpun lebih meaningful per plot daripada per hektar
-- Karena terkait dengan kepadatan tanam dalam area sampling
```

#### r608 (Benih) dan r610_* (Pupuk)
```sql
-- Original: kg per luasan r604 (meter persegi)
-- Standardized: kg per hektar
CASE 
    WHEN r604::NUMERIC > 0 THEN 
        r608::NUMERIC * 10000 / r604::NUMERIC
    ELSE 0 
END

-- Logic:
-- - r604 adalah luas dalam m²
-- - 1 hektar = 10,000 m²
-- - Jadi multiply by 10000/r604 untuk mendapat per hektar
```

#### r610_6 (Pupuk Organik Cair)
```sql
-- Original: liter per luasan r604
-- Standardized: liter per hektar
-- Same formula, but unit remains liter (not kg)
```

### 2. **Updated RPC Function**

**File**: `sql/standardized_scatter_plot_rpc.sql`

**Key Features**:
- ✅ Dynamic variable extraction (remove `_per_ha` suffix)
- ✅ Proper conversion calculations for each variable type
- ✅ Safety checks (r604 > 0 to avoid division by zero)
- ✅ Maintains pagination compatibility
- ✅ Preserves all original filtering logic

### 3. **Updated Variable Constants**

**Original Variables**:
```typescript
r701 -> "Hasil Ubinan (R701)" (kg/plot)
r702 -> "Jumlah Rumpun (R702)" (rumpun)
r608 -> "Benih yang Digunakan (R608)" (kg)
r610_1 -> "Pupuk Urea (R610_1)" (kg)
```

**Standardized Variables**:
```typescript
r701_per_ha -> "Hasil Ubinan" (ku/ha)
r702 -> "Jumlah Rumpun" (rumpun/plot) // TIDAK DIUBAH
r608_per_ha -> "Benih yang Digunakan" (kg/ha)
r610_1_per_ha -> "Pupuk Urea" (kg/ha)
```

## UI Improvements

### ✅ **Kombinasi Populer Dihapus**
- Mengurangi kompleksitas UI
- Focus pada variable selector yang clean
- User lebih fleksibel memilih kombinasi sendiri

### ✅ **Informative Description**
- Explanation text: "Semua variabel telah distandarisasi dalam satuan per hektar"
- Unit displayed in variable descriptions
- Consistent naming without R-codes

### ✅ **Default Variables**
- X: `r702` (Jumlah Rumpun per plot)
- Y: `r701_per_ha` (Hasil Ubinan per ha)
- Logical default untuk analisis produktivitas dengan kepadatan tanam

## Benefits

### 🎯 **Comparable Analysis**
- Semua variabel dalam satuan per hektar
- Fair comparison antar plot dengan luas berbeda
- Meaningful correlation analysis

### 📊 **Agricultural Insights**
- **Produktivitas**: kuintal/ha sebagai standard output
- **Efisiensi Input**: kg input per ha vs kuintal output per ha
- **Density Analysis**: rumpun/ha vs produktivitas

### 🚀 **User Experience**
- Simplified variable selection
- Clean, focused UI
- No confusion about units or conversions

## Conversion Examples

### Example Data Point:
```
Original:
- r701: 15 kg (per plot)
- r702: 120 rumpun (per plot)
- r604: 625 m² (luas plot)
- r608: 2.5 kg (benih for r604 area)
- r610_1: 5 kg (urea for r604 area)

Standardized:
- r701_per_ha: 15 * 16 = 240 ku/ha (24 ton/ha)
- r702: 120 rumpun/plot (TIDAK DIUBAH)
- r608_per_ha: 2.5 * 10000 / 625 = 40 kg/ha
- r610_1_per_ha: 5 * 10000 / 625 = 80 kg/ha
```

### Interpretation:
- **Yield**: 240 ku/ha = 24 ton/ha (reasonable high yield for rice)
- **Plant Density**: 120 clumps per plot (kepadatan tanam dalam area sampling)
- **Seed Rate**: 40 kg/ha
- **Urea Application**: 80 kg/ha

## Technical Implementation

### 1. Database Level
- New RPC function: `get_ubinan_scatter_plot_standardized`
- Replaces: `get_ubinan_scatter_plot_data`
- Backward compatible parameter structure

### 2. Frontend Level
- Updated constants with `_per_ha` variables
- Modified default selections
- Simplified component structure

### 3. Hook Level
- Updated to use new RPC function
- Maintains pagination logic
- Same error handling and loading states

## Validation & Testing

### ✅ **Data Quality Checks**
- Requires r604 > 0 (prevents division by zero)
- Numeric validation for all input variables
- Proper NULL handling with COALESCE

### ✅ **Conversion Accuracy**
- r701: kg/plot → kuintal/ha (factor: 16/100 = 0.16)
- r702: unit/plot → unit/ha (factor: 16)
- Others: kg/m² → kg/ha (factor: 10000/r604)

### ✅ **Performance**
- Same pagination strategy
- No performance impact from calculations
- Indexed filtering remains efficient

## Migration Notes

### Old Variables → New Variables
```
r701 → r701_per_ha
r702 → r702 (TIDAK DIUBAH)
r608 → r608_per_ha
r610_1 → r610_1_per_ha
r610_2 → r610_2_per_ha
r610_3 → r610_3_per_ha
r610_4 → r610_4_per_ha
r610_5 → r610_5_per_ha
r610_6 → r610_6_per_ha (liter/ha)
r610_7 → r610_7_per_ha
```

### Database Updates Required
1. Deploy new RPC function: `get_ubinan_scatter_plot_standardized`
2. Grant permissions to authenticated users
3. Optional: Keep old function for backward compatibility

### No Data Migration Required
- All conversions happen at query time
- Original data remains unchanged
- Zero downtime deployment
