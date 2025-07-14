-- Migration script: Update simtp_uploads table untuk Supabase Storage
-- Run this in Supabase SQL Editor

-- Step 1: Add new columns for Supabase Storage
ALTER TABLE public.simtp_uploads 
ADD COLUMN IF NOT EXISTS file_path TEXT,
ADD COLUMN IF NOT EXISTS file_url TEXT,
ADD COLUMN IF NOT EXISTS file_size BIGINT;

-- Step 2: Update existing records (if any) - set default values
UPDATE public.simtp_uploads 
SET 
  file_path = COALESCE(file_path, 'migrated/' || file_name),
  file_url = COALESCE(file_url, 'https://legacy-gdrive-url'),
  file_size = COALESCE(file_size, 0)
WHERE file_path IS NULL OR file_url IS NULL OR file_size IS NULL;

-- Step 3: Create storage bucket (if not exists)
-- This needs to be done via Supabase Dashboard -> Storage -> New Bucket
-- Bucket name: simtp-uploads
-- Public: true (for file access)

-- Step 4: Create storage policies
INSERT INTO storage.buckets (id, name, public) 
VALUES ('simtp-uploads', 'simtp-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files to their folder
CREATE POLICY IF NOT EXISTS "Allow authenticated uploads to own folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'simtp-uploads' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.jwt()->>'satker_id'
  );

-- Allow users to view files in their folder
CREATE POLICY IF NOT EXISTS "Allow users to view own uploads" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'simtp-uploads' 
    AND (
      (storage.foldername(name))[1] = auth.jwt()->>'satker_id'
      OR auth.jwt()->>'role' = 'super_admin'
    )
  );

-- Allow users to update files in their folder
CREATE POLICY IF NOT EXISTS "Allow users to update own uploads" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'simtp-uploads' 
    AND (
      (storage.foldername(name))[1] = auth.jwt()->>'satker_id'
      OR auth.jwt()->>'role' = 'super_admin'
    )
  );

-- Allow users to delete files in their folder
CREATE POLICY IF NOT EXISTS "Allow users to delete own uploads" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'simtp-uploads' 
    AND (
      (storage.foldername(name))[1] = auth.jwt()->>'satker_id'
      OR auth.jwt()->>'role' = 'super_admin'
    )
  );

-- Step 5: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_simtp_uploads_file_path ON public.simtp_uploads(file_path);
CREATE INDEX IF NOT EXISTS idx_simtp_uploads_kabupaten_year ON public.simtp_uploads(kabupaten_kode, year);

-- Step 6: Add comments for documentation
COMMENT ON COLUMN public.simtp_uploads.file_path IS 'Supabase Storage file path';
COMMENT ON COLUMN public.simtp_uploads.file_url IS 'Supabase Storage public URL';
COMMENT ON COLUMN public.simtp_uploads.file_size IS 'File size in bytes';

-- Step 7: Optional - After migration is complete and tested, you can remove gdrive_file_id
-- ALTER TABLE public.simtp_uploads DROP COLUMN IF EXISTS gdrive_file_id;

-- Note: Make sure to create the bucket manually in Supabase Dashboard first!
