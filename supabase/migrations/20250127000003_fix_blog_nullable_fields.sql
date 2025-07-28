-- Make author_id and category_id nullable in blog_posts table
-- These fields should be optional since posts can exist without categories or authors

-- The fields are already nullable in the original schema, but let's ensure they handle empty strings properly
-- Add a constraint to prevent empty strings and convert them to NULL

-- Add a function to handle empty string to NULL conversion
CREATE OR REPLACE FUNCTION empty_string_to_null()
RETURNS TRIGGER AS $$
BEGIN
  -- Convert empty strings to NULL for UUID fields
  IF NEW.author_id = '' THEN
    NEW.author_id = NULL;
  END IF;
  
  IF NEW.category_id = '' THEN
    NEW.category_id = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically convert empty strings to NULL
DROP TRIGGER IF EXISTS blog_posts_empty_string_to_null ON blog_posts;
CREATE TRIGGER blog_posts_empty_string_to_null
  BEFORE INSERT OR UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION empty_string_to_null();
