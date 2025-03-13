-- Drop existing tables and triggers first
DROP TABLE IF EXISTS nutrition_survey CASCADE;
DROP TABLE IF EXISTS nutrition_survey_content CASCADE;

-- Create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create nutrition_survey_content table first
CREATE TABLE nutrition_survey_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create nutrition_survey table
CREATE TABLE nutrition_survey (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies for nutrition_survey_content
ALTER TABLE nutrition_survey_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nutrition_survey_content_read_policy"
ON nutrition_survey_content
FOR SELECT
TO public
USING (true);

CREATE POLICY "nutrition_survey_content_admin_policy"
ON nutrition_survey_content
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Add RLS policies for nutrition_survey
ALTER TABLE nutrition_survey ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nutrition_survey_read_policy"
ON nutrition_survey
FOR SELECT
TO public
USING (true);

CREATE POLICY "nutrition_survey_admin_policy"
ON nutrition_survey
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create triggers for updated_at columns
CREATE TRIGGER update_nutrition_survey_content_updated_at
    BEFORE UPDATE ON nutrition_survey_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrition_survey_updated_at
    BEFORE UPDATE ON nutrition_survey
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial data
INSERT INTO nutrition_survey_content (title, description) VALUES
  ('Nutrition Assessment Questions', 'Key questions we''ll explore during your nutrition consultation')
ON CONFLICT DO NOTHING;

INSERT INTO nutrition_survey (question, order_index) VALUES
  ('How would you describe your current eating habits?', 1),
  ('What are your main nutrition goals?', 2),
  ('Do you have any dietary restrictions or allergies?', 3),
  ('How often do you exercise?', 4),
  ('What challenges do you face with your nutrition?', 5)
ON CONFLICT DO NOTHING;
