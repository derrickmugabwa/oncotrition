-- Create a table to store the mentorship features section content
CREATE TABLE IF NOT EXISTS mentorship_features_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- No default content inserted

-- Set up Row Level Security
ALTER TABLE mentorship_features_content ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read the content
CREATE POLICY "Anyone can read mentorship_features_content" 
ON mentorship_features_content
FOR SELECT USING (true);

-- Only authenticated users can update the content
CREATE POLICY "Only authenticated users can update mentorship_features_content"
ON mentorship_features_content
FOR UPDATE USING (
  auth.role() = 'authenticated'
);
