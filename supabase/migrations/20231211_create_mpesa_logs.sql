create table if not exists public.mpesa_logs (
    id uuid default gen_random_uuid() primary key,
    message text not null,
    type text not null default 'info',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Enable RLS
alter table public.mpesa_logs enable row level security;

-- Create policy to allow service role to insert
create policy "Enable insert for service role only" on public.mpesa_logs
    for insert
    to service_role
    with check (true);

-- Create policy to allow authenticated users to view logs
create policy "Enable read access for authenticated users" on public.mpesa_logs
    for select
    to authenticated
    using (true);

-- Add indexes
create index if not exists mpesa_logs_created_at_idx on public.mpesa_logs(created_at desc);
create index if not exists mpesa_logs_type_idx on public.mpesa_logs(type);

-- Add function to auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger set_updated_at
    before update on public.mpesa_logs
    for each row
    execute procedure public.handle_updated_at();
