-- Check if the table exists and add missing columns if needed
DO $$ 
BEGIN
  -- Create the table if it doesn't exist
  CREATE TABLE IF NOT EXISTS mentorship_packages (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    features TEXT[] NOT NULL DEFAULT '{}',
    recommended BOOLEAN NOT NULL DEFAULT false,
    gradient TEXT NOT NULL,
    order_number INTEGER NOT NULL,
    duration_type TEXT NOT NULL DEFAULT 'month',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
  );

  -- Add columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentorship_packages' AND column_name = 'order_number') THEN
    ALTER TABLE mentorship_packages ADD COLUMN order_number INTEGER NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentorship_packages' AND column_name = 'duration_type') THEN
    ALTER TABLE mentorship_packages ADD COLUMN duration_type TEXT NOT NULL DEFAULT 'month';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mentorship_packages' AND column_name = 'gradient') THEN
    ALTER TABLE mentorship_packages ADD COLUMN gradient TEXT NOT NULL DEFAULT 'from-blue-400/20 to-indigo-400/20';
  END IF;
END $$;

-- Create index for order_number if it doesn't exist
CREATE INDEX IF NOT EXISTS mentorship_packages_order_number_idx ON mentorship_packages (order_number);

-- Add RLS policies if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'mentorship_packages' 
    AND policyname = 'Allow public read access on mentorship_packages'
  ) THEN
    ALTER TABLE mentorship_packages ENABLE ROW LEVEL SECURITY;

    -- Allow public read access
    CREATE POLICY "Allow public read access on mentorship_packages"
      ON mentorship_packages
      FOR SELECT
      TO public
      USING (true);

    -- Allow authenticated users to manage packages
    CREATE POLICY "Allow authenticated users to manage mentorship_packages"
      ON mentorship_packages
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Create function to update timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION update_mentorship_packages_updated_at()
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
    WHERE tgname = 'update_mentorship_packages_updated_at'
  ) THEN
    CREATE TRIGGER update_mentorship_packages_updated_at
      BEFORE UPDATE ON mentorship_packages
      FOR EACH ROW
      EXECUTE FUNCTION update_mentorship_packages_updated_at();
  END IF;
END $$;
