-- Create smartspoon_users_header table
CREATE TABLE IF NOT EXISTS public.smartspoon_users_header (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    heading TEXT NOT NULL,
    paragraph TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create smartspoon_users table
CREATE TABLE IF NOT EXISTS public.smartspoon_users (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    sort_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE public.smartspoon_users_header ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.smartspoon_users ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON public.smartspoon_users_header
    FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access" ON public.smartspoon_users
    FOR SELECT
    USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated users to manage" ON public.smartspoon_users_header
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage" ON public.smartspoon_users
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Create updated_at triggers
CREATE TRIGGER handle_smartspoon_users_header_updated_at
    BEFORE UPDATE ON public.smartspoon_users_header
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_smartspoon_users_updated_at
    BEFORE UPDATE ON public.smartspoon_users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Insert default data
INSERT INTO public.smartspoon_users_header (heading, paragraph)
VALUES (
    'Who Benefits from SmartSpoon?',
    'Our innovative smart utensil technology serves diverse groups of users, helping them achieve their nutrition and health goals.'
);

INSERT INTO public.smartspoon_users (title, description, icon_name, sort_order)
VALUES 
    ('Athletes & Sports Enthusiasts', 'Track nutrition and optimize performance with precision monitoring of intake and energy expenditure.', 'bolt', 0),
    ('Health-Conscious Individuals', 'Monitor daily nutritional intake and maintain a balanced diet with smart tracking technology.', 'sparkles', 1),
    ('Fitness Trainers', 'Help clients achieve their goals with accurate nutrition tracking and data-driven insights.', 'trophy', 2),
    ('Nutritionists & Dietitians', 'Provide professional guidance backed by precise nutritional data and real-time monitoring.', 'academic', 3);
