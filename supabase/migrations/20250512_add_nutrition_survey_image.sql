-- Drop existing table if it exists
DROP TABLE IF EXISTS nutrition_survey_image CASCADE;

-- Create nutrition_survey_image table
CREATE TABLE nutrition_survey_image (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies for nutrition_survey_image
ALTER TABLE nutrition_survey_image ENABLE ROW LEVEL SECURITY;

-- Public can view the image
CREATE POLICY "nutrition_survey_image_read_policy"
ON nutrition_survey_image
FOR SELECT
TO public
USING (true);

-- Only authenticated users (admins) can modify the image
CREATE POLICY "nutrition_survey_image_admin_policy"
ON nutrition_survey_image
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Create trigger for updated_at column
CREATE TRIGGER update_nutrition_survey_image_updated_at
    BEFORE UPDATE ON nutrition_survey_image
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default image (optional - commented out since we'll let admins upload their own)
-- INSERT INTO nutrition_survey_image (image_url) VALUES
--   ('https://your-default-image-url.jpg')
-- ON CONFLICT DO NOTHING;
