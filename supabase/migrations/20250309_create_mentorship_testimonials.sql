-- Drop existing tables first
DROP TABLE IF EXISTS mentorship_testimonials_content CASCADE;
DROP TABLE IF EXISTS mentorship_testimonials CASCADE;

-- Create mentorship_testimonials_content table for section content
CREATE TABLE mentorship_testimonials_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create mentorship_testimonials table for individual testimonials
CREATE TABLE mentorship_testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  company TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  image TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE mentorship_testimonials_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_testimonials ENABLE ROW LEVEL SECURITY;

-- Policies for mentorship_testimonials_content
CREATE POLICY "Allow public read access to mentorship_testimonials_content"
  ON mentorship_testimonials_content
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Allow authenticated users full access to mentorship_testimonials_content"
  ON mentorship_testimonials_content
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for mentorship_testimonials
CREATE POLICY "Allow public read access to mentorship_testimonials"
  ON mentorship_testimonials
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Allow authenticated users full access to mentorship_testimonials"
  ON mentorship_testimonials
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add triggers for updated_at
CREATE TRIGGER update_mentorship_testimonials_content_updated_at
  BEFORE UPDATE ON mentorship_testimonials_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentorship_testimonials_updated_at
  BEFORE UPDATE ON mentorship_testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial data
INSERT INTO mentorship_testimonials_content (title, description) VALUES
  ('Success Stories', 'Discover how our personalized nutrition mentorship has transformed lives. Read inspiring stories from clients who have achieved their health and wellness goals through our guidance.')
ON CONFLICT DO NOTHING;

INSERT INTO mentorship_testimonials (name, role, company, content, rating, image, order_index) VALUES
  ('Sarah Johnson', 'Fitness Coach', 'FitLife Studio', 'The personalized nutrition guidance has been transformative. Not only did I achieve my fitness goals, but I also developed a much healthier relationship with food. The holistic approach to wellness made all the difference.', 5, '/testimonials/sarah.jpg', 1),
  ('Michael Chen', 'Marathon Runner', 'RunTech Athletics', 'As an endurance athlete, proper nutrition is crucial. The mentorship program helped me optimize my diet for performance. My energy levels and recovery times have improved significantly.', 4, '/testimonials/michael.jpg', 2),
  ('Emma Davis', 'Wellness Coach', 'Vitality Center', 'The evidence-based approach to nutrition coaching is exactly what I was looking for. The personalized meal plans and ongoing support have helped me guide my own clients more effectively.', 5, '/testimonials/emma.jpg', 3)
ON CONFLICT DO NOTHING;
