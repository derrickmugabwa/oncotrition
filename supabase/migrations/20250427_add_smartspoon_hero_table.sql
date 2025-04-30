-- Create smartspoon_hero table
CREATE TABLE IF NOT EXISTS public.smartspoon_hero (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    tagline TEXT NOT NULL,
    background_image TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE public.smartspoon_hero ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON public.smartspoon_hero
    FOR SELECT
    USING (true);

-- Allow authenticated users to insert/update
CREATE POLICY "Allow authenticated users to insert/update" ON public.smartspoon_hero
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_smartspoon_hero_updated_at
    BEFORE UPDATE ON public.smartspoon_hero
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
