# Migrasi SIMTP Upload dari Google Drive ke Supabase Storage

## Ringkasan Perubahan

Migrasi ini mengubah sistem upload SIMTP dari Google Drive ke Supabase Storage untuk mengatasi error "Service Accounts do not have storage quota".

## Perubahan yang Dilakukan

### 1. File yang Dimodifikasi

#### `src/app/(dashboard)/simtp-upload/_actions.ts`
- **Dihapus**: Import `google` dan `Readable`
- **Dihapus**: Fungsi `getDriveClient()`
- **Diubah**: Logika upload dari Google Drive API ke Supabase Storage
- **Ditambah**: Fungsi `downloadSimtpFileAction()` untuk download file
- **Diubah**: Field `gdrive_file_id` menjadi `storage_path` di database

### 2. Database Changes

#### Tabel `simtp_uploads`
- **Ditambah**: Kolom `storage_path` (TEXT) - menyimpan path file di Supabase Storage
- **Opsional**: Kolom `gdrive_file_id` bisa dihapus setelah migrasi selesai

### 3. Supabase Storage

#### Bucket `simtp-uploads`
- **Structure**: `{kabupaten_kode}/{year}/{filename}`
- **Example**: `3201/2024/STP_2024_3201.mdb`
- **Policies**: 
  - SELECT: Authenticated users
  - INSERT: Authenticated users  
  - UPDATE: Authenticated users
  - DELETE: Super admin only

**Step 2b: Fix RLS Policies (IMPORTANT)**
```sql
-- Copy and paste content from sql/fix_simtp_storage_rls.sql
```

> ⚠️ **Important**: The original RLS policies had issues accessing JWT data. The fixed script correctly queries the users table for satker_id and role validation.

### 3. Remove Environment Variables (Optional)

These Google Drive environment variables are no longer needed:
```bash
# Can be removed after migration
GOOGLE_SERVICE_ACCOUNT_BASE64=...
GOOGLE_DRIVE_FOLDER_ID=...
```

### 4. Test Upload

1. Test file upload functionality
2. Verify files appear in Supabase Storage
3. Check database records have file_path, file_url, and file_size

## Langkah-langkah Deployment

### 1. Database Migration
```sql
-- Jalankan script SQL berikut di Supabase SQL Editor:
-- 1. sql/create_simtp_storage_bucket.sql
-- 2. sql/update_simtp_uploads_table.sql
```

### 2. Environment Variables
```bash
# Hapus environment variables Google Drive (opsional):
# GOOGLE_SERVICE_ACCOUNT_BASE64
# GOOGLE_DRIVE_FOLDER_ID

# Pastikan Supabase environment variables sudah ada:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# SUPABASE_SERVICE_ROLE_KEY (jika diperlukan)
```

### 3. Deploy Code Changes
- Deploy file `_actions.ts` yang sudah dimodifikasi
- Test upload functionality
- Test download functionality

## Keuntungan Migrasi

1. **Mengatasi Quota Limit**: Tidak ada lagi error storage quota dari Google Drive
2. **Integrasi Terpadu**: Semua data dalam ekosistem Supabase
3. **Performance**: Upload/download lebih cepat karena tidak perlu eksternal API
4. **Security**: Kontrol akses yang lebih baik dengan RLS policies
5. **Cost**: Mengurangi dependency ke Google Cloud Platform

## File Structure di Storage

```
simtp-uploads/
├── 3201/
│   ├── 2023/
│   │   ├── STP_2023_3201.mdb
│   │   ├── LahanTP_2022_3201.mdb
│   │   └── ...
│   └── 2024/
│       ├── STP_2024_3201.mdb
│       └── ...
└── 3202/
    └── ...
```

## Database Schema Changes

- **Added**: `file_path` - Supabase Storage path
- **Added**: `file_url` - Public URL for file access
- **Added**: `file_size` - File size in bytes

## Troubleshooting

### Error: "Upload failed: new row violates row-level security policy"

This error occurs when RLS policies are not correctly configured. Run the fix script:

```sql
-- Execute sql/fix_simtp_storage_rls.sql
```

**Root Cause**: The original RLS policies tried to access `auth.jwt()->>'satker_id'` which doesn't exist in the JWT. The corrected policies query the `users` table to get user's `satker_id` and `role`.

### Verification

After running the fix script, you can verify:

1. **Bucket exists**: Check in Supabase Dashboard → Storage
2. **Policies active**: Query `pg_policies` table to see RLS policies
3. **Test upload**: Try uploading a file through the application

## Technical Notes

- **Folder structure**: Files are organized as `{satker_id}/{year}/{filename}`
- **Access control**: Users can only access files in their `satker_id` folder
- **Super admin**: Can access all files regardless of folder
- **File naming**: Preserved original naming convention for compatibility
- **Kept**: `gdrive_file_id` for backward compatibility (can be removed later)

## Storage Policies

- Users can only access files in their own kabupaten folder
- Super admin can access all files
- Authenticated users required for all operations
- Automatic cleanup if database insert fails

## Catatan Penting

- File yang sudah ada di Google Drive tidak akan otomatis dipindah ke Supabase Storage
- Data lama tetap ada di tabel `simtp_uploads` dengan `gdrive_file_id`
- Data baru akan menggunakan `storage_path`
- Perlu handling backward compatibility jika masih ada file di Google Drive
