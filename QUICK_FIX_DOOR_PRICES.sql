-- QUICK FIX: Add door prices to your existing pricing
-- Copy and run this in Supabase SQL Editor

-- Step 1: Ensure door_price column exists
ALTER TABLE nutrivibe_pricing
ADD COLUMN IF NOT EXISTS door_price DECIMAL(10, 2) NULL;

-- Step 2: Add door prices based on your current prices
-- Adjust these values as needed for your pricing strategy

-- Nutrition Student (current: 1800, add door price: 2300)
UPDATE nutrivibe_pricing 
SET door_price = 2300.00 
WHERE participation_type = 'nutrition_student';

-- Professional (current: 3200, add door price: 4000)
UPDATE nutrivibe_pricing 
SET door_price = 4000.00 
WHERE participation_type = 'professional';

-- Online Attendee (current: 600, add door price: 800)
UPDATE nutrivibe_pricing 
SET door_price = 800.00 
WHERE participation_type = 'online_attendee';

-- Add door prices for any other participation types you have
-- UPDATE nutrivibe_pricing SET door_price = XXXX WHERE participation_type = 'your_type';

-- Step 3: Verify the changes
SELECT 
    participation_type,
    price as early_bird_price,
    door_price as last_call_price,
    (door_price - price) as savings,
    ROUND(((door_price - price) / price * 100), 2) as savings_percentage,
    is_active,
    event_id
FROM nutrivibe_pricing
ORDER BY display_order;

-- You should see output like:
-- nutrition_student | 1800.00 | 2300.00 | 500.00 | 27.78% | true | null
-- professional      | 3200.00 | 4000.00 | 800.00 | 25.00% | true | null
-- online_attendee   |  600.00 |  800.00 | 200.00 | 33.33% | true | null
