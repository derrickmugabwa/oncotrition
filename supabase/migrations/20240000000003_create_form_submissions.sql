-- Create contact form submissions table
create table if not exists public.form_submissions (
    id bigint primary key generated always as identity,
    name varchar not null,
    email varchar not null check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    subject varchar not null,
    message text not null,
    status varchar not null default 'unread' check (status in ('unread', 'read', 'archived')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add comment to the table
comment on table public.form_submissions is 'Stores contact form submissions from website visitors';

-- Add comments to columns
comment on column public.form_submissions.id is 'Unique identifier for the submission';
comment on column public.form_submissions.name is 'Name of the person submitting the form';
comment on column public.form_submissions.email is 'Email address of the submitter';
comment on column public.form_submissions.subject is 'Subject of the message';
comment on column public.form_submissions.message is 'Content of the message';
comment on column public.form_submissions.status is 'Status of the submission: unread, read, or archived';
comment on column public.form_submissions.created_at is 'Timestamp when the submission was created';
comment on column public.form_submissions.updated_at is 'Timestamp when the submission was last updated';

-- Create updated_at trigger function
create or replace function public.form_submissions_handle_updated_at()
returns trigger
language plpgsql
security definer
as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$;

-- Create trigger for updated_at
create trigger handle_updated_at
    before update on public.form_submissions
    for each row
    execute function public.form_submissions_handle_updated_at();

-- Create indexes for better query performance
create index if not exists form_submissions_created_at_idx on public.form_submissions (created_at desc);
create index if not exists form_submissions_status_idx on public.form_submissions (status);
create index if not exists form_submissions_email_idx on public.form_submissions (email);

-- Enable Row Level Security (RLS)
alter table public.form_submissions enable row level security;

-- Create policies for form submissions
-- Allow anyone to insert (submit form)
create policy "Enable insert for all users"
    on public.form_submissions
    for insert
    with check (true);

-- Allow authenticated users to view submissions
create policy "Enable read access for authenticated users"
    on public.form_submissions
    for select
    using (auth.role() = 'authenticated');

-- Allow authenticated users to update submissions
create policy "Enable update for authenticated users"
    on public.form_submissions
    for update
    using (auth.role() = 'authenticated');

-- Allow authenticated users to delete submissions
create policy "Enable delete for authenticated users"
    on public.form_submissions
    for delete
    using (auth.role() = 'authenticated');

-- Insert sample data
insert into public.form_submissions (name, email, subject, message, status)
values
    ('John Doe', 'john@example.com', 'General Inquiry', 'Hello, I would like to learn more about your nutrition services.', 'unread'),
    ('Jane Smith', 'jane@example.com', 'Consultation Request', 'I am interested in scheduling a consultation for personalized nutrition advice.', 'unread'),
    ('Mike Johnson', 'mike@example.com', 'Program Question', 'Could you provide more details about your meal planning program?', 'read')
on conflict do nothing;
