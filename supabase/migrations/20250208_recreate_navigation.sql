-- Drop existing table if it exists
DROP TABLE IF EXISTS public.navigation_items;

-- Create the navigation_items table
CREATE TABLE public.navigation_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    href TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access" ON public.navigation_items;
DROP POLICY IF EXISTS "Allow admin write access" ON public.navigation_items;

-- Create simple policies
CREATE POLICY "Allow public read access"
ON public.navigation_items
FOR SELECT
USING (true);

CREATE POLICY "Allow admin write access"
ON public.navigation_items
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Grant access to public
ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.navigation_items TO authenticated;
GRANT SELECT ON public.navigation_items TO anon;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Insert initial data
INSERT INTO public.navigation_items (name, href, "order") VALUES
    ('Home', '/', 0),
    ('About', '/about', 1),
    ('Features', '/features', 2),
    ('Mentorship', '/mentorship', 3),
    ('Contact', '/contact', 4),
    ('Smartspoon', '/smartspoon', 5);
