-- Create event_bookings table
CREATE TABLE IF NOT EXISTS event_bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES mentorship_events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    booking_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
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

    -- Drop and recreate trigger
    DROP TRIGGER IF EXISTS update_event_bookings_updated_at ON event_bookings;
    CREATE TRIGGER update_event_bookings_updated_at
        BEFORE UPDATE ON event_bookings
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
END $$;
