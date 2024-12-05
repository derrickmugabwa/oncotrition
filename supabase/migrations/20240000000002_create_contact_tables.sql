-- Create contact_submissions table
create table if not exists public.contact_submissions (
    id bigint primary key generated always as identity,
    name varchar not null,
    email varchar not null,
    subject varchar not null,
    message text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create contact_information table
create table if not exists public.contact_information (
    id bigint primary key generated always as identity,
    type varchar not null,
    value text not null,
    icon varchar not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.contact_submissions enable row level security;
alter table public.contact_information enable row level security;

-- Create policies for contact_submissions
create policy "Enable read access for authenticated users" on public.contact_submissions
    for select using (auth.role() = 'authenticated');

create policy "Enable insert access for all users" on public.contact_submissions
    for insert with check (true);

create policy "Enable delete access for authenticated users" on public.contact_submissions
    for delete using (auth.role() = 'authenticated');

-- Create policies for contact_information
create policy "Enable read access for all users" on public.contact_information
    for select using (true);

create policy "Enable insert/update/delete for authenticated users" on public.contact_information
    for all using (auth.role() = 'authenticated');

-- Create updated_at trigger function if it doesn't exist
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql security definer;

-- Create triggers for updated_at
create trigger handle_updated_at
    before update on public.contact_submissions
    for each row
    execute procedure public.handle_updated_at();

create trigger handle_updated_at
    before update on public.contact_information
    for each row
    execute procedure public.handle_updated_at();

-- Insert sample contact information
insert into public.contact_information (type, value, icon)
values
    ('Email', 'contact@example.com', 'mail'),
    ('Phone', '+1 (555) 123-4567', 'phone'),
    ('Address', '123 Nutrition Street, Health City, HC 12345', 'location-marker'),
    ('Hours', 'Mon-Fri: 9:00 AM - 6:00 PM', 'clock')
on conflict do nothing;
