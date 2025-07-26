# Dynamic Filter Options Implementation

## Masalah Yang Diselesaikan
- ✅ **Hardcoded Komoditas**: Filter komoditas sebelumnya hardcode hanya 3 pilihan (Padi Sawah, Padi Ladang, Jagung)
- ✅ **Static Subround**: Filter subround juga hardcode dengan asumsi hanya ada Subround 1, 2, 3
- ✅ **Missing Data Counts**: Tidak ada informasi berapa banyak data tersedia untuk setiap option

## Solusi Yang Diimplementasikan

### 1. Dynamic Komoditas Options (`useKomoditasOptions`)
```typescript
// Mengambil semua komoditas yang tersedia di database untuk tahun tertentu
const { data } = await supabase
  .from('ubinan_raw')
  .select('komoditas')
  .eq('tahun', selectedYear.toString())
  .not('komoditas', 'is', null)
  .not('r701', 'is', null)
  .not('r702', 'is', null);

// Grouping dan counting
const komoditasMap = new Map<string, number>();
data.forEach(row => {
  const komoditas = row.komoditas?.trim();
  if (komoditas) {
    komoditasMap.set(komoditas, (komoditasMap.get(komoditas) || 0) + 1);
  }
});
```

**Features:**
- ✅ Query real-time dari database berdasarkan tahun yang dipilih
- ✅ Menampilkan jumlah data untuk setiap komoditas
- ✅ Automatic sorting berdasarkan nama komoditas
- ✅ Filter hanya komoditas yang memiliki data r701 dan r702 (diperlukan untuk scatter plot)
- ✅ Loading states dan error handling

### 2. Dynamic Subround Options (`useSubroundOptions`)
```typescript
// Mengambil semua subround yang tersedia untuk komoditas dan tahun tertentu
const { data } = await supabase
  .from('ubinan_raw')
  .select('subround')
  .eq('tahun', selectedYear.toString())
  .like('komoditas', `%${selectedKomoditas}%`)
  .not('subround', 'is', null)
  .not('r701', 'is', null)
  .not('r702', 'is', null);
```

**Features:**
- ✅ Reactive terhadap perubahan komoditas yang dipilih
- ✅ Menampilkan "Semua Subround" dengan total count
- ✅ Individual subround dengan count masing-masing
- ✅ Sorting berdasarkan nomor subround
- ✅ Disabled state ketika komoditas belum dipilih

### 3. Enhanced UI Experience
```tsx
// Komoditas dropdown dengan data count
{komoditasOptions.map((option) => (
  <SelectItem key={option.value} value={option.value}>
    {option.label} ({option.count.toLocaleString()} data)
  </SelectItem>
))}

// Subround dropdown reactive
<Select 
  value={selectedSubround} 
  onValueChange={setSelectedSubround}
  disabled={isLoadingSubround || subroundOptions.length === 0 || !selectedKomoditas}
>
```

**Features:**
- ✅ Loading states yang informatif untuk setiap dropdown
- ✅ Data counts ditampilkan dalam format yang mudah dibaca
- ✅ Dependency management (subround tergantung komoditas)
- ✅ Placeholder yang contextual berdasarkan state

## File-File Yang Dibuat/Dimodifikasi

### New Hooks
- `src/hooks/useKomoditasOptions.ts` - ✅ Hook untuk dynamic komoditas options
- `src/hooks/useSubroundOptions.ts` - ✅ Hook untuk dynamic subround options

### Modified Files
- `src/app/(dashboard)/evaluasi/ubinan/scatter-plot/page.tsx` - ✅ Update UI untuk menggunakan dynamic options
- `src/hooks/useUbinanScatterPlotData.ts` - ✅ Simplify komoditas filter logic

## Hasil Yang Dicapai

### ✅ **Data Completeness**
- Menampilkan **semua komoditas** yang tersedia di database (tidak terbatas 3 pilihan)
- Menampilkan **semua subround** yang tersedia untuk komoditas tertentu
- Real-time data counts untuk setiap option

### ✅ **User Experience**
- Filter cascade: Komoditas → Subround (subround tergantung komoditas yang dipilih)
- Loading states yang jelas untuk setiap tahap
- Data counts membantu user memahami volume data
- Auto-selection komoditas default (Padi Sawah jika tersedia)

### ✅ **Performance & Reliability**
- Query optimized dengan proper indexing conditions
- Error handling untuk setiap hook
- Efficient re-querying hanya ketika dependencies berubah
- Memory efficient dengan proper cleanup

## Contoh Output

### Komoditas Options (contoh):
```
Bawang Merah (1,250 data)
Cabai Besar (890 data)
Jagung (15,340 data)
Kacang Tanah (560 data)
Padi Ladang (2,100 data)
Padi Sawah (25,680 data)
Ubi Kayu (780 data)
```

### Subround Options untuk Padi Sawah (contoh):
```
Semua Subround (25,680 data)
Subround 1 (8,560 data)
Subround 2 (8,720 data)
Subround 3 (8,400 data)
```

## Cara Kerja

1. **Page Load**: User memilih tahun dari header
2. **Komoditas Loading**: `useKomoditasOptions` query database untuk tahun tersebut
3. **Komoditas Selection**: User pilih komoditas, auto-select default jika belum dipilih
4. **Subround Loading**: `useSubroundOptions` query database untuk komoditas+tahun tersebut
5. **Subround Selection**: User pilih subround (default "all")
6. **Data Fetching**: `useUbinanScatterPlotData` fetch data scatter plot dengan filter lengkap

## Benefits

### 🎯 **Accuracy**
- Data filter sesuai dengan apa yang benar-benar ada di database
- Tidak ada "empty state" karena memilih komoditas yang tidak tersedia

### 📊 **Transparency**
- User tahu berapa banyak data yang akan ditampilkan sebelum memilih
- Clear indication jika suatu kombinasi filter tidak memiliki data

### 🚀 **Scalability**
- Automatic adaptation ketika data baru ditambahkan ke database
- No code changes needed untuk komoditas atau subround baru

### 💡 **Smart Defaults**
- Auto-select Padi Sawah jika tersedia (komoditas paling umum)
- Fallback ke komoditas pertama jika Padi Sawah tidak ada
- Reset subround ke "all" ketika komoditas berubah
