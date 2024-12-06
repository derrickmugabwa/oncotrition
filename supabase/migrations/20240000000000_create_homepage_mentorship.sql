-- Create homepage_mentorship table
CREATE TABLE IF NOT EXISTS homepage_mentorship (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  button_text TEXT NOT NULL DEFAULT 'Learn More',
  button_link TEXT NOT NULL DEFAULT '/mentorship',
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insert default data
INSERT INTO homepage_mentorship (
  title, 
  subtitle, 
  description, 
  image_url,
  features
) VALUES (
  'Transform Your Practice with Expert Guidance',
  'Premium Mentorship Program',
  'Join our exclusive mentorship program and gain access to personalized guidance, advanced nutrition strategies, and a supportive community of healthcare professionals. Elevate your practice and make a greater impact on your clients'' lives.',
  '/mentorship-banner.jpg',
  '["1:1 Coaching", "Weekly Workshops", "Resource Library", "Community Access"]'::jsonb
) ON CONFLICT DO NOTHING;

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_homepage_mentorship_updated_at
    BEFORE UPDATE ON homepage_mentorship
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
