-- Create site_settings table for global site configuration
CREATE TABLE IF NOT EXISTS public.site_settings (
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
CREATE POLICY "Allow public read access to site_settings" 
ON public.site_settings FOR SELECT 
TO authenticated, anon
USING (true);

-- Only allow admins to modify site settings
CREATE POLICY "Allow admin write access to site_settings" 
ON public.site_settings FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email LIKE '%@oncotrition.com'
  )
);

-- Insert initial maintenance mode setting (disabled by default)
INSERT INTO public.site_settings (key, value, description)
VALUES ('maintenance_mode', 'false', 'When set to true, the site will display a maintenance page instead of normal content');

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
