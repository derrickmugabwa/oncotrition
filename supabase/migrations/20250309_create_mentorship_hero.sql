-- Create mentorship_hero table
CREATE TABLE IF NOT EXISTS mentorship_hero (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  tagline TEXT NOT NULL,
  background_image TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create an update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_mentorship_hero_updated_at
    BEFORE UPDATE ON mentorship_hero
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add RLS (Row Level Security) policies
ALTER TABLE mentorship_hero ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone
CREATE POLICY "Allow read access to everyone"
ON mentorship_hero
FOR SELECT
TO public
USING (true);

-- Allow insert/update/delete only for authenticated users
CREATE POLICY "Allow full access to authenticated users"
ON mentorship_hero
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
