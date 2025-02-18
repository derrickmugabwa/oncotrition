-- Add promotional image and URL columns to footer_settings table
ALTER TABLE footer_settings 
ADD COLUMN IF NOT EXISTS promo_image TEXT,
ADD COLUMN IF NOT EXISTS promo_url TEXT;
