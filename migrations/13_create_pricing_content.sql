-- Create pricing_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS pricing_plans (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    billing_period TEXT NOT NULL,
    description TEXT NOT NULL,
    features TEXT[] NOT NULL,
    is_popular BOOLEAN DEFAULT false,
    display_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create pricing_overview table if it doesn't exist
CREATE TABLE IF NOT EXISTS pricing_overview (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Only insert into pricing_overview if empty
INSERT INTO pricing_overview (id, title, subtitle, description)
SELECT 1, 'Simple, Transparent Pricing', 'Choose the plan that works for you', 'Get started on your health journey with our flexible pricing options. All plans include core features and expert support.'
WHERE NOT EXISTS (SELECT 1 FROM pricing_overview WHERE id = 1);

-- Only insert into pricing_plans if empty
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pricing_plans LIMIT 1) THEN
        INSERT INTO pricing_plans (name, price, billing_period, description, features, is_popular, display_order) VALUES
        ('Basic', 9.99, 'month', 'Perfect for individuals starting their health journey', 
         ARRAY['Personalized meal plans', 'Basic nutrition tracking', 'Recipe database access', 'Email support'], 
         false, 1),
        ('Pro', 19.99, 'month', 'Ideal for health enthusiasts seeking advanced features', 
         ARRAY['Everything in Basic', 'Advanced analytics', 'Custom workout plans', 'Priority support', 'Progress tracking', 'Community access'], 
         true, 2),
        ('Enterprise', 49.99, 'month', 'Complete solution for professional nutritionists', 
         ARRAY['Everything in Pro', 'White-label options', 'API access', 'Dedicated account manager', 'Custom integrations', 'Team management'], 
         false, 3);
    END IF;
END $$;

-- Create or replace updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop triggers if they exist and recreate them
DROP TRIGGER IF EXISTS update_pricing_plans_updated_at ON pricing_plans;
DROP TRIGGER IF EXISTS update_pricing_overview_updated_at ON pricing_overview;

CREATE TRIGGER update_pricing_plans_updated_at
    BEFORE UPDATE ON pricing_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_overview_updated_at
    BEFORE UPDATE ON pricing_overview
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
