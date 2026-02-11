-- Create event_images table for multiple images per event
-- This allows events to have image galleries/sliders

CREATE TABLE IF NOT EXISTS event_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_event_images_event_id ON event_images(event_id);
CREATE INDEX idx_event_images_display_order ON event_images(display_order);
CREATE INDEX idx_event_images_is_primary ON event_images(is_primary);

-- Create updated_at trigger
CREATE TRIGGER update_event_images_updated_at
  BEFORE UPDATE ON event_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE event_images ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view event images
CREATE POLICY "Event images are viewable by everyone"
  ON event_images
  FOR SELECT
  USING (true);

-- Policy: Only authenticated users (admins) can insert event images
CREATE POLICY "Authenticated users can insert event images"
  ON event_images
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Only authenticated users (admins) can update event images
CREATE POLICY "Authenticated users can update event images"
  ON event_images
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Only authenticated users (admins) can delete event images
CREATE POLICY "Authenticated users can delete event images"
  ON event_images
  FOR DELETE
  TO authenticated
  USING (true);

-- Add comment for documentation
COMMENT ON TABLE event_images IS 'Stores multiple images for events to create image galleries/sliders';
COMMENT ON COLUMN event_images.display_order IS 'Order in which images appear in the slider (0 = first)';
COMMENT ON COLUMN event_images.is_primary IS 'Marks the primary/featured image for the event';
COMMENT ON COLUMN event_images.caption IS 'Optional caption or alt text for the image';
