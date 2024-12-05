-- Create the slider_images table
CREATE TABLE IF NOT EXISTS slider_images (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    cta_text TEXT,
    "order" INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create an index on the order column for faster sorting
CREATE INDEX IF NOT EXISTS idx_slider_images_order ON slider_images ("order");

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON slider_images
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Add RLS policies
ALTER TABLE slider_images ENABLE ROW LEVEL SECURITY;

-- Policy for public read access
CREATE POLICY "Allow public read access"
    ON slider_images
    FOR SELECT
    TO public
    USING (true);

-- Policy for authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated users full access"
    ON slider_images
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
