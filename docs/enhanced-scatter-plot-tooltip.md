# Enhanced Tooltip for Scatter Plot

## Overview
Tooltip pada scatter plot telah ditingkatkan untuk menampilkan informasi hasil ubinan dalam dua format satuan yang berbeda: ku/ha dan kg/plot.

## Changes Made

### Tooltip Enhancement
- **Location**: `src/app/(dashboard)/evaluasi/ubinan/UbinanScatterPlot.tsx`
- **Function**: Enhanced tooltip formatter in ECharts configuration

### New Features

#### 1. **Dual Unit Display for r701_per_ha**
Ketika variabel r701_per_ha (Hasil Ubinan) dipilih, tooltip akan menampilkan:
- **Hasil Ubinan**: nilai dalam ku/ha (format asli dari RPC)
- **Hasil Ubinan per Plot**: nilai dalam kg/plot (konversi dengan dibagi 16)

#### 2. **Smart Formatting**
- Menggunakan `formatHasilUbinan()` helper function
- Deteksi otomatis jika variabel adalah r701_per_ha
- Format angka dengan pemisah ribuan Indonesia
- Maksimal 2 digit desimal untuk presisi

### Example Tooltip Display

#### Before:
```
Sambas
Hasil Ubinan: 240.50 ku/ha
Jumlah Rumpun: 120 rumpun/plot
Jumlah Data: 15
Subround: 1
```

#### After:
```
Sambas
Hasil Ubinan: 240.50 ku/ha
Hasil Ubinan per Plot: 15.03 kg/plot
Jumlah Rumpun: 120 rumpun/plot
Subround: 1
```

### Technical Implementation

#### Conversion Formula
```typescript
const kgPlot = value / 16
```

#### Formatting Logic
```typescript
const formatHasilUbinan = (value: number, variable: string, label: string) => {
  if (variable === 'r701_per_ha') {
    const kuHa = Number(value).toLocaleString('id-ID', { maximumFractionDigits: 2 });
    const kgPlot = Number(value / 16).toLocaleString('id-ID', { maximumFractionDigits: 2 });
    return `
      <div>${label}: ${kuHa} ku/ha</div>
      <div>Hasil Ubinan per Plot: ${kgPlot} kg/plot</div>
    `;
  } else {
    return `<div>${label}: ${Number(value).toLocaleString('id-ID')} ${getVariableUnit(variable)}</div>`;
  }
};
```

### User Benefits

#### 1. **Better Context Understanding**
- Pengguna dapat melihat nilai dalam satuan yang familiar (kg/plot)
- Memudahkan interpretasi data lapangan

#### 2. **Dual Reference**
- ku/ha untuk analisis produktivitas per area
- kg/plot untuk referensi pengukuran aktual di lapangan

#### 3. **Cleaner Information**
- Menghapus "Jumlah Data" yang redundant
- Focus pada informasi yang meaningful

### Backward Compatibility
- ✅ Variabel non-r701_per_ha tetap ditampilkan normal
- ✅ Format tooltip konsisten untuk semua variabel
- ✅ Tidak ada breaking changes pada komponen lain

### Future Enhancements
Konsep yang sama bisa diterapkan untuk variabel lain yang membutuhkan dual unit display, seperti:
- r702 dengan rumpun/plot dan rumpun/ha (jika diperlukan)
- Variabel pupuk dengan format yang berbeda

## Related Files
- `src/app/(dashboard)/evaluasi/ubinan/UbinanScatterPlot.tsx` - Main tooltip implementation
- `src/app/(dashboard)/evaluasi/ubinan/scatter-plot-constants.ts` - Variable labels and units
- `sql/standardized_scatter_plot_rpc.sql` - RPC function with standardization
