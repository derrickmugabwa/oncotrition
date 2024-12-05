-- Create features_banner table
CREATE TABLE features_banner (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    heading TEXT NOT NULL,
    bullet_points JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert initial data
INSERT INTO features_banner (id, title, subtitle, heading, bullet_points) VALUES
(
    1,
    'Why Choose Oncotrition',
    'Features that empower your health journey',
    'Transform Your Nutrition Journey',
    '[
        "Personalized meal plans tailored to your goals",
        "Real-time nutrition tracking and analytics",
        "Expert guidance from certified nutritionists",
        "Comprehensive recipe database with smart filters",
        "Progress tracking with detailed insights"
    ]'::jsonb
);

-- Create updated_at trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_features_banner_updated_at') THEN
        CREATE TRIGGER update_features_banner_updated_at
            BEFORE UPDATE ON features_banner
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END
$$;
