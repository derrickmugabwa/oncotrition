create table if not exists public.homepage_smartspoon (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text default 'Smart Spoon Technology',
  description text default 'Experience the future of nutrition tracking with our innovative smart spoon that helps you make informed dietary decisions in real-time.',
  button_text text default 'Learn More About Smart Spoon',
  button_link text default '/smart-spoon',
  image_url text default '/smartspoon.jpg',
  services jsonb default '[
    {
      "id": 1,
      "title": "Smart Meal Tracking",
      "description": "Automatically track your meals and portions with our intelligent spoon",
      "icon": "ClockIcon"
    },
    {
      "id": 2,
      "title": "Real-time Analytics",
      "description": "Get instant nutritional insights as you eat with advanced sensors",
      "icon": "ChartBarIcon"
    },
    {
      "id": 3,
      "title": "Nutrient Detection",
      "description": "Advanced technology that detects macro and micronutrients in your food",
      "icon": "BeakerIcon"
    },
    {
      "id": 4,
      "title": "Smart Recommendations",
      "description": "Receive personalized dietary suggestions based on your eating habits",
      "icon": "SparklesIcon"
    }
  ]'::jsonb
);

-- Set up Row Level Security (RLS)
alter table public.homepage_smartspoon enable row level security;

-- Create policies
create policy "Enable read access for all users" on public.homepage_smartspoon
  for select using (true);

create policy "Enable insert for authenticated users only" on public.homepage_smartspoon
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users only" on public.homepage_smartspoon
  for update using (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users only" on public.homepage_smartspoon
  for delete using (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Create trigger to automatically update updated_at
create trigger handle_homepage_smartspoon_updated_at
  before update on public.homepage_smartspoon
  for each row
  execute function public.handle_updated_at();
