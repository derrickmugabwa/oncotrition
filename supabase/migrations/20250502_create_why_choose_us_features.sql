-- Create the why_choose_us_features table
CREATE TABLE IF NOT EXISTS public.why_choose_us_features (
  id serial NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  icon_path text NOT NULL,
  display_order integer NOT NULL,
  created_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT why_choose_us_features_pkey PRIMARY KEY (id)
);

-- Add RLS policies for why_choose_us_features
ALTER TABLE public.why_choose_us_features ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON public.why_choose_us_features
    FOR SELECT
    TO public
    USING (true);

-- Allow authenticated users to update
CREATE POLICY "Allow authenticated users to update" ON public.why_choose_us_features
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert" ON public.why_choose_us_features
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
    
-- Allow authenticated users to delete
CREATE POLICY "Allow authenticated users to delete" ON public.why_choose_us_features
    FOR DELETE
    TO authenticated
    USING (true);
