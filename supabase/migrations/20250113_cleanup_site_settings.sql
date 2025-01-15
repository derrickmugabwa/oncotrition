-- First, get the most recent row's data
WITH latest_settings AS (
  SELECT logo_url
  FROM site_settings
  ORDER BY updated_at DESC
  LIMIT 1
)
-- Delete all rows
DELETE FROM site_settings;

-- Re-insert the single row with the latest data
INSERT INTO site_settings (id, logo_url)
SELECT 1, logo_url
FROM latest_settings;

-- If no rows existed, insert default row
INSERT INTO site_settings (id, logo_url)
SELECT 1, 'logo.png'
WHERE NOT EXISTS (SELECT 1 FROM site_settings);

-- Add unique constraint to ensure only one row
ALTER TABLE site_settings ADD CONSTRAINT site_settings_single_row UNIQUE (id);
ALTER TABLE site_settings ADD CONSTRAINT site_settings_id_check CHECK (id = 1);
