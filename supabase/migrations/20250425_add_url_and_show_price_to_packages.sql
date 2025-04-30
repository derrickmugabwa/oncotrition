-- Add url and show_price columns to mentorship_packages table
ALTER TABLE mentorship_packages 
ADD COLUMN url TEXT DEFAULT '',
ADD COLUMN show_price BOOLEAN DEFAULT true;

-- Update existing rows to have show_price set to true
UPDATE mentorship_packages SET show_price = true WHERE show_price IS NULL;

-- Make show_price not nullable after setting default values
ALTER TABLE mentorship_packages 
ALTER COLUMN show_price SET NOT NULL;
