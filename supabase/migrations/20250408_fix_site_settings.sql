-- Drop the existing table if it was partially created
DROP TABLE IF EXISTS public.site_settings;

-- Create site_settings table with a simpler structure
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read site settings
CREATE POLICY "site_settings_read_policy" 
ON public.site_settings FOR SELECT 
TO authenticated, anon
USING (true);

-- Only allow authenticated users to modify site settings
-- This simplifies the policy to avoid permission issues with auth.users table
CREATE POLICY "site_settings_write_policy" 
ON public.site_settings FOR ALL 
TO authenticated
USING (true);

-- Insert initial maintenance mode settings
INSERT INTO public.site_settings (key, value, description)
VALUES 
  ('maintenance_mode', 'false', 'When set to true, the site will display a maintenance page instead of normal content'),
  ('maintenance_title', 'We''ll Be Right Back', 'Title displayed on the maintenance page'),
  ('maintenance_message', 'Our site is currently undergoing scheduled maintenance. We apologize for any inconvenience and appreciate your patience.', 'Message displayed on the maintenance page'),
  ('maintenance_contact', 'Please check back soon. For urgent inquiries, please contact us at support@oncotrition.com', 'Contact information displayed on the maintenance page');

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_site_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER site_settings_update_timestamp
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION update_site_settings_timestamp();
