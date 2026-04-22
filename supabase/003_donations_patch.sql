create table if not exists public.donations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  charity_id uuid not null references public.charities(id) on delete restrict,
  donor_name text not null,
  donor_email text not null,
  amount_pence int not null check (amount_pence > 0),
  currency text not null default 'INR',
  status text not null default 'pending',
  dodo_payment_id text unique,
  dodo_customer_id text,
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.donations enable row level security;

drop policy if exists "donations: owner read" on public.donations;
create policy "donations: owner read"
on public.donations
for select
using (auth.uid() = user_id);

drop policy if exists "donations: admin all" on public.donations;
create policy "donations: admin all"
on public.donations
for all
using (is_admin())
with check (is_admin());

grant select on public.donations to authenticated;
grant all privileges on public.donations to service_role;

drop trigger if exists trg_donations_updated on public.donations;
create trigger trg_donations_updated
before update on public.donations
for each row execute function set_updated_at();
