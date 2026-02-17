-- Add TBD (To Be Determined) fields to events table
-- This allows events to be created without specific dates/times

-- Add date_tbd and time_tbd boolean fields
ALTER TABLE events
ADD COLUMN IF NOT EXISTS date_tbd BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS time_tbd BOOLEAN DEFAULT false;

-- Make event_date and event_time nullable when TBD is enabled
ALTER TABLE events
ALTER COLUMN event_date DROP NOT NULL,
ALTER COLUMN event_time DROP NOT NULL;

-- Add check constraint to ensure either date is provided OR date_tbd is true
ALTER TABLE events
ADD CONSTRAINT check_event_date_or_tbd 
CHECK (
  (event_date IS NOT NULL AND date_tbd = false) OR 
  (event_date IS NULL AND date_tbd = true)
);

-- Add check constraint to ensure either time is provided OR time_tbd is true
ALTER TABLE events
ADD CONSTRAINT check_event_time_or_tbd 
CHECK (
  (event_time IS NOT NULL AND time_tbd = false) OR 
  (event_time IS NULL AND time_tbd = true)
);

-- Create index for TBD fields for better query performance
CREATE INDEX IF NOT EXISTS idx_events_date_tbd ON events(date_tbd);
CREATE INDEX IF NOT EXISTS idx_events_time_tbd ON events(time_tbd);

-- Add comment explaining the TBD feature
COMMENT ON COLUMN events.date_tbd IS 'When true, event date is To Be Determined (TBD)';
COMMENT ON COLUMN events.time_tbd IS 'When true, event time is To Be Determined (TBD)';
