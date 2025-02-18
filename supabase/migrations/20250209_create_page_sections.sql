-- Create the page_sections table
CREATE TABLE IF NOT EXISTS public.page_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_id TEXT NOT NULL UNIQUE,
    heading TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON public.page_sections
    FOR SELECT
    TO public
    USING (true);

-- Allow authenticated users to update
CREATE POLICY "Allow authenticated users to update" ON public.page_sections
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert" ON public.page_sections
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Insert initial data for the Why Choose Us section
INSERT INTO public.page_sections (section_id, heading, description)
VALUES (
    'why_choose_us',
    'Why Choose Us',
    'Experience excellence in nutrition management with our comprehensive platform'
) ON CONFLICT (section_id) DO UPDATE
SET heading = EXCLUDED.heading,
    description = EXCLUDED.description;
