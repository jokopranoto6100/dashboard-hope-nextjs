-- SQL Script untuk membuat bucket simtp-uploads dan mengatur policies

-- 1. Membuat bucket simtp-uploads (hanya jika belum ada)
INSERT INTO storage.buckets (id, name, public)
VALUES ('simtp-uploads', 'simtp-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Hapus policy lama jika ada (untuk menghindari konflik)
DROP POLICY IF EXISTS "Users can view SIMTP files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload SIMTP files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update SIMTP files" ON storage.objects;
DROP POLICY IF EXISTS "Only super_admin can delete SIMTP files" ON storage.objects;

-- 3. Policy untuk SELECT (download) - hanya user yang terautentikasi
CREATE POLICY "Users can view SIMTP files" ON storage.objects FOR SELECT
USING (
  auth.role() = 'authenticated' AND 
  bucket_id = 'simtp-uploads'
);

-- 4. Policy untuk INSERT (upload) - hanya user yang terautentikasi
CREATE POLICY "Users can upload SIMTP files" ON storage.objects FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated' AND 
  bucket_id = 'simtp-uploads'
);

-- 5. Policy untuk UPDATE (update file) - hanya user yang terautentikasi
CREATE POLICY "Users can update SIMTP files" ON storage.objects FOR UPDATE
USING (
  auth.role() = 'authenticated' AND 
  bucket_id = 'simtp-uploads'
);

-- 6. Policy untuk DELETE - hanya super_admin
CREATE POLICY "Only super_admin can delete SIMTP files" ON storage.objects FOR DELETE
USING (
  auth.role() = 'authenticated' AND 
  bucket_id = 'simtp-uploads' AND
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
);

-- 7. Verifikasi bucket sudah dibuat
SELECT id, name, public FROM storage.buckets WHERE id = 'simtp-uploads';
