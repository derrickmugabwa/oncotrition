-- Create the terms_and_conditions table
CREATE TABLE IF NOT EXISTS public.terms_and_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT,
    title VARCHAR(255),
    version VARCHAR(50),
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add comment to the table
COMMENT ON TABLE public.terms_and_conditions IS 'Stores terms and conditions content as editable text';

-- Set up Row Level Security (RLS)
ALTER TABLE public.terms_and_conditions ENABLE ROW LEVEL SECURITY;

-- Simple policy: Everyone can read active terms
DROP POLICY IF EXISTS "Everyone can read active terms" ON public.terms_and_conditions;
CREATE POLICY "Everyone can read active terms" 
ON public.terms_and_conditions
FOR SELECT 
USING (is_active = true);

-- Simple policy: Service role has full access
DROP POLICY IF EXISTS "Service role has full access to terms" ON public.terms_and_conditions;
CREATE POLICY "Service role has full access to terms" 
ON public.terms_and_conditions
FOR ALL
USING (true);


-- Drop trigger first if it exists (to avoid dependency issues)
DROP TRIGGER IF EXISTS update_terms_updated_at_trigger ON public.terms_and_conditions;

-- Then drop and recreate the function
DROP FUNCTION IF EXISTS update_terms_updated_at();
CREATE OR REPLACE FUNCTION update_terms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_terms_updated_at_trigger
BEFORE UPDATE ON public.terms_and_conditions
FOR EACH ROW
EXECUTE FUNCTION update_terms_updated_at();
