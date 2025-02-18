-- Create about_components table
CREATE TABLE public.about_components (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    component_key TEXT NOT NULL UNIQUE,
    is_visible BOOLEAN DEFAULT true,
    display_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.about_components ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users"
ON public.about_components
FOR SELECT
USING (true);

CREATE POLICY "Enable write access for authenticated users"
ON public.about_components
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.about_components TO authenticated;
GRANT SELECT ON public.about_components TO anon;

-- Insert initial data
INSERT INTO public.about_components (name, component_key, is_visible, display_order) VALUES
    ('Hero Section', 'Hero', true, 0),
    ('Mission Section', 'Mission', true, 1),
    ('Why Choose Us', 'WhyChooseUs', true, 2),
    ('Values Section', 'Values', true, 3),
    ('Modules Section', 'Modules', true, 4),
    ('Team Section', 'Team', true, 5);
