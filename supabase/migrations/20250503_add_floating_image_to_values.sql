-- Add floating_image_url column to values_image table
ALTER TABLE values_image
ADD COLUMN floating_image_url TEXT;

-- Add comment to explain the purpose of the column
COMMENT ON COLUMN values_image.floating_image_url IS 'URL for the small floating image that overlaps with the main image';
