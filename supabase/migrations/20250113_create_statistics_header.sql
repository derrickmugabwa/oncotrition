-- Create a new table for statistics header content
CREATE TABLE IF NOT EXISTS statistics_header (
    id BIGINT PRIMARY KEY DEFAULT 1,
    heading TEXT NOT NULL DEFAULT 'Our Impact in Numbers',
    paragraph TEXT NOT NULL DEFAULT 'See how we are making a difference in peoples lives through our nutrition platform.',
    CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default row if not exists
INSERT INTO statistics_header (id, heading, paragraph)
VALUES (1, 'Our Impact in Numbers', 'See how we are making a difference in peoples lives through our nutrition platform.')
ON CONFLICT (id) DO NOTHING;
