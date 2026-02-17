-- Add door_price (Last Call Price) field to nutrivibe_pricing table
-- This allows events to have different pricing for last-minute/door registrations

ALTER TABLE nutrivibe_pricing
ADD COLUMN IF NOT EXISTS door_price DECIMAL(10, 2) NULL;

-- Add comment explaining the door_price field
COMMENT ON COLUMN nutrivibe_pricing.door_price IS 'Last call/door price - higher price for late registrations. NULL means no door pricing available.';

-- Create index for better query performance when filtering by door_price availability
CREATE INDEX IF NOT EXISTS idx_nutrivibe_pricing_door_price ON nutrivibe_pricing(door_price) WHERE door_price IS NOT NULL;
