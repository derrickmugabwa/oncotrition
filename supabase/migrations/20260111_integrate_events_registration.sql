-- Integration Migration: Link NutriVibe Registration System to Events
-- This migration extends the events table and links existing nutrivibe tables

-- ============================================================================
-- STEP 1: Extend Events Table with Registration Capabilities
-- ============================================================================

-- Add registration-related columns to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS has_internal_registration BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_type VARCHAR(50) DEFAULT 'external';
-- Options: 'external' (link), 'internal' (our system), 'none' (no registration)

ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMP;
ALTER TABLE events ADD COLUMN IF NOT EXISTS early_bird_deadline TIMESTAMP;
ALTER TABLE events ADD COLUMN IF NOT EXISTS early_bird_discount DECIMAL(5, 2) DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS terms_and_conditions TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS requires_payment BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS venue_details TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_registration_type ON events(registration_type);
CREATE INDEX IF NOT EXISTS idx_events_has_registration ON events(has_internal_registration);
CREATE INDEX IF NOT EXISTS idx_events_requires_payment ON events(requires_payment);

-- Add comment for documentation
COMMENT ON COLUMN events.has_internal_registration IS 'Whether this event uses our internal registration system';
COMMENT ON COLUMN events.registration_type IS 'Type of registration: external (link), internal (our system), or none';
COMMENT ON COLUMN events.requires_payment IS 'Whether registration requires payment via Paystack';

-- ============================================================================
-- STEP 2: Add event_id to Existing NutriVibe Tables
-- ============================================================================

-- Add event_id column to nutrivibe_registrations
ALTER TABLE nutrivibe_registrations ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE CASCADE;

-- Add event_id column to nutrivibe_pricing
ALTER TABLE nutrivibe_pricing ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE CASCADE;

-- Add event_id column to nutrivibe_interest_areas
ALTER TABLE nutrivibe_interest_areas ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE CASCADE;

-- Add event_id column to nutrivibe_settings (if we keep this table)
ALTER TABLE nutrivibe_settings ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE CASCADE;

-- Add indexes for foreign key relationships
CREATE INDEX IF NOT EXISTS idx_nutrivibe_registrations_event_id ON nutrivibe_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_nutrivibe_pricing_event_id ON nutrivibe_pricing(event_id);
CREATE INDEX IF NOT EXISTS idx_nutrivibe_interest_areas_event_id ON nutrivibe_interest_areas(event_id);
CREATE INDEX IF NOT EXISTS idx_nutrivibe_settings_event_id ON nutrivibe_settings(event_id);

-- Update unique constraint on pricing to include event_id
ALTER TABLE nutrivibe_pricing DROP CONSTRAINT IF EXISTS nutrivibe_pricing_participation_type_key;
ALTER TABLE nutrivibe_pricing ADD CONSTRAINT nutrivibe_pricing_event_participation_unique 
  UNIQUE (event_id, participation_type);

-- ============================================================================
-- STEP 3: Create NutriVibe Event Record
-- ============================================================================

-- Insert NutriVibe as an event in the events table
INSERT INTO events (
  title,
  description,
  event_date,
  event_time,
  location,
  venue_details,
  additional_info,
  status,
  max_attendees,
  current_attendees,
  has_internal_registration,
  registration_type,
  requires_payment,
  registration_deadline,
  terms_and_conditions,
  is_featured,
  organizer_name,
  organizer_contact,
  featured_image_url
) VALUES (
  'The NutriVibe Session',
  'Join us for an exclusive networking event designed for nutrition professionals, healthcare practitioners, and students. The NutriVibe Session brings together industry leaders, innovators, and passionate individuals in the nutrition and wellness space for a day of meaningful connections, knowledge sharing, and professional development.',
  '2026-11-08',
  '09:00:00',
  'Radisson Blu Hotel Nairobi',
  'Upper Hill, Nairobi, Kenya. The event will be held in the Grand Ballroom on the 5th floor. Parking is available on-site.',
  'Registration includes access to all sessions, networking lunch, event materials, and a certificate of attendance. Business attire recommended.',
  'upcoming',
  200,
  0,
  true,
  'internal',
  true,
  '2026-11-01 23:59:59',
  'By registering for this event, you agree to our terms and conditions. Full payment is required to secure your spot. Refunds are available up to 7 days before the event. Please bring a valid ID for check-in.',
  true,
  'Oncotrition Events Team',
  'events@oncotrition.com',
  '/images/events/nutrivibe-session.jpg'
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 4: Link Existing NutriVibe Data to the Event
-- ============================================================================

-- Get the NutriVibe event ID and update existing data
DO $$
DECLARE
  nutrivibe_event_id UUID;
BEGIN
  -- Get the NutriVibe event ID
  SELECT id INTO nutrivibe_event_id 
  FROM events 
  WHERE title = 'The NutriVibe Session' 
  AND has_internal_registration = true
  LIMIT 1;
  
  -- Only proceed if we found the event
  IF nutrivibe_event_id IS NOT NULL THEN
    -- Update existing pricing to link to NutriVibe event
    UPDATE nutrivibe_pricing 
    SET event_id = nutrivibe_event_id 
    WHERE event_id IS NULL;
    
    RAISE NOTICE 'Updated % pricing records', (SELECT COUNT(*) FROM nutrivibe_pricing WHERE event_id = nutrivibe_event_id);
    
    -- Update existing interest areas to link to NutriVibe event
    UPDATE nutrivibe_interest_areas 
    SET event_id = nutrivibe_event_id 
    WHERE event_id IS NULL;
    
    RAISE NOTICE 'Updated % interest area records', (SELECT COUNT(*) FROM nutrivibe_interest_areas WHERE event_id = nutrivibe_event_id);
    
    -- Update existing settings to link to NutriVibe event
    UPDATE nutrivibe_settings 
    SET event_id = nutrivibe_event_id 
    WHERE event_id IS NULL;
    
    RAISE NOTICE 'Updated % settings records', (SELECT COUNT(*) FROM nutrivibe_settings WHERE event_id = nutrivibe_event_id);
    
    -- Log success
    RAISE NOTICE 'Successfully linked all NutriVibe data to event ID: %', nutrivibe_event_id;
  ELSE
    RAISE EXCEPTION 'Could not find NutriVibe event. Please check the INSERT statement.';
  END IF;
END $$;

-- ============================================================================
-- STEP 5: Update RLS Policies (if needed)
-- ============================================================================

-- The existing RLS policies should still work, but let's ensure they're optimal

-- Drop and recreate pricing policy to be more explicit
DROP POLICY IF EXISTS "Public can view active pricing" ON nutrivibe_pricing;
CREATE POLICY "Public can view active event pricing"
  ON nutrivibe_pricing FOR SELECT
  USING (is_active = true);

-- Drop and recreate interest areas policy
DROP POLICY IF EXISTS "Public can view active interest areas" ON nutrivibe_interest_areas;
CREATE POLICY "Public can view active event interest areas"
  ON nutrivibe_interest_areas FOR SELECT
  USING (is_active = true);

-- Registration policies remain the same (already secure)

-- ============================================================================
-- STEP 6: Add Helper Functions (Optional but Useful)
-- ============================================================================

-- Function to get event registration statistics
CREATE OR REPLACE FUNCTION get_event_registration_stats(p_event_id UUID)
RETURNS TABLE (
  total_registrations BIGINT,
  completed_registrations BIGINT,
  pending_registrations BIGINT,
  total_revenue DECIMAL,
  checked_in_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_registrations,
    COUNT(*) FILTER (WHERE payment_status = 'completed')::BIGINT as completed_registrations,
    COUNT(*) FILTER (WHERE payment_status = 'pending')::BIGINT as pending_registrations,
    COALESCE(SUM(price_amount) FILTER (WHERE payment_status = 'completed'), 0) as total_revenue,
    COUNT(*) FILTER (WHERE checked_in = true)::BIGINT as checked_in_count
  FROM nutrivibe_registrations
  WHERE event_id = p_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update event current_attendees count
CREATE OR REPLACE FUNCTION update_event_attendees_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the events table with current count of completed registrations
  UPDATE events
  SET current_attendees = (
    SELECT COUNT(*)
    FROM nutrivibe_registrations
    WHERE event_id = NEW.event_id
    AND payment_status = 'completed'
  )
  WHERE id = NEW.event_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update attendee count
DROP TRIGGER IF EXISTS trigger_update_event_attendees ON nutrivibe_registrations;
CREATE TRIGGER trigger_update_event_attendees
  AFTER INSERT OR UPDATE OF payment_status ON nutrivibe_registrations
  FOR EACH ROW
  WHEN (NEW.payment_status = 'completed')
  EXECUTE FUNCTION update_event_attendees_count();

-- ============================================================================
-- STEP 7: Verification Queries
-- ============================================================================

-- Verify the migration was successful
DO $$
DECLARE
  event_count INTEGER;
  pricing_count INTEGER;
  interest_count INTEGER;
BEGIN
  -- Check if NutriVibe event exists
  SELECT COUNT(*) INTO event_count
  FROM events
  WHERE title = 'The NutriVibe Session' AND has_internal_registration = true;
  
  IF event_count = 0 THEN
    RAISE EXCEPTION 'NutriVibe event was not created!';
  END IF;
  
  -- Check if pricing is linked
  SELECT COUNT(*) INTO pricing_count
  FROM nutrivibe_pricing
  WHERE event_id IS NOT NULL;
  
  IF pricing_count = 0 THEN
    RAISE WARNING 'No pricing records are linked to events!';
  END IF;
  
  -- Check if interest areas are linked
  SELECT COUNT(*) INTO interest_count
  FROM nutrivibe_interest_areas
  WHERE event_id IS NOT NULL;
  
  IF interest_count = 0 THEN
    RAISE WARNING 'No interest area records are linked to events!';
  END IF;
  
  -- Success message
  RAISE NOTICE '✓ Migration completed successfully!';
  RAISE NOTICE '✓ Events with registration: %', event_count;
  RAISE NOTICE '✓ Pricing records linked: %', pricing_count;
  RAISE NOTICE '✓ Interest areas linked: %', interest_count;
END $$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Summary of changes:
-- 1. ✓ Extended events table with registration fields
-- 2. ✓ Added event_id to nutrivibe tables
-- 3. ✓ Created NutriVibe event record
-- 4. ✓ Linked existing nutrivibe data to event
-- 5. ✓ Updated RLS policies
-- 6. ✓ Added helper functions and triggers
-- 7. ✓ Verified migration success

-- Next steps:
-- 1. Update TypeScript types
-- 2. Create event-specific API routes
-- 3. Update UI components
-- 4. Test registration flow
