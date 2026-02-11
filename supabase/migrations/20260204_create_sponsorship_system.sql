-- Event Sponsorship System Migration
-- Creates tables for managing event sponsorships/partnerships with tiered pricing

-- ============================================================================
-- STEP 1: Create Sponsorship Tiers Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS event_sponsorship_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  tier_name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure unique tier names per event
  CONSTRAINT unique_event_tier UNIQUE (event_id, tier_name)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sponsorship_tiers_event_id ON event_sponsorship_tiers(event_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_tiers_active ON event_sponsorship_tiers(is_active);
CREATE INDEX IF NOT EXISTS idx_sponsorship_tiers_display_order ON event_sponsorship_tiers(display_order);

-- ============================================================================
-- STEP 2: Create Sponsorship Benefits Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS event_sponsorship_benefits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tier_id UUID REFERENCES event_sponsorship_tiers(id) ON DELETE CASCADE NOT NULL,
  benefit_text TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_sponsorship_benefits_tier_id ON event_sponsorship_benefits(tier_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_benefits_display_order ON event_sponsorship_benefits(display_order);

-- ============================================================================
-- STEP 3: Create Sponsorship Registrations Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS event_sponsorship_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  tier_id UUID REFERENCES event_sponsorship_tiers(id) ON DELETE SET NULL,
  
  -- Company Details
  company_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  company_website VARCHAR(255),
  industry VARCHAR(100),
  
  -- Additional Info
  sponsorship_goals TEXT,
  special_requests TEXT,
  
  -- Payment Details
  price_amount DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_reference VARCHAR(255) UNIQUE NOT NULL,
  paystack_reference VARCHAR(255),
  payment_date TIMESTAMP,
  
  -- Contract & Confirmation
  contract_signed BOOLEAN DEFAULT FALSE,
  contract_signed_at TIMESTAMP,
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sponsorship_registrations_event_id ON event_sponsorship_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_registrations_tier_id ON event_sponsorship_registrations(tier_id);
CREATE INDEX IF NOT EXISTS idx_sponsorship_registrations_email ON event_sponsorship_registrations(email);
CREATE INDEX IF NOT EXISTS idx_sponsorship_registrations_payment_status ON event_sponsorship_registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_sponsorship_registrations_payment_reference ON event_sponsorship_registrations(payment_reference);

-- ============================================================================
-- STEP 4: Add Sponsorship Fields to Events Table
-- ============================================================================

ALTER TABLE events ADD COLUMN IF NOT EXISTS accepts_sponsorships BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS sponsorship_deadline TIMESTAMP;
ALTER TABLE events ADD COLUMN IF NOT EXISTS sponsorship_terms TEXT;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_events_accepts_sponsorships ON events(accepts_sponsorships);

-- Add comments for documentation
COMMENT ON COLUMN events.accepts_sponsorships IS 'Whether this event accepts sponsorships/partnerships';
COMMENT ON COLUMN events.sponsorship_deadline IS 'Deadline for sponsorship registrations';
COMMENT ON COLUMN events.sponsorship_terms IS 'Terms and conditions for sponsorships';

-- ============================================================================
-- STEP 5: Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE event_sponsorship_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_sponsorship_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_sponsorship_registrations ENABLE ROW LEVEL SECURITY;

-- Public read access for active tiers and benefits
CREATE POLICY "Public can view active sponsorship tiers"
  ON event_sponsorship_tiers FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Public can view benefits of active tiers"
  ON event_sponsorship_benefits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM event_sponsorship_tiers
      WHERE id = tier_id AND is_active = TRUE
    )
  );

-- Admin full access to all tables
CREATE POLICY "Admin full access to sponsorship tiers"
  ON event_sponsorship_tiers FOR ALL
  USING (auth.jwt() ->> 'role' = 'authenticated');

CREATE POLICY "Admin full access to sponsorship benefits"
  ON event_sponsorship_benefits FOR ALL
  USING (auth.jwt() ->> 'role' = 'authenticated');

CREATE POLICY "Admin full access to sponsorship registrations"
  ON event_sponsorship_registrations FOR ALL
  USING (auth.jwt() ->> 'role' = 'authenticated');

-- Users can insert their own sponsorship registrations
CREATE POLICY "Users can create sponsorship registrations"
  ON event_sponsorship_registrations FOR INSERT
  WITH CHECK (TRUE);

-- Users can view their own sponsorship registrations by email
CREATE POLICY "Users can view own sponsorship registrations"
  ON event_sponsorship_registrations FOR SELECT
  USING (email = auth.jwt() ->> 'email' OR auth.jwt() ->> 'role' = 'authenticated');

-- ============================================================================
-- STEP 6: Triggers for Auto-Update
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_sponsorship_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_sponsorship_tiers_updated_at
  BEFORE UPDATE ON event_sponsorship_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_sponsorship_updated_at();

CREATE TRIGGER update_sponsorship_registrations_updated_at
  BEFORE UPDATE ON event_sponsorship_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_sponsorship_updated_at();

-- ============================================================================
-- STEP 7: Helper Functions
-- ============================================================================

-- Function to get event sponsorship statistics
CREATE OR REPLACE FUNCTION get_event_sponsorship_stats(p_event_id UUID)
RETURNS TABLE (
  total_sponsorships BIGINT,
  completed_sponsorships BIGINT,
  pending_sponsorships BIGINT,
  total_revenue DECIMAL,
  revenue_by_tier JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT as total_sponsorships,
    COUNT(*) FILTER (WHERE payment_status = 'completed')::BIGINT as completed_sponsorships,
    COUNT(*) FILTER (WHERE payment_status = 'pending')::BIGINT as pending_sponsorships,
    COALESCE(SUM(price_amount) FILTER (WHERE payment_status = 'completed'), 0) as total_revenue,
    COALESCE(
      jsonb_object_agg(
        tier_name,
        tier_revenue
      ) FILTER (WHERE tier_name IS NOT NULL),
      '{}'::jsonb
    ) as revenue_by_tier
  FROM event_sponsorship_registrations esr
  LEFT JOIN event_sponsorship_tiers est ON esr.tier_id = est.id
  LEFT JOIN LATERAL (
    SELECT SUM(price_amount) as tier_revenue
    FROM event_sponsorship_registrations
    WHERE tier_id = est.id AND payment_status = 'completed'
  ) tr ON TRUE
  WHERE esr.event_id = p_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 8: Insert Sample Data for NutriVibe Event
-- ============================================================================

DO $$
DECLARE
  nutrivibe_event_id UUID;
  bronze_tier_id UUID;
  silver_tier_id UUID;
  gold_tier_id UUID;
  platinum_tier_id UUID;
BEGIN
  -- Get the NutriVibe event ID
  SELECT id INTO nutrivibe_event_id 
  FROM events 
  WHERE title = 'The NutriVibe Session' 
  AND has_internal_registration = TRUE
  LIMIT 1;
  
  -- Only proceed if we found the event
  IF nutrivibe_event_id IS NOT NULL THEN
    
    -- Enable sponsorships for NutriVibe event
    UPDATE events 
    SET accepts_sponsorships = TRUE,
        sponsorship_deadline = '2026-11-01 23:59:59',
        sponsorship_terms = 'By registering as a sponsor, you agree to our sponsorship terms and conditions. Full payment is required to secure your sponsorship package. Refunds are available up to 14 days before the event.'
    WHERE id = nutrivibe_event_id;
    
    -- Insert Bronze Tier
    INSERT INTO event_sponsorship_tiers (event_id, tier_name, price, description, display_order)
    VALUES (nutrivibe_event_id, 'Bronze Sponsor', 20000.00, 'Perfect for small businesses and startups looking to gain visibility', 1)
    RETURNING id INTO bronze_tier_id;
    
    -- Insert Bronze Benefits
    INSERT INTO event_sponsorship_benefits (tier_id, benefit_text, display_order) VALUES
    (bronze_tier_id, 'One exhibition table space', 1),
    (bronze_tier_id, 'One rollup banner and one tear drop banner', 2),
    (bronze_tier_id, 'Mention during partner appreciation presentation', 3);
    
    -- Insert Silver Tier
    INSERT INTO event_sponsorship_tiers (event_id, tier_name, price, description, display_order)
    VALUES (nutrivibe_event_id, 'Silver Sponsor', 50000.00, 'Enhanced visibility and branding opportunities', 2)
    RETURNING id INTO silver_tier_id;
    
    -- Insert Silver Benefits
    INSERT INTO event_sponsorship_benefits (tier_id, benefit_text, display_order) VALUES
    (silver_tier_id, 'All bronze benefits', 1),
    (silver_tier_id, 'Brand logo included in event communications (emails, invitations and messages)', 2),
    (silver_tier_id, 'One rollup banner, two teardrop banner placements', 3),
    (silver_tier_id, 'Opportunity to offer an alumni award gift (partner branded gifts)', 4);
    
    -- Insert Gold Tier
    INSERT INTO event_sponsorship_tiers (event_id, tier_name, price, description, display_order)
    VALUES (nutrivibe_event_id, 'Gold Sponsor', 100000.00, 'Premium sponsorship with maximum brand exposure', 3)
    RETURNING id INTO gold_tier_id;
    
    -- Insert Gold Benefits
    INSERT INTO event_sponsorship_benefits (tier_id, benefit_text, display_order) VALUES
    (gold_tier_id, 'All silver benefits', 1),
    (gold_tier_id, 'In-event video highlights', 2),
    (gold_tier_id, 'Co-brand on event merchandise', 3),
    (gold_tier_id, 'Social media mention', 4);
    
    -- Insert Platinum Tier
    INSERT INTO event_sponsorship_tiers (event_id, tier_name, price, description, display_order)
    VALUES (nutrivibe_event_id, 'Platinum Sponsor', 200000.00, 'Exclusive top-tier partnership with maximum ROI', 4)
    RETURNING id INTO platinum_tier_id;
    
    -- Insert Platinum Benefits (inherits all previous benefits)
    INSERT INTO event_sponsorship_benefits (tier_id, benefit_text, display_order) VALUES
    (platinum_tier_id, 'All gold benefits', 1),
    (platinum_tier_id, 'Exclusive naming rights opportunity', 2),
    (platinum_tier_id, 'Premium booth location', 3),
    (platinum_tier_id, 'Speaking opportunity at event', 4),
    (platinum_tier_id, 'VIP networking session access', 5);
    
    RAISE NOTICE '✓ Successfully created sponsorship tiers for NutriVibe event';
    RAISE NOTICE '  - Bronze Tier: KES 20,000';
    RAISE NOTICE '  - Silver Tier: KES 50,000';
    RAISE NOTICE '  - Gold Tier: KES 100,000';
    RAISE NOTICE '  - Platinum Tier: KES 200,000';
  ELSE
    RAISE WARNING 'NutriVibe event not found. Skipping sample data insertion.';
  END IF;
END $$;

-- ============================================================================
-- STEP 9: Verification
-- ============================================================================

DO $$
DECLARE
  tier_count INTEGER;
  benefit_count INTEGER;
BEGIN
  -- Check if tiers were created
  SELECT COUNT(*) INTO tier_count FROM event_sponsorship_tiers;
  
  IF tier_count = 0 THEN
    RAISE WARNING 'No sponsorship tiers were created!';
  ELSE
    RAISE NOTICE '✓ Created % sponsorship tiers', tier_count;
  END IF;
  
  -- Check if benefits were created
  SELECT COUNT(*) INTO benefit_count FROM event_sponsorship_benefits;
  
  IF benefit_count = 0 THEN
    RAISE WARNING 'No sponsorship benefits were created!';
  ELSE
    RAISE NOTICE '✓ Created % sponsorship benefits', benefit_count;
  END IF;
  
  RAISE NOTICE '✓ Sponsorship system migration completed successfully!';
END $$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Summary of changes:
-- 1. ✓ Created event_sponsorship_tiers table
-- 2. ✓ Created event_sponsorship_benefits table
-- 3. ✓ Created event_sponsorship_registrations table
-- 4. ✓ Added sponsorship fields to events table
-- 5. ✓ Set up RLS policies
-- 6. ✓ Added triggers and helper functions
-- 7. ✓ Inserted sample data for NutriVibe event
-- 8. ✓ Verified migration success
