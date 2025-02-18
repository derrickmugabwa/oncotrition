-- Create the navigation_items table
create table if not exists public.navigation_items (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    href text not null,
    "order" integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table public.navigation_items enable row level security;

-- Allow authenticated users to read navigation items
create policy "Allow authenticated users to read navigation items"
    on public.navigation_items
    for select
    to authenticated
    using (true);

-- Allow authenticated users with admin role to manage navigation items
create policy "Allow admin users to manage navigation items"
    on public.navigation_items
    for all
    to authenticated
    using (auth.jwt() ->> 'role' = 'admin')
    with check (auth.jwt() ->> 'role' = 'admin');

-- Create trigger to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger set_updated_at
    before update on public.navigation_items
    for each row
    execute function public.handle_updated_at();
