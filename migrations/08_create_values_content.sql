-- Create the values_vision table for vision content
CREATE TABLE IF NOT EXISTS values_vision (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    bullet_points JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the values_list table for values content
CREATE TABLE IF NOT EXISTS values_list (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    display_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_values_vision_updated_at
    BEFORE UPDATE ON values_vision
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_values_list_updated_at
    BEFORE UPDATE ON values_list
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial vision content
INSERT INTO values_vision (title, description, bullet_points) VALUES (
    'Our Vision',
    'To revolutionize global nutrition by making personalized wellness accessible to everyone. We envision a world where optimal health is achievable through data-driven insights and expert guidance.',
    '["Empowering healthier communities worldwide", "Pioneering AI-driven nutrition solutions", "Creating lasting positive health impact"]'::jsonb
);

-- Insert initial values content
INSERT INTO values_list (title, description, display_order) VALUES
(
    'Innovation',
    'Continuously pushing boundaries in nutritional science and technology',
    0
),
(
    'Integrity',
    'Maintaining the highest standards of professional ethics and transparency',
    1
),
(
    'Impact',
    'Creating meaningful change in people''s lives through better nutrition',
    2
),
(
    'Inclusion',
    'Making expert nutrition guidance accessible to everyone, everywhere',
    3
);
