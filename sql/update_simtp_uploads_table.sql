-- SQL Script untuk update tabel simtp_uploads
-- Menambahkan kolom storage_path dan mengubah struktur tabel

-- 1. Tambahkan kolom storage_path jika belum ada
ALTER TABLE simtp_uploads 
ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- 2. Hapus constraint NOT NULL dari kolom gdrive_file_id (jika ada)
ALTER TABLE simtp_uploads 
ALTER COLUMN gdrive_file_id DROP NOT NULL;

-- 3. Update data yang ada (jika ada) - set storage_path berdasarkan data yang tersedia
UPDATE simtp_uploads 
SET storage_path = CONCAT(kabupaten_kode, '/', year, '/', file_name)
WHERE storage_path IS NULL AND file_name IS NOT NULL;

-- 4. Tambahkan index untuk performa query
CREATE INDEX IF NOT EXISTS idx_simtp_uploads_storage_path ON simtp_uploads(storage_path);
CREATE INDEX IF NOT EXISTS idx_simtp_uploads_kabupaten_year ON simtp_uploads(kabupaten_kode, year);

-- 5. Verifikasi perubahan
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'simtp_uploads' 
AND column_name IN ('gdrive_file_id', 'storage_path');
