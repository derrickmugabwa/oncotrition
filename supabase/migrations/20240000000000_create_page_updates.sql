create table if not exists public.page_updates (
    id uuid primary key default uuid_generate_v4(),
    page_name text not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_by text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.page_updates enable row level security;

-- Create policies
create policy "Enable read access for authenticated users" on public.page_updates
    for select
    to authenticated
    using (true);

create policy "Enable insert access for authenticated users" on public.page_updates
    for insert
    to authenticated
    with check (true);

-- Create function to automatically update the updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql security definer;

-- Create trigger to call the function
create trigger set_updated_at
    before update on public.page_updates
    for each row
    execute procedure public.handle_updated_at();
