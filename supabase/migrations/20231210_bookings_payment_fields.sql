-- Add payment fields to event_bookings table
ALTER TABLE event_bookings
ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS payment_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_error TEXT;

-- Create index on payment_reference for faster lookups
CREATE INDEX IF NOT EXISTS idx_event_bookings_payment_reference ON event_bookings(payment_reference);

-- Enable Row Level Security if not already enabled
ALTER TABLE event_bookings ENABLE ROW LEVEL SECURITY;

-- Create or replace the function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Handle policies and trigger
DO $$
DECLARE
    policy_exists boolean;
BEGIN
    -- Check and create policies for event_bookings
    SELECT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'event_bookings' 
        AND policyname = 'Anyone can create bookings'
    ) INTO policy_exists;
    
    IF NOT policy_exists THEN
        CREATE POLICY "Anyone can create bookings"
        ON event_bookings FOR INSERT
        TO public
        WITH CHECK (true);
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'event_bookings' 
        AND policyname = 'Admins can view all bookings'
    ) INTO policy_exists;
    
    IF NOT policy_exists THEN
        CREATE POLICY "Admins can view all bookings"
        ON event_bookings FOR SELECT
        TO authenticated
        USING (auth.jwt() ->> 'role' = 'admin');
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'event_bookings' 
        AND policyname = 'Admins can update all bookings'
    ) INTO policy_exists;
    
    IF NOT policy_exists THEN
        CREATE POLICY "Admins can update all bookings"
        ON event_bookings FOR UPDATE
        TO authenticated
        USING (auth.jwt() ->> 'role' = 'admin');
    END IF;

    -- Check and create policies for mentorship_events
    SELECT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'mentorship_events' 
        AND policyname = 'Anyone can view events'
    ) INTO policy_exists;
    
    IF NOT policy_exists THEN
        CREATE POLICY "Anyone can view events"
        ON mentorship_events FOR SELECT
        TO public
        USING (true);
    END IF;

    -- Drop and recreate trigger
    DROP TRIGGER IF EXISTS update_event_bookings_updated_at ON event_bookings;
    CREATE TRIGGER update_event_bookings_updated_at
        BEFORE UPDATE ON event_bookings
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
END $$;
