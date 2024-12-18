-- Create the enum type for duration
CREATE TYPE package_duration AS ENUM ('day', 'week', 'month', 'year');

-- Add duration_type column to mentorship_packages with default value
ALTER TABLE mentorship_packages 
ADD COLUMN duration_type package_duration NOT NULL DEFAULT 'month';

-- Add duration_type column to smartspoon_packages with default value
ALTER TABLE smartspoon_packages 
ADD COLUMN duration_type package_duration NOT NULL DEFAULT 'month';

-- Add comment for documentation
COMMENT ON COLUMN mentorship_packages.duration_type IS 'The duration unit for the package price (day, week, month, year)';
COMMENT ON COLUMN smartspoon_packages.duration_type IS 'The duration unit for the package price (day, week, month, year)';

-- Update existing rows to have 'month' as duration_type
UPDATE mentorship_packages SET duration_type = 'month' WHERE duration_type IS NULL;
UPDATE smartspoon_packages SET duration_type = 'month' WHERE duration_type IS NULL;
