-- Create table for mega menu sections
CREATE TABLE navigation_sections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nav_item_id UUID REFERENCES navigation_items(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    column_index INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add URL support to navigation sections
ALTER TABLE navigation_sections 
ADD COLUMN url TEXT DEFAULT NULL;

-- Update RLS policies
ALTER TABLE navigation_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON navigation_sections
    FOR SELECT USING (true);

CREATE POLICY "Enable insert/update for authenticated users only" ON navigation_sections
    FOR ALL USING (auth.role() = 'authenticated');

-- Create updated_at trigger for navigation_sections
CREATE TRIGGER update_navigation_sections_updated_at
    BEFORE UPDATE ON navigation_sections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
