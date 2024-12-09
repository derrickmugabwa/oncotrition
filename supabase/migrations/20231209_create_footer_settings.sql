-- Drop existing table and its dependencies
DROP TABLE IF EXISTS footer_settings CASCADE;

-- Create the footer_settings table
CREATE TABLE footer_settings (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    social_links JSONB DEFAULT jsonb_build_object(
        'facebook', '',
        'twitter', '',
        'instagram', '',
        'linkedin', ''
    ),
    contact_info JSONB DEFAULT jsonb_build_object(
        'email', '',
        'phone', '',
        'address', ''
    ),
    quick_links JSONB DEFAULT '[]'::jsonb,
    legal_links JSONB DEFAULT jsonb_build_object(
        'privacy_policy', '',
        'terms_of_service', '',
        'cookie_policy', ''
    ),
    newsletter JSONB DEFAULT jsonb_build_object(
        'enabled', true,
        'description', 'Subscribe to our newsletter for tips and updates.'
    ),
    brand JSONB DEFAULT jsonb_build_object(
        'description', 'Empowering your journey to better health through personalized nutrition guidance.'
    ),
    copyright_text TEXT DEFAULT ' ' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || ' Oncotrition. All rights reserved.',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT single_row CHECK (id = 1)
);

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_footer_settings_updated_at ON footer_settings;

-- Create an update trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_footer_settings_updated_at
    BEFORE UPDATE ON footer_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default record
INSERT INTO footer_settings (
    social_links,
    contact_info,
    quick_links,
    legal_links,
    newsletter,
    brand,
    copyright_text
)
VALUES (
    jsonb_build_object(
        'facebook', 'https://www.facebook.com/profile.php?id=61564768904026',
        'twitter', '',
        'instagram', 'https://www.instagram.com/smart.spoon.plus/',
        'linkedin', ''
    ),
    jsonb_build_object(
        'email', 'info@oncotrition.com',
        'phone', '0714034902',
        'address', ''
    ),
    jsonb_build_array(
        jsonb_build_object('name', 'Home', 'href', '/'),
        jsonb_build_object('name', 'About', 'href', '/about'),
        jsonb_build_object('name', 'Features', 'href', '/features'),
        jsonb_build_object('name', 'Pricing', 'href', '/pricing'),
        jsonb_build_object('name', 'Blog', 'href', '/blog'),
        jsonb_build_object('name', 'Contact', 'href', '/contact')
    ),
    jsonb_build_object(
        'privacy_policy', '/privacy',
        'terms_of_service', '/terms',
        'cookie_policy', '/cookies'
    ),
    jsonb_build_object(
        'enabled', true,
        'description', 'Subscribe to our newsletter for tips and updates.'
    ),
    jsonb_build_object(
        'description', 'Empowering your journey to better health through personalized nutrition guidance.'
    ),
    ' ' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || ' Oncotrition. All rights reserved.'
);

-- Create RLS policies
ALTER TABLE footer_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to footer_settings" ON footer_settings;
DROP POLICY IF EXISTS "Allow authenticated users to modify footer_settings" ON footer_settings;

-- Allow anyone to read footer settings
CREATE POLICY "Allow public read access to footer_settings"
    ON footer_settings FOR SELECT
    TO public
    USING (true);

-- Allow authenticated users to modify footer settings
CREATE POLICY "Allow authenticated users to modify footer_settings"
    ON footer_settings FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_footer_settings_updated_at ON footer_settings(updated_at);

-- Add comments for documentation
COMMENT ON TABLE footer_settings IS 'Stores website footer configuration and content';
COMMENT ON COLUMN footer_settings.social_links IS 'Social media links and icons';
COMMENT ON COLUMN footer_settings.contact_info IS 'Contact information including email, phone, and address';
COMMENT ON COLUMN footer_settings.quick_links IS 'Navigation links shown in the footer';
COMMENT ON COLUMN footer_settings.legal_links IS 'Links to legal pages like privacy policy and terms';
COMMENT ON COLUMN footer_settings.newsletter IS 'Newsletter section configuration';
COMMENT ON COLUMN footer_settings.brand IS 'Brand-related content like description';
COMMENT ON COLUMN footer_settings.copyright_text IS 'Copyright notice text';
