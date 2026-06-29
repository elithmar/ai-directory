-- Create tools table
create table public.tools (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  name text not null,
  description text not null,
  affiliate_link text not null,
  constraint tools_pkey primary key (id)
);

-- Set up Row Level Security (RLS)
alter table public.tools enable row level security;

-- Allow public read access
create policy "Allow public read access on tools" on public.tools
  for select using (true);
