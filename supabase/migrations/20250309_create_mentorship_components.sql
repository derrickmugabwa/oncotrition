-- Create mentorship_components table if it doesn't exist
CREATE TABLE IF NOT EXISTS mentorship_components (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  component_key TEXT NOT NULL UNIQUE,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for display_order if it doesn't exist
CREATE INDEX IF NOT EXISTS mentorship_components_display_order_idx ON mentorship_components (display_order);

-- Add RLS policies if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'mentorship_components' 
    AND policyname = 'Allow public read access on mentorship_components'
  ) THEN
    ALTER TABLE mentorship_components ENABLE ROW LEVEL SECURITY;

    -- Allow public read access
    CREATE POLICY "Allow public read access on mentorship_components"
      ON mentorship_components
      FOR SELECT
      TO public
      USING (true);

    -- Allow authenticated users to manage components
    CREATE POLICY "Allow authenticated users to manage mentorship_components"
      ON mentorship_components
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Create function to update timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION update_mentorship_components_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating timestamps if it doesn't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_mentorship_components_updated_at'
  ) THEN
    CREATE TRIGGER update_mentorship_components_updated_at
      BEFORE UPDATE ON mentorship_components
      FOR EACH ROW
      EXECUTE FUNCTION update_mentorship_components_updated_at();
  END IF;
END $$;
