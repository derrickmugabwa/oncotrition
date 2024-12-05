-- Create handle_updated_at function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql security definer;

-- Create contact information table
create table if not exists public.contact_info (
    id bigint primary key generated always as identity,
    title varchar not null,
    description text,
    email varchar,
    phone varchar,
    address text,
    social_links jsonb default '{}',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add comment to the table
comment on table public.contact_info is 'Stores contact information displayed on the contact page';

-- Create updated_at trigger
create trigger handle_updated_at
    before update on public.contact_info
    for each row
    execute function public.handle_updated_at();

-- Enable Row Level Security
alter table public.contact_info enable row level security;

-- Create policies
create policy "Enable read access for all users"
    on public.contact_info
    for select
    to public
    using (true);

create policy "Enable insert/update/delete for authenticated users only"
    on public.contact_info
    for all
    using (auth.role() = 'authenticated')
    with check (auth.role() = 'authenticated');

-- Insert default contact information
insert into public.contact_info (
    title,
    description,
    email,
    phone,
    address,
    social_links
) values (
    'Get in Touch',
    'Have questions about our nutrition services? We''d love to hear from you. Send us a message and we''ll respond as soon as possible.',
    'contact@example.com',
    '+1 (555) 123-4567',
    '123 Nutrition Street, Health City, HC 12345',
    '{
        "facebook": "https://facebook.com/nutritionwebsite",
        "instagram": "https://instagram.com/nutritionwebsite",
        "twitter": "https://twitter.com/nutritionwebsite"
    }'::jsonb
) on conflict do nothing;
