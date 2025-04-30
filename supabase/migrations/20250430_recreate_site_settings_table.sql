-- Migration to recreate the site_settings table
-- This will help fix any issues with the site settings table

-- First, check if the table exists and drop it if it does
DROP TABLE IF EXISTS site_settings;

-- Create the site_settings table
CREATE TABLE site_settings (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  logo_url TEXT,
  favicon_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add a comment to the table
COMMENT ON TABLE site_settings IS 'Stores site configuration settings like logo and favicon URLs';

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_site_settings_modtime
BEFORE UPDATE ON site_settings
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Insert default record
INSERT INTO site_settings (logo_url, favicon_url, is_active)
VALUES ('logo.png', 'favicon.png', TRUE);

-- Create an index on the is_active column for faster queries
CREATE INDEX idx_site_settings_is_active ON site_settings(is_active);

-- Create RLS policies
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Policy for public read access
CREATE POLICY "Allow public read access" ON site_settings
  FOR SELECT USING (true);

-- Policy for authenticated users to update
CREATE POLICY "Allow authenticated users to update" ON site_settings
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy for authenticated users to insert
CREATE POLICY "Allow authenticated users to insert" ON site_settings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
