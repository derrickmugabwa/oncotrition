create table if not exists homepage_components (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  component_key text not null unique,
  is_visible boolean default true,
  display_order integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert default components
insert into homepage_components (name, component_key, is_visible, display_order) values
  ('Hero Slider', 'hero-slider', true, 0),
  ('Features', 'features', true, 1),
  ('Statistics', 'statistics', true, 2),
  ('Brand Slider', 'brand-slider', true, 3),
  ('Homepage Mentorship', 'homepage-mentorship', true, 4),
  ('Homepage Smartspoon', 'homepage-smartspoon', true, 5),
  ('Testimonials', 'testimonials', true, 6)
on conflict (component_key) do nothing;
