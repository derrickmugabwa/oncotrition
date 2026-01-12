-- NutriVibe Registration System Tables

-- 1. NutriVibe Pricing Table
CREATE TABLE IF NOT EXISTS nutrivibe_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participation_type VARCHAR(50) UNIQUE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default pricing data
INSERT INTO nutrivibe_pricing (participation_type, price, description, display_order) VALUES
('nutrition_student', 2500.00, 'Nutrition students', 1),
('professional', 6000.00, 'Nutrition/Dietician/Nutritionist', 2),
('healthcare_professional', 6000.00, 'Healthcare Professional/Allied guest', 3),
('institutional_representative', 6000.00, 'Institutional Representative/Partner/Sponsor', 4),
('online_attendee', 6000.00, 'Online attendee', 5)
ON CONFLICT (participation_type) DO NOTHING;

-- 2. NutriVibe Interest Areas Table
CREATE TABLE IF NOT EXISTS nutrivibe_interest_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default interest areas
INSERT INTO nutrivibe_interest_areas (name, display_order) VALUES
('Food Innovation & Product Development', 1),
('Health & Wellness Entrepreneurship', 2),
('Investment & Partnerships', 3),
('Additional Engagement Options', 4)
ON CONFLICT DO NOTHING;

-- 3. NutriVibe Settings Table
CREATE TABLE IF NOT EXISTS nutrivibe_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  location TEXT NOT NULL,
  venue_details TEXT,
  max_capacity INTEGER,
  registration_deadline TIMESTAMP,
  early_bird_deadline TIMESTAMP,
  early_bird_discount DECIMAL(5, 2) DEFAULT 0,
  terms_and_conditions TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default settings
INSERT INTO nutrivibe_settings (event_date, event_time, location, venue_details, max_capacity) VALUES
('2026-11-08', '09:00:00', 'Radisson Blu Hotel Nairobi', 'Upper Hill, Nairobi, Kenya', 200)
ON CONFLICT DO NOTHING;

-- 4. NutriVibe Registrations Table
CREATE TABLE IF NOT EXISTS nutrivibe_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  
  -- Personal Details
  full_name VARCHAR(255) NOT NULL,
  organization VARCHAR(255),
  designation VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  
  -- Participation Type
  participation_type VARCHAR(50) NOT NULL,
  participation_type_other TEXT,
  
  -- Interest Areas (stored as JSON array)
  interest_areas JSONB DEFAULT '[]'::jsonb,
  interest_areas_other TEXT,
  
  -- Networking Purpose
  networking_purpose VARCHAR(100),
  
  -- Payment Details
  price_amount DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_reference VARCHAR(255) UNIQUE,
  paystack_reference VARCHAR(255),
  
  -- QR Code
  qr_code_url TEXT,
  qr_code_data TEXT,
  
  -- Metadata
  registration_date TIMESTAMP DEFAULT NOW(),
  payment_date TIMESTAMP,
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP,
  checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMP,
  checked_in_by UUID,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_nutrivibe_event_id ON nutrivibe_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_nutrivibe_email ON nutrivibe_registrations(email);
CREATE INDEX IF NOT EXISTS idx_nutrivibe_payment_status ON nutrivibe_registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_nutrivibe_payment_reference ON nutrivibe_registrations(payment_reference);
CREATE INDEX IF NOT EXISTS idx_nutrivibe_registration_date ON nutrivibe_registrations(registration_date);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE nutrivibe_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrivibe_interest_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrivibe_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrivibe_registrations ENABLE ROW LEVEL SECURITY;

-- Public read access for pricing, interest areas, and settings
CREATE POLICY "Public can view active pricing"
  ON nutrivibe_pricing FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view active interest areas"
  ON nutrivibe_interest_areas FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view active settings"
  ON nutrivibe_settings FOR SELECT
  USING (is_active = true);

-- Admin full access to all tables
CREATE POLICY "Admin full access to pricing"
  ON nutrivibe_pricing FOR ALL
  USING (auth.jwt() ->> 'role' = 'authenticated');

CREATE POLICY "Admin full access to interest areas"
  ON nutrivibe_interest_areas FOR ALL
  USING (auth.jwt() ->> 'role' = 'authenticated');

CREATE POLICY "Admin full access to settings"
  ON nutrivibe_settings FOR ALL
  USING (auth.jwt() ->> 'role' = 'authenticated');

CREATE POLICY "Admin full access to registrations"
  ON nutrivibe_registrations FOR ALL
  USING (auth.jwt() ->> 'role' = 'authenticated');

-- Users can insert their own registrations
CREATE POLICY "Users can create registrations"
  ON nutrivibe_registrations FOR INSERT
  WITH CHECK (true);

-- Users can view their own registrations by email
CREATE POLICY "Users can view own registrations"
  ON nutrivibe_registrations FOR SELECT
  USING (email = auth.jwt() ->> 'email' OR auth.jwt() ->> 'role' = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_nutrivibe_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_nutrivibe_pricing_updated_at
  BEFORE UPDATE ON nutrivibe_pricing
  FOR EACH ROW
  EXECUTE FUNCTION update_nutrivibe_updated_at();

CREATE TRIGGER update_nutrivibe_settings_updated_at
  BEFORE UPDATE ON nutrivibe_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_nutrivibe_updated_at();

CREATE TRIGGER update_nutrivibe_registrations_updated_at
  BEFORE UPDATE ON nutrivibe_registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_nutrivibe_updated_at();
