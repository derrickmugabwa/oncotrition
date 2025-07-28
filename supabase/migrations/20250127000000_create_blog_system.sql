-- Create blog categories table
CREATE TABLE blog_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for category badges
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog authors table
CREATE TABLE blog_authors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  bio TEXT,
  profile_image_url TEXT,
  social_links JSONB DEFAULT '{}', -- Store social media links
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog posts table
CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  gallery_images JSONB DEFAULT '[]', -- Array of image URLs for gallery
  author_id UUID REFERENCES blog_authors(id) ON DELETE SET NULL,
  category_id UUID REFERENCES blog_categories(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  meta_title VARCHAR(255),
  meta_description TEXT,
  reading_time INTEGER, -- Estimated reading time in minutes
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog post tags table for better tag management
CREATE TABLE blog_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  color VARCHAR(7) DEFAULT '#6B7280',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create junction table for post-tag relationships
CREATE TABLE blog_post_tags (
  post_id UUID REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Create indexes for better performance
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX idx_blog_posts_category_id ON blog_posts(category_id);
CREATE INDEX idx_blog_posts_featured ON blog_posts(is_featured);
CREATE INDEX idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX idx_blog_tags_slug ON blog_tags(slug);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_blog_categories_updated_at BEFORE UPDATE ON blog_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_authors_updated_at BEFORE UPDATE ON blog_authors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO blog_categories (name, slug, description, color) VALUES
('Nutrition Tips', 'nutrition-tips', 'Expert advice on healthy eating and nutrition', '#10B981'),
('Recipes', 'recipes', 'Delicious and healthy recipe ideas', '#F59E0B'),
('Health & Wellness', 'health-wellness', 'General health and wellness topics', '#3B82F6'),
('SmartSpoon Updates', 'smartspoon-updates', 'Latest updates about our SmartSpoon product', '#8B5CF6');

INSERT INTO blog_authors (name, email, bio, profile_image_url) VALUES
('Dr. Sarah Johnson', 'sarah@oncotrition.com', 'Registered Dietitian with 10+ years of experience in clinical nutrition and oncology care.', '/images/authors/dr-sarah.jpg'),
('Mark Thompson', 'mark@oncotrition.com', 'Nutrition researcher and wellness advocate passionate about making healthy eating accessible.', '/images/authors/mark.jpg'),
('Lisa Chen', 'lisa@oncotrition.com', 'Chef and nutritionist specializing in therapeutic cooking and meal planning.', '/images/authors/lisa.jpg');

INSERT INTO blog_tags (name, slug, color) VALUES
('Cancer Care', 'cancer-care', '#EF4444'),
('Healthy Eating', 'healthy-eating', '#10B981'),
('Meal Planning', 'meal-planning', '#F59E0B'),
('Nutrition Science', 'nutrition-science', '#3B82F6'),
('Recipe', 'recipe', '#8B5CF6'),
('Tips', 'tips', '#6B7280'),
('Research', 'research', '#059669'),
('Lifestyle', 'lifestyle', '#7C3AED');

-- Enable Row Level Security
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to published blog posts" ON blog_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Allow public read access to blog categories" ON blog_categories
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to blog authors" ON blog_authors
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to blog tags" ON blog_tags
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to blog post tags" ON blog_post_tags
  FOR SELECT USING (true);

-- Admin policies (you can adjust these based on your auth setup)
CREATE POLICY "Allow admin full access to blog posts" ON blog_posts
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access to blog categories" ON blog_categories
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access to blog authors" ON blog_authors
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access to blog tags" ON blog_tags
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin full access to blog post tags" ON blog_post_tags
  FOR ALL USING (auth.role() = 'authenticated');
