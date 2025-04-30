-- Migration to add a title field for promotional images in the footer_settings table

-- Check if the footer_settings table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'footer_settings') THEN
    -- Add a new promo_title column as TEXT with a default value
    ALTER TABLE footer_settings 
    ADD COLUMN IF NOT EXISTS promo_title TEXT DEFAULT 'Featured Content';
  END IF;
END
$$;
