-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  location TEXT NOT NULL,
  additional_info TEXT,
  featured_image_url TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  registration_link TEXT,
  organizer_name TEXT,
  organizer_contact TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_featured ON events(is_featured);
CREATE INDEX idx_events_created_at ON events(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view published events
CREATE POLICY "Events are viewable by everyone"
  ON events
  FOR SELECT
  USING (true);

-- Policy: Only authenticated users (admins) can insert events
CREATE POLICY "Authenticated users can insert events"
  ON events
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Only authenticated users (admins) can update events
CREATE POLICY "Authenticated users can update events"
  ON events
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Only authenticated users (admins) can delete events
CREATE POLICY "Authenticated users can delete events"
  ON events
  FOR DELETE
  TO authenticated
  USING (true);

-- Insert sample events for testing
INSERT INTO events (title, description, event_date, event_time, location, additional_info, featured_image_url, status, max_attendees, current_attendees, registration_link, organizer_name, organizer_contact, is_featured)
VALUES
  (
    'Nutrition Workshop: Meal Planning for Cancer Patients',
    'Join our expert nutritionists for an interactive workshop on creating balanced meal plans specifically designed for cancer patients undergoing treatment. Learn about nutrient-dense foods, managing side effects through diet, and practical cooking tips.',
    CURRENT_DATE + INTERVAL '15 days',
    '14:00:00',
    'Oncotrition Center, Nairobi',
    'Please bring a notebook. Light refreshments will be provided. Free parking available.',
    '/images/events/meal-planning-workshop.jpg',
    'upcoming',
    50,
    23,
    'https://forms.gle/example-registration',
    'Dr. Jane Doe',
    'jane@oncotrition.com',
    true
  ),
  (
    'Understanding Nutrition During Chemotherapy',
    'A comprehensive seminar on maintaining proper nutrition during chemotherapy treatment. Topics include managing nausea, food safety, and maintaining strength during treatment.',
    CURRENT_DATE + INTERVAL '30 days',
    '10:00:00',
    'Virtual Event (Zoom)',
    'Zoom link will be sent 24 hours before the event. Q&A session included.',
    '/images/events/chemo-nutrition.jpg',
    'upcoming',
    100,
    45,
    'https://forms.gle/example-registration-2',
    'Dr. John Smith',
    'john@oncotrition.com',
    true
  ),
  (
    'Healthy Cooking Class: Anti-Cancer Recipes',
    'Hands-on cooking class featuring delicious recipes with anti-cancer properties. Learn to prepare nutritious meals that support your health journey.',
    CURRENT_DATE + INTERVAL '45 days',
    '15:30:00',
    'Oncotrition Kitchen, Westlands',
    'All ingredients provided. Aprons available. Limited to 20 participants.',
    '/images/events/cooking-class.jpg',
    'upcoming',
    20,
    12,
    'https://forms.gle/example-registration-3',
    'Chef Mary Williams',
    'mary@oncotrition.com',
    false
  ),
  (
    'Nutrition Support Group Meeting',
    'Monthly support group for cancer patients and caregivers. Share experiences, get advice, and connect with others on similar journeys.',
    CURRENT_DATE + INTERVAL '7 days',
    '18:00:00',
    'Oncotrition Center, Conference Room A',
    'Open to all. No registration required. Refreshments provided.',
    '/images/events/support-group.jpg',
    'upcoming',
    30,
    8,
    null,
    'Sarah Johnson, RN',
    'sarah@oncotrition.com',
    false
  );
