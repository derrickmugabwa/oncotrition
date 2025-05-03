-- Add image column to modules table
ALTER TABLE public.modules
ADD COLUMN IF NOT EXISTS image_url TEXT;
