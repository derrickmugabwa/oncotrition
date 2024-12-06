-- Enable RLS
ALTER TABLE homepage_mentorship ENABLE ROW LEVEL SECURITY;

-- Create policies for homepage_mentorship
CREATE POLICY "Enable read access for all users" ON homepage_mentorship
    FOR SELECT USING (true);

CREATE POLICY "Enable insert/update for authenticated users only" ON homepage_mentorship
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create storage bucket for site assets if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('site_assets', 'site_assets', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy to allow authenticated uploads
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'site_assets' AND
    (storage.foldername(name))[1] = 'mentorship'
);

-- Allow public access to site assets
CREATE POLICY "Allow public read access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'site_assets');
