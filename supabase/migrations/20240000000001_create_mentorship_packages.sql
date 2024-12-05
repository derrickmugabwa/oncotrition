-- Create mentorship_packages table
CREATE TABLE IF NOT EXISTS public.mentorship_packages (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    features TEXT[] NOT NULL,
    recommended BOOLEAN NOT NULL DEFAULT false,
    gradient VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create update_updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for mentorship_packages
DROP TRIGGER IF EXISTS update_mentorship_packages_updated_at ON public.mentorship_packages;
CREATE TRIGGER update_mentorship_packages_updated_at
    BEFORE UPDATE ON public.mentorship_packages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Add RLS policies
ALTER TABLE public.mentorship_packages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view mentorship packages" ON public.mentorship_packages;
DROP POLICY IF EXISTS "Only authenticated users can modify mentorship packages" ON public.mentorship_packages;

-- Policy for select (anyone can view)
CREATE POLICY "Anyone can view mentorship packages"
    ON public.mentorship_packages
    FOR SELECT
    USING (true);

-- Policy for insert/update/delete (only authenticated users)
CREATE POLICY "Only authenticated users can modify mentorship packages"
    ON public.mentorship_packages
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Insert initial data
INSERT INTO public.mentorship_packages (name, price, features, gradient, recommended)
VALUES
    (
        'Basic',
        9.99,
        ARRAY[
            'Personalized meal plans',
            'Basic nutrition tracking',
            'Weekly progress reports',
            'Email support',
            'Mobile app access'
        ],
        'from-blue-400/20 to-indigo-400/20',
        false
    ),
    (
        'Pro',
        19.99,
        ARRAY[
            'Everything in Basic',
            'Advanced nutrition analytics',
            'Custom recipe suggestions',
            'Priority email support',
            'Meal plan customization',
            'Progress tracking dashboard'
        ],
        'from-blue-500/20 to-indigo-500/20',
        true
    ),
    (
        'Enterprise',
        39.99,
        ARRAY[
            'Everything in Pro',
            '1-on-1 nutrition coaching',
            'Video consultations',
            '24/7 priority support',
            'Custom meal planning',
            'Advanced health metrics',
            'Team collaboration tools'
        ],
        'from-blue-600/20 to-indigo-600/20',
        false
    );

-- Add table comments
COMMENT ON TABLE public.mentorship_packages IS 'Stores mentorship package information';
COMMENT ON COLUMN public.mentorship_packages.name IS 'Package name';
COMMENT ON COLUMN public.mentorship_packages.price IS 'Monthly price in USD';
COMMENT ON COLUMN public.mentorship_packages.features IS 'Array of package features';
COMMENT ON COLUMN public.mentorship_packages.recommended IS 'Whether this is the recommended package';
COMMENT ON COLUMN public.mentorship_packages.gradient IS 'Tailwind CSS gradient classes for the package card';
