-- Create brands_content table if it doesn't exist
DO $$ 
BEGIN
  CREATE TABLE IF NOT EXISTS brands_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL DEFAULT 'Trusted by Leading Brands',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
  );

  -- Add columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brands_content' AND column_name = 'title') THEN
    ALTER TABLE brands_content ADD COLUMN title TEXT NOT NULL DEFAULT 'Trusted by Leading Brands';
  END IF;
END $$;

-- Create brands table if it doesn't exist
DO $$ 
BEGIN
  CREATE TABLE IF NOT EXISTS brands (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT unique_brand_order UNIQUE (order_index)
  );

  -- Add columns if they don't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brands' AND column_name = 'logo_url') THEN
    ALTER TABLE brands ADD COLUMN logo_url TEXT NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'brands' AND column_name = 'order_index') THEN
    ALTER TABLE brands ADD COLUMN order_index INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Create index for order_index if it doesn't exist
CREATE INDEX IF NOT EXISTS brands_order_index_idx ON brands (order_index);

-- Add RLS policies if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'brands_content' 
    AND policyname = 'Allow public read access on brands_content'
  ) THEN
    ALTER TABLE brands_content ENABLE ROW LEVEL SECURITY;
    ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

    -- Allow public read access
    CREATE POLICY "Allow public read access on brands_content"
      ON brands_content
      FOR SELECT
      TO public
      USING (true);

    CREATE POLICY "Allow public read access on brands"
      ON brands
      FOR SELECT
      TO public
      USING (true);

    -- Allow authenticated users to manage content
    CREATE POLICY "Allow authenticated users to manage brands_content"
      ON brands_content
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);

    CREATE POLICY "Allow authenticated users to manage brands"
      ON brands
      FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Create function to update timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION update_brands_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_brands_content_updated_at'
  ) THEN
    CREATE TRIGGER update_brands_content_updated_at
      BEFORE UPDATE ON brands_content
      FOR EACH ROW
      EXECUTE FUNCTION update_brands_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_brands_updated_at'
  ) THEN
    CREATE TRIGGER update_brands_updated_at
      BEFORE UPDATE ON brands
      FOR EACH ROW
      EXECUTE FUNCTION update_brands_updated_at();
  END IF;
END $$;
