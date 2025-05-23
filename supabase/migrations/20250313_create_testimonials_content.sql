-- Create testimonials_content table
CREATE TABLE IF NOT EXISTS testimonials_content (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    title TEXT NOT NULL DEFAULT 'What Our Clients Say',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default content
INSERT INTO testimonials_content (title)
VALUES ('What Our Clients Say')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE testimonials_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON testimonials_content
    FOR SELECT USING (true);

CREATE POLICY "Enable insert/update for authenticated users only" ON testimonials_content
    FOR ALL USING (auth.role() = 'authenticated');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_testimonials_content_updated_at
    BEFORE UPDATE ON testimonials_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
