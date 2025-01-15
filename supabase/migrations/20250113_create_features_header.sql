-- Create a new table for features header content
CREATE TABLE IF NOT EXISTS features_header (
    id BIGINT PRIMARY KEY DEFAULT 1,
    heading TEXT NOT NULL DEFAULT 'Transform Your Health Journey',
    paragraph TEXT NOT NULL DEFAULT 'Experience a revolutionary approach to nutrition tracking and wellness management.',
    button_text TEXT NOT NULL DEFAULT 'Learn More',
    button_url TEXT NOT NULL DEFAULT '/features',
    CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default row if not exists
INSERT INTO features_header (id, heading, paragraph, button_text, button_url)
VALUES (1, 'Transform Your Health Journey', 'Experience a revolutionary approach to nutrition tracking and wellness management.', 'Learn More', '/features')
ON CONFLICT (id) DO NOTHING;
