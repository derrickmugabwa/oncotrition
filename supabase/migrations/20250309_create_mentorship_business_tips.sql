-- Create mentorship_business_tips_content table if it doesn't exist
CREATE TABLE IF NOT EXISTS mentorship_business_tips_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create mentorship_business_tips table if it doesn't exist
CREATE TABLE IF NOT EXISTS mentorship_business_tips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  url TEXT NOT NULL CHECK (url ~ '^https?://'),
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  CONSTRAINT unique_order_index UNIQUE (order_index)
);

-- Create index for order_index if it doesn't exist
CREATE INDEX IF NOT EXISTS mentorship_business_tips_order_index_idx ON mentorship_business_tips (order_index);

-- Add RLS policies if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'mentorship_business_tips_content' 
    AND policyname = 'Allow public read access on mentorship_business_tips_content'
  ) THEN
    ALTER TABLE mentorship_business_tips_content ENABLE ROW LEVEL SECURITY;
    ALTER TABLE mentorship_business_tips ENABLE ROW LEVEL SECURITY;

    -- Allow public read access
    CREATE POLICY IF NOT EXISTS "Allow public read access on mentorship_business_tips_content"
      ON mentorship_business_tips_content
      FOR SELECT
      TO public
      USING (true);

    CREATE POLICY IF NOT EXISTS "Allow public read access on mentorship_business_tips"
      ON mentorship_business_tips
      FOR SELECT
      TO public
      USING (true);

    -- Allow authenticated users to manage content
    CREATE POLICY IF NOT EXISTS "Allow authenticated users to manage mentorship_business_tips_content"
      ON mentorship_business_tips_content
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);

    CREATE POLICY IF NOT EXISTS "Allow authenticated users to manage mentorship_business_tips"
      ON mentorship_business_tips
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Create function to update timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps if they don't exist
DROP TRIGGER IF EXISTS update_mentorship_business_tips_content_updated_at ON mentorship_business_tips_content;
DROP TRIGGER IF EXISTS update_mentorship_business_tips_updated_at ON mentorship_business_tips;

CREATE TRIGGER IF NOT EXISTS update_mentorship_business_tips_content_updated_at
  BEFORE UPDATE ON mentorship_business_tips_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER IF NOT EXISTS update_mentorship_business_tips_updated_at
  BEFORE UPDATE ON mentorship_business_tips
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
