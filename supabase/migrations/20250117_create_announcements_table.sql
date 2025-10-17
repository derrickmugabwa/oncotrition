-- Create announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  announcement_type TEXT DEFAULT 'event' CHECK (announcement_type IN ('event', 'general', 'promotion', 'alert')),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  cta_text TEXT,
  cta_link TEXT,
  image_url TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1,
  display_frequency TEXT DEFAULT 'once' CHECK (display_frequency IN ('once', 'daily', 'always')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_announcements_active ON announcements(is_active);
CREATE INDEX idx_announcements_dates ON announcements(start_date, end_date);
CREATE INDEX idx_announcements_priority ON announcements(priority DESC);
CREATE INDEX idx_announcements_event_id ON announcements(event_id);
CREATE INDEX idx_announcements_type ON announcements(announcement_type);

-- Create updated_at trigger
CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active announcements within date range
CREATE POLICY "Active announcements are viewable by everyone"
  ON announcements
  FOR SELECT
  USING (
    is_active = true 
    AND start_date <= NOW() 
    AND end_date >= NOW()
  );

-- Policy: Only authenticated users (admins) can insert announcements
CREATE POLICY "Authenticated users can insert announcements"
  ON announcements
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Only authenticated users (admins) can update announcements
CREATE POLICY "Authenticated users can update announcements"
  ON announcements
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Only authenticated users (admins) can delete announcements
CREATE POLICY "Authenticated users can delete announcements"
  ON announcements
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert sample announcements for testing
INSERT INTO announcements (title, message, announcement_type, event_id, cta_text, cta_link, image_url, start_date, end_date, is_active, priority, display_frequency)
VALUES
  (
    '🎉 New Workshop Alert!',
    'Join us for an exclusive Nutrition Workshop on meal planning for cancer patients. Limited seats available - register now!',
    'event',
    (SELECT id FROM events WHERE title = 'Nutrition Workshop: Meal Planning for Cancer Patients' LIMIT 1),
    'Register Now',
    '/events',
    '/images/announcements/workshop-promo.jpg',
    NOW(),
    CURRENT_DATE + INTERVAL '14 days',
    true,
    10,
    'daily'
  ),
  (
    '📢 Important Update',
    'Our nutrition consultation services are now available online! Book your virtual session today and get personalized guidance from the comfort of your home.',
    'general',
    null,
    'Learn More',
    '/mentorship',
    '/images/announcements/virtual-consultations.jpg',
    NOW(),
    CURRENT_DATE + INTERVAL '30 days',
    true,
    5,
    'once'
  );
