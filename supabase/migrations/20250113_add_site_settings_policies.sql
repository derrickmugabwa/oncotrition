-- Enable RLS for site_settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous users to view site settings" ON site_settings;
DROP POLICY IF EXISTS "Allow authenticated users to update site settings" ON site_settings;
DROP POLICY IF EXISTS "Allow authenticated users to insert site settings" ON site_settings;
DROP POLICY IF EXISTS "Allow authenticated users to delete site settings" ON site_settings;

-- Policy for anyone to view site settings
CREATE POLICY "Allow anyone to view site settings"
ON site_settings
FOR SELECT
TO public
USING (true);

-- Policy for authenticated users to update site settings
CREATE POLICY "Allow authenticated users to update site settings"
ON site_settings
FOR UPDATE
TO authenticated
USING (id = 1)
WITH CHECK (id = 1);

-- Policy for authenticated users to insert site settings if none exist
CREATE POLICY "Allow authenticated users to insert site settings if none exist"
ON site_settings
FOR INSERT
TO authenticated
WITH CHECK (
    id = 1 AND
    NOT EXISTS (
        SELECT 1
        FROM site_settings
    )
);

-- Policy for authenticated users to delete site settings
CREATE POLICY "Allow authenticated users to delete site settings"
ON site_settings
FOR DELETE
TO authenticated
USING (id = 1);
