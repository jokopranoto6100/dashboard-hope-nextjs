# 🛠️ Fix: Palawija Monitoring Data Issue

## 📋 **Masalah yang Ditemukan**

Hook `usePalawijaMonitoringData` menampilkan data realisasi untuk tahun 2024 padahal tidak ada data palawija yang valid untuk tahun tersebut.

## � **Mapping Komoditas Berdasarkan Data Aktual**

Berdasarkan query database, berikut adalah mapping komoditas yang ditemukan:

### 🌾 **Padi (untuk PadiMonitoringTable)**
- `1 - Padi Sawah`
- `3 - Padi Ladang`

### 🥕 **Palawija (untuk PalawijaMonitoringTable)**
- `4 - Jagung`
- `5 - Kedelai` 
- `6 - Kacang Tanah`
- `7 - Ubi Kayu`
- `8 - Ubi Jalar`

### ❌ **Komoditas yang Sebelumnya Salah Diasumsikan**
- `2 - Jagung` ❌ (seharusnya `4 - Jagung`)
- `5 - Ubi Kayu/Ketela Pohon` ❌ (seharusnya `7 - Ubi Kayu`)
- `6 - Ubi Jalar` ❌ (seharusnya `8 - Ubi Jalar`)
- `8 - Kacang Hijau` ❌ (tidak ada di database, seharusnya `6 - Kacang Tanah`)

## �🔍 **Root Cause Analysis**

### 1. **Filter Query yang Terlalu Luas**
```typescript
// ❌ SEBELUM: Filter yang problematik
queryPalawija = queryPalawija.not('komoditas', 'in', '("1 - Padi Sawah", "3 - Padi Ladang")');
```

**Masalah:**
- Filter `NOT IN` mengambil **semua data kecuali padi**
- Termasuk data dengan `komoditas` null/undefined/kosong
- Termasuk data komoditas lain yang bukan palawija
- Tidak ada validasi untuk memastikan data adalah palawija yang valid

### 2. **Logika Counting yang Tidak Tepat**
```typescript
// ❌ SEBELUM: Menghitung semua data yang memiliki r701
if (row.r701 !== null && String(row.r701).trim() !== '') {
    groupedData[groupAndSortKey].realisasi++; totalRealisasi++;
}
```

**Masalah:**
- Menghitung semua data yang memiliki hasil panen tanpa validasi komoditas
- Tidak memfilter data yang seharusnya bukan palawija

## ✅ **Solusi yang Diterapkan**

### 1. **Filter Query yang Spesifik**
```typescript
// ✅ SETELAH: Filter yang spesifik untuk palawija berdasarkan data aktual
const validPalawijaKomoditas = [
  '4 - Jagung',
  '5 - Kedelai', 
  '6 - Kacang Tanah',
  '7 - Ubi Kayu',
  '8 - Ubi Jalar'
];

queryPalawija = queryPalawija.in('komoditas', validPalawijaKomoditas);
```

**Keuntungan:**
- Hanya mengambil data komoditas palawija yang benar-benar ada di database
- Menghindari data null/undefined/kosong
- Filter level database lebih efisien
- Sesuai dengan struktur data aktual: `1,3` = Padi; `4,5,6,7,8` = Palawija

### 2. **Logging untuk Debugging**
```typescript
// ✅ TAMBAHAN: Debug logging
console.log(`[DEBUG] Palawija monitoring - Tahun ${selectedYear}:`, {
  totalRows: allRawPalawijaData.length,
  sampleKomoditas: allRawPalawijaData.slice(0, 5).map(row => ({
    komoditas: row.komoditas,
    prioritas: row.prioritas,
    r701: row.r701,
    validasi: row.validasi
  })),
  uniqueKomoditas: [...new Set(allRawPalawijaData.map(row => row.komoditas))]
});
```

**Keuntungan:**
- Membantu monitoring data yang diambil
- Mudah debugging jika ada masalah serupa di masa depan
- Dapat melihat komoditas apa saja yang ada di database

### 3. **Logika Counting yang Lebih Robust**
```typescript
// ✅ SETELAH: Validasi sudah dilakukan di query level
if (allRawPalawijaData) {
  allRawPalawijaData.forEach(row => {
    // Data sudah difilter di query level, jadi validasi minimal saja
    // ... processing logic
  });
}
```

**Keuntungan:**
- Filter dilakukan di database level (lebih efisien)
- Logika aplikasi lebih sederhana dan reliable
- Mengurangi kemungkinan bug di future

## 🧪 **Testing**

Untuk memverifikasi fix ini:

1. **Buka halaman monitoring ubinan** (`/monitoring/ubinan`)
2. **Pilih tahun 2024**
3. **Periksa console browser** untuk melihat debug log
4. **Verifikasi bahwa tabel palawija** menunjukkan:
   - Target = 0 atau nilai yang benar
   - Realisasi = 0 jika memang tidak ada data palawija
   - Persentase = 0% atau `-` 

## 🔄 **Dampak Perubahan**

### ✅ **Positif:**
- Data palawija monitoring sekarang akurat
- Performa query lebih baik (filter di database level)
- Debugging lebih mudah dengan logging
- Kode lebih maintainable

### ⚠️ **Yang Perlu Diperhatikan:**
- Debug logging sebaiknya dihapus di production
- Pastikan list `validPalawijaKomoditas` sesuai dengan data di database
- Monitor performa jika ada perubahan pada volume data

## 📝 **Follow-up Actions**

1. **Remove debug logging** setelah konfirmasi fix bekerja
2. **Verify komoditas list** dengan tim data untuk memastikan kelengkapan
3. **Apply similar fix** pada hook lain jika ditemukan masalah serupa
4. **Add unit tests** untuk filter logic ini

## 🔗 **Related Files**
- `/src/hooks/usePalawijaMonitoringData.ts` - File utama yang diperbaiki
- `/src/app/(dashboard)/monitoring/ubinan/page.tsx` - Halaman yang menggunakan hook
- `/src/app/(dashboard)/monitoring/ubinan/PalawijaTable.tsx` - Komponen tabel palawija
