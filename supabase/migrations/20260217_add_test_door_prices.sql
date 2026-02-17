-- Check if door_price column exists and add test data
-- Run this to verify the column exists and populate test door prices

-- First, check the current structure (for debugging)
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'nutrivibe_pricing';

-- Add door_price column if it doesn't exist (from previous migration)
ALTER TABLE nutrivibe_pricing
ADD COLUMN IF NOT EXISTS door_price DECIMAL(10, 2) NULL;

-- Update existing pricing with door prices for testing
UPDATE nutrivibe_pricing 
SET door_price = 2300.00 
WHERE participation_type = 'nutrition_student' AND (door_price IS NULL OR door_price = 0);

UPDATE nutrivibe_pricing 
SET door_price = 4000.00 
WHERE participation_type = 'professional' AND (door_price IS NULL OR door_price = 0);

UPDATE nutrivibe_pricing 
SET door_price = 4000.00 
WHERE participation_type = 'healthcare_professional' AND (door_price IS NULL OR door_price = 0);

UPDATE nutrivibe_pricing 
SET door_price = 4000.00 
WHERE participation_type = 'institutional_representative' AND (door_price IS NULL OR door_price = 0);

UPDATE nutrivibe_pricing 
SET door_price = 800.00 
WHERE participation_type = 'online_attendee' AND (door_price IS NULL OR door_price = 0);

-- Verify the updates
SELECT participation_type, price, door_price, 
       (door_price - price) as savings,
       is_active, event_id
FROM nutrivibe_pricing
ORDER BY display_order;
