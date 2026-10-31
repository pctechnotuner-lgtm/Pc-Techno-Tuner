-- Public customer complaint intake. Admin reads are protected by Supabase Auth.
create table if not exists public.public_complaints (
  id text primary key,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.public_complaints enable row level security;

drop policy if exists "Admins can read public complaints" on public.public_complaints;
create policy "Admins can read public complaints"
on public.public_complaints
for select
to authenticated
using (true);

-- No anon insert/select policy: writes are performed only by the Edge Function
-- using the server-side service role key, which must never be put in the website.
