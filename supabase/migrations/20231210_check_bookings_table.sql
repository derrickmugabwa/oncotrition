-- Check if table exists and create it if not
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'event_bookings') THEN
        CREATE TABLE event_bookings (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            event_id UUID REFERENCES mentorship_events(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            amount DECIMAL(10,2),
            booking_status VARCHAR(20) DEFAULT 'pending',
            payment_status VARCHAR(20) DEFAULT 'pending',
            payment_reference VARCHAR(50),
            payment_amount DECIMAL(10,2),
            payment_phone VARCHAR(20),
            payment_date TIMESTAMP WITH TIME ZONE,
            payment_error TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Create index on payment_reference
        CREATE INDEX idx_event_bookings_payment_reference ON event_bookings(payment_reference);
    END IF;
END $$;

-- Create or replace the function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create function to update available slots
CREATE OR REPLACE FUNCTION update_event_slots()
RETURNS TRIGGER AS $$
BEGIN
    -- If a new booking is created
    IF (TG_OP = 'INSERT') THEN
        -- Decrease available slots by 1
        UPDATE mentorship_events
        SET available_slots = available_slots - 1
        WHERE id = NEW.event_id
        AND available_slots > 0;
        
        -- If no rows were updated (available_slots was 0), raise an exception
        IF NOT FOUND THEN
            RAISE EXCEPTION 'No available slots for this event';
        END IF;
    -- If a booking is deleted
    ELSIF (TG_OP = 'DELETE') THEN
        -- Increase available slots by 1
        UPDATE mentorship_events
        SET available_slots = available_slots + 1
        WHERE id = OLD.event_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Handle policies and trigger
DO $$
BEGIN
    -- Drop existing policies
    DROP POLICY IF EXISTS "Anyone can create bookings" ON event_bookings;
    DROP POLICY IF EXISTS "Admins can view all bookings" ON event_bookings;
    DROP POLICY IF EXISTS "Admins can update all bookings" ON event_bookings;
    DROP POLICY IF EXISTS "Server can update payment status" ON event_bookings;
    DROP POLICY IF EXISTS "Anyone can view events" ON mentorship_events;
    DROP POLICY IF EXISTS "Admins can manage events" ON mentorship_events;
    
    -- Enable RLS
    ALTER TABLE event_bookings ENABLE ROW LEVEL SECURITY;
    ALTER TABLE mentorship_events ENABLE ROW LEVEL SECURITY;

    -- Create policies for event_bookings
    CREATE POLICY "Anyone can create bookings"
    ON event_bookings
    FOR INSERT
    TO public
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM mentorship_events
            WHERE id = event_id
            AND available_slots > 0
        )
    );

    CREATE POLICY "Admins can view all bookings"
    ON event_bookings
    FOR SELECT
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

    CREATE POLICY "Admins can update bookings"
    ON event_bookings
    FOR UPDATE
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

    -- Allow server to update payment status
    CREATE POLICY "Server can update payment status"
    ON event_bookings
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

    -- Create policies for mentorship_events
    CREATE POLICY "Anyone can view events"
    ON mentorship_events
    FOR SELECT
    TO public
    USING (true);

    CREATE POLICY "Admins can manage events"
    ON mentorship_events
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

    -- Drop and recreate triggers
    DROP TRIGGER IF EXISTS update_event_bookings_updated_at ON event_bookings;
    DROP TRIGGER IF EXISTS update_event_slots_trigger ON event_bookings;

    -- Create trigger for updating timestamps
    CREATE TRIGGER update_event_bookings_updated_at
        BEFORE UPDATE ON event_bookings
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    -- Create trigger for updating available slots
    CREATE TRIGGER update_event_slots_trigger
        AFTER INSERT OR DELETE ON event_bookings
        FOR EACH ROW
        EXECUTE FUNCTION update_event_slots();
END $$;
