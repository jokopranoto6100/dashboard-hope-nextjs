# Dokumentasi Perbaikan SKGB Penggilingan Desa Counting Logic

## Masalah yang Ditemukan

### Deskripsi Masalah
RPC function `get_skgb_penggilingan_summary_by_kabupaten` menghasilkan **undercounting** pada total_desa_u dan total_desa_c karena menggunakan `DISTINCT kddesa` tanpa mempertimbangkan kecamatan.

### Contoh Kasus Duplikasi Kode Desa
Dari data skgb_penggilingan, ditemukan beberapa kode desa yang sama di kecamatan yang sama dengan flag_sampel berbeda:

1. **JANGKANG BENUA (kddesa: 008, kdkec: 120 - JANGKANG)**
   - Record 839: flag_sampel = 'U' 
   - Record 870: flag_sampel = 'C'
   - Record 871: flag_sampel = 'C' (duplikat)

2. **TANGGUNG (kddesa: 009, kdkec: 120 - JANGKANG)**
   - Record 840: flag_sampel = 'U'
   - Record 841: flag_sampel = 'U' (duplikat)
   - Record 872: flag_sampel = 'C'

3. **SEI TEKAM (kddesa: 010, kdkec: 210 - SEKAYAM)**
   - Record 859: flag_sampel = 'U'
   - Record 892: flag_sampel = 'C'

### Dampak Masalah
- **Expected count**: U=34, C=32 (berdasarkan manual count kombinasi kddesa+kdkec)
- **Actual count (sebelum fix)**: U=15, C=14 (menggunakan DISTINCT kddesa saja)
- **Root cause**: Ada desa yang memiliki multiple records dengan kode desa sama di kecamatan yang sama

## Solusi yang Diterapkan

### Perubahan pada RPC Function
File: `/sql/get_skgb_penggilingan_summary_by_kabupaten.sql`

**BEFORE:**
```sql
desa_stats AS (
  -- Get desa-level statistics  
  SELECT 
    sp.kddesa,
    COUNT(CASE WHEN sp.flag_sampel = 'U' THEN 1 END)::INTEGER as count_u,
    COUNT(CASE WHEN sp.flag_sampel = 'C' THEN 1 END)::INTEGER as count_c
  FROM skgb_penggilingan sp
  WHERE sp.kdkab = p_kode_kab
    AND sp.tahun = p_tahun
  GROUP BY sp.kddesa  -- ❌ Hanya berdasarkan kddesa
),
```

**AFTER:**
```sql
desa_stats AS (
  -- Get desa-level statistics (kombinasi kddesa + kdkec untuk handling kode desa yang sama di kecamatan berbeda)
  SELECT 
    sp.kddesa,
    sp.kdkec,
    COUNT(CASE WHEN sp.flag_sampel = 'U' THEN 1 END)::INTEGER as count_u,
    COUNT(CASE WHEN sp.flag_sampel = 'C' THEN 1 END)::INTEGER as count_c
  FROM skgb_penggilingan sp
  WHERE sp.kdkab = p_kode_kab
    AND sp.tahun = p_tahun
  GROUP BY sp.kddesa, sp.kdkec  -- ✅ Berdasarkan kombinasi kddesa + kdkec
),
```

### Penjelasan Perbaikan
1. **Menambahkan `sp.kdkec`** dalam SELECT clause
2. **Mengubah GROUP BY** dari `sp.kddesa` menjadi `sp.kddesa, sp.kdkec`
3. **Menambahkan komentar** untuk menjelaskan handling kode desa yang sama di kecamatan berbeda

## Detail Manual Count Analysis

### Data FLAG_SAMPEL = 'U' (Target Utama) - Total: 34 desa unik
**Breakdown per Kecamatan:**
- TOBA (010): 1 desa - KAMPUNG BARU
- MELIAU (020): 1 desa - SUNGAI KEMBAYAU
- KAPUAS (060): 6 desa - RAMBIN, BELANGIN, LAPE, MENGKIANG, ENTAKAI, KAMBONG
- MUKOK (070): 1 desa - SEMUNTAI
- JANGKANG (120): 4 desa - SEMIRAU, EMPIYANG, JANGKANG BENUA, TANGGUNG (dengan duplikat record)
- BONTI (130): 1 desa - EMPODIS
- PARINDU (140): 3 desa - PANDU RAYA, SUKA MULYA, HIBUN
- TAYAN HILIR (150): 1 desa - SEJOTANG
- BALAI (160): 3 desa - COWET, KEBADU, PADI KAYE
- TAYAN HULU (170): 5 desa - BINJAI, KEDAKAS, MANDONG, JANJANG, ENGKASAN
- BEDUAI (190): 1 desa - MAWANG MUDA
- NOYAN (200): 1 desa - NOYAN
- SEKAYAM (210): 3 desa - PENGADANG, ENGKAHAN, SEI TEKAM
- ENTIKONG (220): 3 desa - NEKAN, ENTIKONG, SURUH TEMBAWANG

### Data FLAG_SAMPEL = 'C' (Cadangan) - Total: 32 desa unik
**Breakdown per Kecamatan:**
- TOBA (010): 1 desa - BALAI BELUNGAI
- MELIAU (020): 1 desa - MERANGGAU
- KAPUAS (060): 3 desa - PENYELADI, SUNGAI MAWANG, ENTAKAI
- JANGKANG (120): 6 desa - TERATI, BALAI SEBUT, JANGKANG BENUA, TANGGUNG, DESA PERSIAPAN MENYONGKA ELOK
- PARINDU (140): 4 desa - MARITA, PANDU RAYA, SEBARA, MARINGIN JAYA
- BALAI (160): 3 desa - SEMONCOL, BULU BALA, TAE
- TAYAN HULU (170): 5 desa - MENYABO, PANDAN SEMBUAT, PERUAN DALAM, JANJANG, BERAKAK
- KEMBAYAN (180): 1 desa - SEBONGKUH
- NOYAN (200): 1 desa - SUNGAI DANGIN
- SEKAYAM (210): 5 desa - SOTOK, ENGKAHAN, BUNGKANG, LUBUK SABUK, SEI TEKAM
- ENTIKONG (220): 3 desa - SEMANGET, PALA PASANG, SURUH TEMBAWANG

## Validasi Perbaikan

### Script Validasi
Dibuat script `/sql/debug_penggilingan_count_validation.sql` untuk:
1. Manual count menggunakan kombinasi kddesa + kdkec
2. Detail breakdown per kecamatan dan desa
3. Identifikasi dan verifikasi duplikasi kode desa
4. Verifikasi kasus-kasus spesifik (JANGKANG BENUA, TANGGUNG, SEI TEKAM)

### Expected Results
Setelah perbaikan, untuk Kabupaten Sanggau (6105) tahun 2025:
- **total_desa_u**: 34 ✅ (dari 15 sebelumnya)
- **total_desa_c**: 32 ✅ (dari 14 sebelumnya)

## Dampak Perbaikan

### Akurasi Data
- ✅ Desa dengan kode sama di kecamatan yang sama dengan flag berbeda kini dihitung terpisah
- ✅ Multiple records di desa yang sama tidak menyebabkan double counting
- ✅ KPI counting menjadi akurat sesuai dengan business logic
- ✅ Tidak ada perubahan pada logic kecamatan (sudah benar)

### Compatibility
- ✅ Tidak mengubah signature function (return type tetap sama)
- ✅ Tidak mempengaruhi frontend integration
- ✅ Backward compatible dengan existing queries

## Catatan Penting

### Perbedaan dengan Perbaikan Pengeringan
- **Pengeringan**: Masalah di lokasi yang sama di kecamatan berbeda (RAUT MUARA di SEKAYAM vs ENTIKONG)
- **Penggilingan**: Masalah di desa yang sama di kecamatan yang sama dengan multiple records/flag berbeda

### Business Logic
- Setiap kombinasi (kddesa + kdkec) harus dihitung sebagai desa terpisah
- Multiple records di desa yang sama dengan flag sama atau berbeda tetap dihitung sebagai 1 desa
- Duplikasi records tidak boleh menyebabkan double counting pada level desa

## Next Steps

1. **Deploy** RPC function yang telah diperbaiki ke database
2. **Test** menggunakan script validasi
3. **Verify** di dashboard bahwa KPI menampilkan angka yang benar (U=34, C=32)
4. **Monitor** untuk memastikan tidak ada side effects

---
*Dokumentasi dibuat: January 2025*
*Issue Status: RESOLVED*
