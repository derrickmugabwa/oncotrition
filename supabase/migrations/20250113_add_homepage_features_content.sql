-- Add new columns to features table for homepage content
ALTER TABLE features
ADD COLUMN IF NOT EXISTS heading TEXT,
ADD COLUMN IF NOT EXISTS paragraph TEXT,
ADD COLUMN IF NOT EXISTS button_text TEXT DEFAULT 'Learn More',
ADD COLUMN IF NOT EXISTS button_url TEXT DEFAULT '/features';

-- Update existing rows with default values
UPDATE features
SET 
  heading = title,
  paragraph = description,
  button_text = 'Learn More',
  button_url = '/features'
WHERE heading IS NULL;
