-- Add background_image column to page_sections table
ALTER TABLE public.page_sections
ADD COLUMN IF NOT EXISTS background_image TEXT;

-- Update existing records to have empty background_image
UPDATE public.page_sections
SET background_image = ''
WHERE background_image IS NULL;
