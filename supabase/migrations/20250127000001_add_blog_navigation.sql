-- Add blog link to navigation
INSERT INTO nav_items (name, href, order, type, description) 
VALUES ('Blog', '/blog', 6, 'link', 'Read our latest articles and insights');

-- Update order of existing items to accommodate blog
UPDATE nav_items SET "order" = "order" + 1 WHERE "order" >= 6 AND name != 'Blog';
