-- Insert initial navigation items
INSERT INTO public.navigation_items (name, href, "order", created_at, updated_at)
VALUES
    ('Home', '/', 0, now(), now()),
    ('About', '/about', 1, now(), now()),
    ('Features', '/features', 2, now(), now()),
    ('Mentorship', '/mentorship', 3, now(), now()),
    ('Contact', '/contact', 4, now(), now()),
    ('Smartspoon', '/smartspoon', 5, now(), now());

-- You can run this to undo the changes if needed:
-- DELETE FROM public.navigation_items WHERE href IN ('/', '/about', '/features', '/mentorship', '/contact', '/smartspoon');
