-- Add cta_url column to slider_images table
ALTER TABLE slider_images 
ADD COLUMN IF NOT EXISTS cta_url TEXT DEFAULT '/';

-- Update existing rows to have default value
UPDATE slider_images 
SET cta_url = '/' 
WHERE cta_url IS NULL;
