# 🔍 **Review Hook Monitoring: Padi vs Palawija**

## 📊 **Perbandingan Lengkap Kedua Hook**

### 🌾 **usePadiMonitoringData Hook**

#### ✅ **Yang Sudah Benar:**
- **Filter Query Tepat**: `['1 - Padi Sawah', '3 - Padi Ladang']` ✅
- **Sumber Data**: `ubinan_dashboard` (view yang sudah diproses) ✅
- **Target Logic**: `jenis_sampel === "U"` untuk target utama ✅
- **Realisasi Logic**: `r701 !== null && trim !== ''` ✅

#### ⚠️ **Potensi Concern:**
- Menggunakan `ubinan_dashboard` (materialized view) vs `ubinan_raw`
- Tidak ada validasi komoditas di dalam loop (hanya mengandalkan filter query)
- Sebelumnya tidak ada debug logging (sudah ditambahkan)

### 🥕 **usePalawijaMonitoringData Hook**

#### ✅ **Yang Sudah Diperbaiki:**
- **Filter Query Tepat**: `['4 - Jagung', '5 - Kedelai', '6 - Kacang Tanah', '7 - Ubi Kayu', '8 - Ubi Jalar']` ✅
- **Sumber Data**: `ubinan_raw` (data mentah) ✅
- **Target Logic**: `prioritas === "UTAMA"` ✅
- **Realisasi Logic**: `r701 !== null && trim !== ''` ✅
- **Debug Logging**: Tersedia untuk monitoring ✅

## 🔄 **Perbedaan Kunci dalam Implementasi**

| Komponen | Padi Hook | Palawija Hook |
|----------|-----------|---------------|
| **Database Table** | `ubinan_dashboard` | `ubinan_raw` |
| **Komoditas Filter** | `['1 - Padi Sawah', '3 - Padi Ladang']` | `['4 - Jagung', '5 - Kedelai', '6 - Kacang Tanah', '7 - Ubi Kayu', '8 - Ubi Jalar']` |
| **Target Identification** | `jenis_sampel === "U"` | `prioritas === "UTAMA"` |
| **Realisasi Logic** | ✅ Sama: `r701 !== null && String(r701).trim() !== ''` | ✅ Sama: `r701 !== null && String(r701).trim() !== ''` |
| **Status Tracking** | Detailed status mapping | Validation status (CLEAN/WARNING/ERROR) |
| **Debug Logging** | ✅ Baru ditambahkan | ✅ Sudah ada |

## 🎯 **Konsistensi Logika Realisasi**

Kedua hook menggunakan logika yang **konsisten** untuk menghitung realisasi:

```typescript
// SAMA di kedua hook
if (row.r701 !== null && String(row.r701).trim() !== '') {
    // Hitung sebagai realisasi
    groupedData[key].realisasi++; 
    totalRealisasi++;
}
```

**Ini berarti:**
- Realisasi = **ada hasil panen (r701) yang valid**
- Tidak peduli nilai numeriknya, yang penting **tidak null dan tidak kosong**
- Logika ini **sudah benar** secara bisnis

## 🔍 **Mengapa Palawija Sebelumnya Bermasalah?**

### ❌ **Masalah Sebelumnya (Sudah Diperbaiki):**
```typescript
// SEBELUM: Filter terlalu luas
queryPalawija = queryPalawija.not('komoditas', 'in', '("1 - Padi Sawah", "3 - Padi Ladang")');
```

**Masalah:**
- Mengambil **SEMUA** data kecuali padi
- Termasuk data dengan `komoditas` null/undefined
- Termasuk data invalid lainnya

### ✅ **Setelah Diperbaiki:**
```typescript
// SETELAH: Filter spesifik
const validPalawijaKomoditas = ['4 - Jagung', '5 - Kedelai', '6 - Kacang Tanah', '7 - Ubi Kayu', '8 - Ubi Jalar'];
queryPalawija = queryPalawija.in('komoditas', validPalawijaKomoditas);
```

**Keuntungan:**
- Hanya mengambil data palawija yang **benar-benar valid**
- Tidak ada data sampah/invalid
- Konsisten dengan approach yang digunakan di hook padi

## 🧪 **Testing Recommendations**

### 1. **Test Hook Padi:**
```javascript
// Di browser console, lihat output untuk:
// [DEBUG] Padi monitoring - Tahun 2024:
// - totalRows: berapa banyak data padi ditemukan
// - uniqueKomoditas: harus hanya ['1 - Padi Sawah', '3 - Padi Ladang']
// - sampleData: contoh data yang diproses
```

### 2. **Test Hook Palawija:**
```javascript
// Di browser console, lihat output untuk:
// [DEBUG] Palawija monitoring - Tahun 2024:
// - totalRows: berapa banyak data palawija ditemukan (kemungkinan 0 untuk 2024)
// - uniqueKomoditas: harus sesuai validPalawijaKomoditas
// - sampleData: contoh data yang diproses
```

## 📈 **Expected Results untuk 2024**

### 🌾 **Padi (jika ada data):**
- Target > 0 (dari jenis_sampel = "U")
- Realisasi >= 0 (dari r701 yang valid)
- Persentase = (realisasi/target) * 100

### 🥕 **Palawija (kemungkinan tidak ada data):**
- Target = 0 atau sangat sedikit
- Realisasi = 0 
- Persentase = 0% atau "-"

## ✅ **Kesimpulan Review**

### **Hook Padi:**
- ✅ **Sudah benar sejak awal**
- ✅ **Filter query tepat**
- ✅ **Logika realisasi konsisten**
- ✅ **Debug logging ditambahkan untuk konsistensi**

### **Hook Palawija:**
- ✅ **Sudah diperbaiki**
- ✅ **Filter query diperbaiki dari NOT IN ke IN**
- ✅ **Mapping komoditas disesuaikan dengan data aktual**
- ✅ **Debug logging tersedia**

**Kedua hook sekarang menggunakan approach yang konsisten dan benar!**
