-- Add favicon_url column to site_settings table
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS favicon_url TEXT DEFAULT 'favicon.ico';

-- Add is_active column if it doesn't exist
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false;

-- Create a unique constraint on is_active when it's true
DROP INDEX IF EXISTS idx_site_settings_single_active;
CREATE UNIQUE INDEX idx_site_settings_single_active
ON site_settings ((1))
WHERE is_active = true;

-- Ensure only one row is active (the latest one)
WITH latest_settings AS (
  SELECT id
  FROM site_settings
  ORDER BY created_at DESC
  LIMIT 1
)
UPDATE site_settings
SET is_active = (id IN (SELECT id FROM latest_settings));

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable update for authenticated users only - favicon" ON "public"."site_settings";
DROP POLICY IF EXISTS "Allow authenticated users to upload favicons" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete favicons" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view favicons" ON storage.objects;

-- Create policy to allow authenticated users to update favicon_url
CREATE POLICY "Enable update for authenticated users only - favicon" ON "public"."site_settings"
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Create storage bucket for favicons if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('favicons', 'favicons', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow authenticated users to upload favicons
CREATE POLICY "Allow authenticated users to upload favicons"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'favicons' 
    AND auth.role() = 'authenticated'
);

-- Policy to allow authenticated users to delete favicons
CREATE POLICY "Allow authenticated users to delete favicons"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'favicons' 
    AND auth.role() = 'authenticated'
);

-- Policy to allow public to view favicons
CREATE POLICY "Allow public to view favicons"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'favicons');
