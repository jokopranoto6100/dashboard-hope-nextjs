# 📊 Dynamic Scatter Plot Analysis - Evaluasi Ubinan

## Overview
Fitur Dynamic Scatter Plot Analysis memungkinkan pengguna untuk melakukan analisis korelasi antar variabel dalam data ubinan dengan visualisasi interaktif. User dapat memilih variabel X dan Y dari berbagai opsi yang tersedia, dengan filter berdasarkan tahun, komoditas, dan subround.

## 🎯 Features

### 🔄 Dynamic Variable Selection
- **Variabel X & Y**: Pilih dari 11+ variabel ubinan yang tersedia
- **Popular Combinations**: Preset kombinasi analisis yang umum digunakan
- **Real-time Updates**: Chart update otomatis saat variable berubah

### 📈 Interactive Scatter Plot
- **ECharts Integration**: Visualisasi profesional dengan ECharts
- **Correlation Analysis**: Kalkulasi koefisien korelasi Pearson otomatis
- **Trend Line**: Garis trend linear regression
- **Zoom & Pan**: Navigasi interaktif pada chart
- **Tooltip Details**: Info detail setiap data point

### 🎛️ Advanced Filtering
- **Tahun**: Filter berdasarkan tahun (dari YearContext)
- **Komoditas**: Filter berdasarkan jenis komoditas (Padi/Jagung)
- **Subround**: Filter berdasarkan subround atau semua data
- **Auto-sync**: Sinkronisasi dengan filter konteks evaluasi ubinan

### 📊 Data Insights
- **Data Point Size**: Ukuran titik berdasarkan jumlah record
- **Kabupaten Colors**: Warna konsisten per kabupaten
- **Statistical Summary**: Ringkasan jumlah data dan kabupaten
- **Performance Optimized**: RPC-based data fetching

## 🛠️ Technical Implementation

### Database Layer
**RPC Function**: `get_ubinan_scatter_plot_data`
```sql
-- Parameters
tahun_val: INTEGER
komoditas_val: TEXT  
subround_filter: TEXT (default: 'all')
x_variable: TEXT (default: 'r702')
y_variable: TEXT (default: 'r701')

-- Returns
kab, nama_kabupaten, x_value, y_value, record_count, 
komoditas, subround, tahun
```

**Features**:
- Dynamic column selection dengan format()
- Data validation (numeric values, > 0)
- Kabupaten name mapping
- Aggregation by grouping
- Subround filtering support

### Frontend Components

#### 1. **UbinanScatterPlot.tsx**
- ECharts scatter plot dengan customization
- Correlation coefficient calculation
- Linear regression trend line
- Interactive tooltips
- Responsive design

#### 2. **ScatterPlotVariableSelector.tsx** 
- Variable selection UI dengan descriptions
- Popular combination presets
- Current selection display
- User-friendly interface

#### 3. **scatter-plot/page.tsx**
- Main page component
- Filter integration
- Error handling
- Loading states
- Data summary display

#### 4. **useUbinanScatterPlotData.ts**
- Custom hook untuk data fetching
- Context integration (Year, Filter)
- Error handling
- Loading states management

#### 5. **scatter-plot-constants.ts**
- Variable definitions dengan metadata
- Popular combinations
- Utility functions
- Label dan unit mapping

### Data Flow
```
User Selection → Variable Selector → Hook → RPC Call → 
Data Processing → Chart Rendering → Interactive Display
```

## 🎨 Available Variables

### Primary Variables
- **r701**: Hasil Ubinan (kuintal/ha) - Target utama analisis
- **r702**: Jumlah Rumpun - Indikator produktivitas
- **r604**: Luas Ubinan (m²) - Kontrol konsistensi
- **r608**: Benih yang Digunakan (kg) - Input analysis

### Fertilizer Variables
- **r610_1**: Pupuk Urea (kg)
- **r610_2**: Pupuk TSP (kg) 
- **r610_3**: Pupuk KCL (kg)
- **r610_4**: Pupuk NPK (kg)
- **r610_5**: Pupuk Kompos (kg)
- **r610_6**: Pupuk Organik Cair (liter)
- **r610_7**: Pupuk ZA (kg)

## 🔥 Popular Analysis Combinations

### 1. **Productivity Analysis**
- **r702 vs r701**: Jumlah Rumpun → Hasil Ubinan
- **r604 vs r701**: Luas Ubinan → Hasil (consistency check)

### 2. **Input Efficiency**
- **r608 vs r701**: Benih → Hasil
- **r610_1 vs r701**: Pupuk Urea → Hasil
- **r610_4 vs r701**: Pupuk NPK → Hasil

### 3. **Resource Optimization**
- **r610_1 vs r610_4**: Urea vs NPK (fertilizer mix)
- **r608 vs r702**: Benih vs Rumpun (seeding efficiency)

## 📍 Navigation & Access

### From Main Evaluasi Page
- **Mode Analisis Card** → "Scatter Plot Analysis" button
- **URL**: `/evaluasi/ubinan/scatter-plot`
- **Layout**: Dedicated layout dengan UbinanEvaluasiFilterProvider

### Filter Integration
- Menggunakan **UbinanEvaluasiFilterContext**
- Auto-sync dengan filter halaman evaluasi utama
- Konsisten dengan filter tahun, komoditas, subround

## 🎯 Usage Examples

### Basic Analysis
1. Pilih tahun dan komoditas di filter
2. Klik "Scatter Plot Analysis" di halaman evaluasi
3. Gunakan preset "Jumlah Rumpun vs Hasil Ubinan"
4. Analisis korelasi dan trend line

### Advanced Analysis
1. Pilih variabel custom (X: r610_1, Y: r701)
2. Filter subround spesifik
3. Analisis efektivitas pupuk Urea
4. Compare dengan tahun berbeda (manual)

### Multi-variable Comparison
1. Gunakan beberapa kombinasi variabel
2. Screenshot/export untuk reporting
3. Bandingkan koefisien korelasi
4. Identifikasi pola optimal

## 🔧 Configuration

### Chart Customization
- **Symbol Size**: Berdasarkan record_count (8-20px)
- **Colors**: 14 warna berbeda per kabupaten
- **Trend Line**: Dashed line dengan linear regression
- **Zoom**: Inside zoom untuk X dan Y axis

### Data Validation
- **Numeric Check**: Regex validation untuk angka
- **Positive Values**: Hanya nilai > 0
- **Non-null**: Exclude NULL values
- **Type Safety**: TypeScript untuk semua interfaces

## 🚀 Performance Features

### Optimized Data Loading
- **RPC-based**: Pre-aggregated data di database
- **Grouped Data**: Mengurangi data points duplikat
- **Lazy Loading**: Data fetch hanya saat diperlukan
- **Debounced**: Hook optimization untuk performa

### Responsive Design
- **Mobile Friendly**: Grid layout responsif
- **Touch Support**: ECharts touch gestures
- **Loading States**: Skeleton dan spinner
- **Error Boundaries**: Graceful error handling

## 🔮 Future Enhancements

### Planned Features
1. **Export Options**: PNG/SVG chart export
2. **Multiple Comparison**: Compare multiple years in one chart
3. **Statistical Tests**: Significance testing
4. **Regression Analysis**: Multiple regression models
5. **Clustering**: K-means clustering visualization
6. **Animation**: Transition animations antar variables

### Integration Possibilities
1. **Report Generation**: PDF reports dengan scatter plots
2. **API Endpoints**: REST API untuk external access
3. **Dashboard Widgets**: Embed di dashboard lain
4. **Machine Learning**: Predictive analytics integration

---

## 📝 Files Created/Modified

### New Files
- `sql/create_ubinan_scatter_plot_rpc.sql`
- `src/hooks/useUbinanScatterPlotData.ts`
- `src/app/(dashboard)/evaluasi/ubinan/scatter-plot-constants.ts`
- `src/app/(dashboard)/evaluasi/ubinan/UbinanScatterPlot.tsx`
- `src/app/(dashboard)/evaluasi/ubinan/ScatterPlotVariableSelector.tsx`
- `src/app/(dashboard)/evaluasi/ubinan/scatter-plot/page.tsx`
- `src/app/(dashboard)/evaluasi/ubinan/scatter-plot/layout.tsx`

### Modified Files
- `src/app/(dashboard)/evaluasi/ubinan/types.ts` (added scatter plot types)
- `src/app/(dashboard)/evaluasi/ubinan/evaluasi-ubinan-client.tsx` (added navigation button)

### Dependencies
- ✅ ECharts & echarts-for-react (already installed)
- ✅ Existing UI components (Card, Select, Button, etc.)
- ✅ Existing contexts (YearContext, UbinanEvaluasiFilterContext)

**Status**: ✅ Ready to use! Jalankan SQL untuk create RPC function, lalu akses melalui halaman evaluasi ubinan.
