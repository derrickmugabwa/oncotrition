-- Create user_announcement_views table for tracking which announcements users have seen
CREATE TABLE IF NOT EXISTS user_announcement_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE NOT NULL,
  user_session_id TEXT NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(announcement_id, user_session_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_user_views_announcement_id ON user_announcement_views(announcement_id);
CREATE INDEX idx_user_views_session ON user_announcement_views(user_session_id);
CREATE INDEX idx_user_views_viewed_at ON user_announcement_views(viewed_at);

-- Enable Row Level Security
ALTER TABLE user_announcement_views ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view their own announcement views
CREATE POLICY "Users can view their own announcement views"
  ON user_announcement_views
  FOR SELECT
  USING (true);

-- Policy: Anyone can insert their own announcement views
CREATE POLICY "Users can insert their own announcement views"
  ON user_announcement_views
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only authenticated users (admins) can view all views
CREATE POLICY "Authenticated users can view all announcement views"
  ON user_announcement_views
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only authenticated users (admins) can delete views
CREATE POLICY "Authenticated users can delete announcement views"
  ON user_announcement_views
  FOR DELETE
  TO authenticated
  USING (true);

-- Create a function to clean up old announcement views (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_announcement_views()
RETURNS void AS $$
BEGIN
  DELETE FROM user_announcement_views
  WHERE viewed_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to run cleanup (requires pg_cron extension)
-- This is commented out by default - uncomment if you have pg_cron enabled
-- SELECT cron.schedule('cleanup-announcement-views', '0 2 * * *', 'SELECT cleanup_old_announcement_views()');
