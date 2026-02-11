-- Add is_recommended column to event_sponsorship_tiers table
-- This allows admins to mark a tier as "Most Popular" which displays a badge

ALTER TABLE event_sponsorship_tiers
ADD COLUMN IF NOT EXISTS is_recommended BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN event_sponsorship_tiers.is_recommended IS 'Marks tier as "Most Popular" - displays badge on frontend';

-- Update existing Silver tier to be recommended (if exists)
-- This is just a sample - admins can change this via the admin panel
UPDATE event_sponsorship_tiers
SET is_recommended = TRUE
WHERE tier_name = 'Silver Sponsor'
AND is_recommended IS NULL;
