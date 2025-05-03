-- Add learn_more_url column to modules table
ALTER TABLE modules ADD COLUMN IF NOT EXISTS learn_more_url TEXT;
