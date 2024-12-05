-- Create features_overview table if it doesn't exist
CREATE TABLE IF NOT EXISTS features_overview (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create features_grid table if it doesn't exist
CREATE TABLE IF NOT EXISTS features_grid (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    gradient TEXT NOT NULL DEFAULT 'from-blue-400 to-indigo-500',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Only insert into features_overview if empty
INSERT INTO features_overview (id, title, subtitle, description)
SELECT 1, 'Transform Your Health Journey', 'Discover a Better Way to Wellness', 'Experience personalized nutrition guidance and expert support on your path to better health.'
WHERE NOT EXISTS (SELECT 1 FROM features_overview WHERE id = 1);

-- Only insert into features_grid if empty
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM features_grid LIMIT 1) THEN
        INSERT INTO features_grid (title, description, icon_name, display_order, gradient) VALUES
        ('Health Monitoring', 'Track your vital health metrics and see your progress over time.', 'FaHeartbeat', 1, 'from-pink-400 to-red-500'),
        ('Data Analytics', 'Get insights from your nutrition and health data with advanced analytics.', 'FaChartLine', 2, 'from-purple-400 to-indigo-500'),
        ('Meal Planning', 'Create customized meal plans that fit your dietary needs and preferences.', 'FaAppleAlt', 3, 'from-green-400 to-emerald-500'),
        ('Mental Wellness', 'Holistic approach integrating mental health with nutrition guidance.', 'FaBrain', 4, 'from-blue-400 to-cyan-500'),
        ('Fitness Integration', 'Seamlessly combine nutrition planning with your fitness routine.', 'FaRunning', 5, 'from-amber-400 to-orange-500'),
        ('Community Support', 'Connect with others on similar health journeys for motivation.', 'FaUserFriends', 6, 'from-teal-400 to-cyan-500');
    END IF;
END $$;

-- Update features_grid with correct icon names (safe to run multiple times)
UPDATE features_grid
SET icon_name = CASE
    WHEN display_order = 1 THEN 'FaHeartbeat'
    WHEN display_order = 2 THEN 'FaChartLine'
    WHEN display_order = 3 THEN 'FaAppleAlt'
    WHEN display_order = 4 THEN 'FaBrain'
    WHEN display_order = 5 THEN 'FaRunning'
    WHEN display_order = 6 THEN 'FaUserFriends'
END;

-- Create or replace updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop triggers if they exist and recreate them
DROP TRIGGER IF EXISTS update_features_overview_updated_at ON features_overview;
DROP TRIGGER IF EXISTS update_features_grid_updated_at ON features_grid;

CREATE TRIGGER update_features_overview_updated_at
    BEFORE UPDATE ON features_overview
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_features_grid_updated_at
    BEFORE UPDATE ON features_grid
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
