-- Fix RLS policies for simtp-uploads bucket
-- Run this in Supabase SQL Editor

-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated uploads to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to view own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own uploads" ON storage.objects;

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('simtp-uploads', 'simtp-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- NEW CORRECTED RLS POLICIES
-- ============================================================================

-- Allow authenticated users to upload files to folders based on their satker_id
CREATE POLICY "Allow authenticated uploads to own satker folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'simtp-uploads' 
    AND auth.role() = 'authenticated'
    AND (
      -- Check if the first folder matches user's satker_id from users table
      (storage.foldername(name))[1] IN (
        SELECT satker_id::text 
        FROM public.users 
        WHERE id = auth.uid() 
        AND satker_id IS NOT NULL
      )
      OR 
      -- Super admin can upload to any folder
      EXISTS (
        SELECT 1 
        FROM public.users 
        WHERE id = auth.uid() 
        AND role = 'super_admin'
      )
    )
  );

-- Allow users to view files in their folder or super_admin to view all
CREATE POLICY "Allow users to view own satker uploads" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'simtp-uploads' 
    AND (
      -- User can view files in their satker folder
      (storage.foldername(name))[1] IN (
        SELECT satker_id::text 
        FROM public.users 
        WHERE id = auth.uid() 
        AND satker_id IS NOT NULL
      )
      OR 
      -- Super admin can view all files
      EXISTS (
        SELECT 1 
        FROM public.users 
        WHERE id = auth.uid() 
        AND role = 'super_admin'
      )
    )
  );

-- Allow users to update files in their folder or super_admin to update all
CREATE POLICY "Allow users to update own satker uploads" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'simtp-uploads' 
    AND (
      -- User can update files in their satker folder
      (storage.foldername(name))[1] IN (
        SELECT satker_id::text 
        FROM public.users 
        WHERE id = auth.uid() 
        AND satker_id IS NOT NULL
      )
      OR 
      -- Super admin can update all files
      EXISTS (
        SELECT 1 
        FROM public.users 
        WHERE id = auth.uid() 
        AND role = 'super_admin'
      )
    )
  );

-- Allow users to delete files in their folder or super_admin to delete all
CREATE POLICY "Allow users to delete own satker uploads" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'simtp-uploads' 
    AND (
      -- User can delete files in their satker folder
      (storage.foldername(name))[1] IN (
        SELECT satker_id::text 
        FROM public.users 
        WHERE id = auth.uid() 
        AND satker_id IS NOT NULL
      )
      OR 
      -- Super admin can delete all files
      EXISTS (
        SELECT 1 
        FROM public.users 
        WHERE id = auth.uid() 
        AND role = 'super_admin'
      )
    )
  );

-- ============================================================================
-- ENABLE RLS ON STORAGE.OBJECTS (if not already enabled)
-- ============================================================================
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'simtp-uploads';

-- Check active policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects' 
  AND policyname LIKE '%satker%';

-- Check sample user data structure (for verification)
SELECT id, role, satker_id 
FROM public.users 
LIMIT 3;
