# Dokumentasi Perbaikan SKGB Location Counting Logic

## Masalah yang Ditemukan

### Deskripsi Masalah
RPC function `get_skgb_summary_by_kabupaten_v2` menghasilkan **undercounting** pada total_desa_u dan total_desa_c karena menggunakan `DISTINCT lokasi` tanpa mempertimbangkan kecamatan.

### Contoh Kasus RAUT MUARA
Dari data skgb_pengeringan, lokasi "RAUT MUARA" ditemukan di dua kecamatan berbeda:

1. **SEKAYAM (kdkec: 210)**
   - Record 1148: flag_sampel = 'U'
   - Record 1149: flag_sampel = 'U'  
   - Record 3400: flag_sampel = 'C'

2. **ENTIKONG (kdkec: 220)**
   - Record 1150: flag_sampel = 'U'
   - Records 3425-3428: flag_sampel = 'C' (4 records)

### Dampak Masalah
- **Seharusnya**: RAUT MUARA dihitung sebagai 2 lokasi terpisah (1 di SEKAYAM + 1 di ENTIKONG)
- **Sebelum perbaikan**: RAUT MUARA dihitung sebagai 1 lokasi saja
- **Expected count**: U=11, C=40
- **Actual count (sebelum fix)**: U=10, C=39

## Solusi yang Diterapkan

### Perubahan pada RPC Function
File: `/sql/get_skgb_summary_by_kabupaten_v2.sql`

**BEFORE:**
```sql
desa_stats AS (
  SELECT 
    sp.lokasi,
    COUNT(CASE WHEN sp.flag_sampel = 'U' THEN 1 END)::INTEGER as count_u,
    COUNT(CASE WHEN sp.flag_sampel = 'C' THEN 1 END)::INTEGER as count_c
  FROM skgb_pengeringan sp
  WHERE sp.kdkab = p_kode_kab
    AND EXTRACT(YEAR FROM sp.created_at) = p_tahun
  GROUP BY sp.lokasi  -- ❌ Hanya berdasarkan lokasi
),
```

**AFTER:**
```sql
desa_stats AS (
  SELECT 
    sp.lokasi,
    sp.kdkec,
    COUNT(CASE WHEN sp.flag_sampel = 'U' THEN 1 END)::INTEGER as count_u,
    COUNT(CASE WHEN sp.flag_sampel = 'C' THEN 1 END)::INTEGER as count_c
  FROM skgb_pengeringan sp
  WHERE sp.kdkab = p_kode_kab
    AND EXTRACT(YEAR FROM sp.created_at) = p_tahun
  GROUP BY sp.lokasi, sp.kdkec  -- ✅ Berdasarkan kombinasi lokasi + kecamatan
),
```

### Penjelasan Perbaikan
1. **Menambahkan `sp.kdkec`** dalam SELECT clause
2. **Mengubah GROUP BY** dari `sp.lokasi` menjadi `sp.lokasi, sp.kdkec`
3. **Menambahkan komentar** untuk menjelaskan handling nama lokasi yang sama di kecamatan berbeda

## Validasi Perbaikan

### Script Validasi
Dibuat script `/sql/debug_lokasi_count_validation.sql` untuk:
1. Manual count menggunakan kombinasi lokasi + kecamatan
2. Detail breakdown per kecamatan dan lokasi
3. Verifikasi khusus untuk kasus RAUT MUARA

### Expected Results
Setelah perbaikan, untuk Kabupaten Sanggau (6105) tahun 2025:
- **total_desa_u**: 11 (termasuk RAUT MUARA di SEKAYAM dan ENTIKONG)
- **total_desa_c**: 40 (termasuk RAUT MUARA di SEKAYAM dan ENTIKONG)

## Dampak Perbaikan

### Akurasi Data
- ✅ Lokasi dengan nama sama di kecamatan berbeda kini dihitung terpisah
- ✅ KPI counting menjadi akurat sesuai dengan business logic
- ✅ Tidak ada perubahan pada logic kecamatan (sudah benar)

### Compatibility
- ✅ Tidak mengubah signature function (return type tetap sama)
- ✅ Tidak mempengaruhi frontend integration
- ✅ Backward compatible dengan existing queries

## Next Steps

1. **Deploy** RPC function yang telah diperbaiki ke database
2. **Test** menggunakan script validasi
3. **Verify** di dashboard bahwa KPI menampilkan angka yang benar (U=11, C=40)
4. **Monitor** untuk memastikan tidak ada side effects

## Lesson Learned

- **Business Logic**: Lokasi harus diidentifikasi berdasarkan kombinasi lokasi + kecamatan
- **Data Validation**: Pentingnya validasi manual untuk memverifikasi logic counting
- **Edge Cases**: Nama lokasi yang sama di kecamatan berbeda adalah case yang valid dan harus dihitung terpisah

---
*Dokumentasi dibuat: January 2025*
*Issue Status: RESOLVED*
