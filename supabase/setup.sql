-- Private persistent storage for the application's users, products, orders,
-- and site settings. Run this in Supabase Dashboard > SQL Editor.
create table if not exists public.app_store (
  id text primary key check (id = 'main'),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_store enable row level security;

revoke all on table public.app_store from anon, authenticated;
grant all on table public.app_store to service_role;