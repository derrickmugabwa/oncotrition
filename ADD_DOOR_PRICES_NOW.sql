-- ============================================
-- RUN THIS SQL IN SUPABASE TO ADD DOOR PRICES
-- ============================================

-- Add door prices to your existing pricing options
-- These values are suggestions based on your current prices
-- Adjust them as needed for your pricing strategy

UPDATE nutrivibe_pricing 
SET door_price = 2300.00 
WHERE participation_type = 'nutrition_student';

UPDATE nutrivibe_pricing 
SET door_price = 4000.00 
WHERE participation_type = 'professional';

UPDATE nutrivibe_pricing 
SET door_price = 800.00 
WHERE participation_type = 'online_attendee';

-- Verify the changes worked
SELECT 
    participation_type,
    price as "Early Bird Price",
    door_price as "Last Call Price",
    (door_price - price) as "Savings",
    is_active
FROM nutrivibe_pricing
ORDER BY display_order;
