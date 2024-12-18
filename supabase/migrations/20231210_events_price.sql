-- Add price field to mentorship_events table
ALTER TABLE mentorship_events
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- Update existing events to have a default price if needed
UPDATE mentorship_events
SET price = 1000.00
WHERE price = 0.00 OR price IS NULL;
