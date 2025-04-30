-- Migration to update footer_settings table to support multiple promotional images
-- This migration changes the promo_image and promo_url columns to a JSONB array of images and links

-- First, check if the footer_settings table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'footer_settings') THEN
    -- Add a new promo_images column as JSONB array
    ALTER TABLE footer_settings 
    ADD COLUMN IF NOT EXISTS promo_images JSONB DEFAULT '[]'::jsonb;

    -- Migrate existing data from promo_image and promo_url to the new promo_images array
    UPDATE footer_settings
    SET promo_images = jsonb_build_array(
      jsonb_build_object(
        'image_url', promo_image,
        'link_url', promo_url
      )
    )
    WHERE promo_image IS NOT NULL AND promo_image != '';

    -- Drop the old columns (optional - you can keep them for backward compatibility)
    -- Uncomment the lines below if you want to remove the old columns
    -- ALTER TABLE footer_settings DROP COLUMN IF EXISTS promo_image;
    -- ALTER TABLE footer_settings DROP COLUMN IF EXISTS promo_url;
  END IF;
END
$$;
