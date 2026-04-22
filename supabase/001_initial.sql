-- ============================================================
-- Golf & Give — Supabase Schema v1.0
-- Run in Supabase SQL editor (or via supabase db push)
-- ============================================================

-- ─── Extensions ───────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─── ENUMS ────────────────────────────────────────────────────
create type subscription_plan   as enum ('monthly', 'yearly');
create type subscription_status as enum ('active', 'inactive', 'cancelled', 'lapsed');
create type draw_status         as enum ('pending', 'simulation', 'published');
create type draw_logic          as enum ('random', 'algorithmic');
create type payment_status      as enum ('pending', 'paid', 'rejected');
create type user_role           as enum ('subscriber', 'admin');

-- ─── PROFILES ─────────────────────────────────────────────────
-- Extends Supabase auth.users
create table profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  full_name         text not null,
  email             text not null,
  role              user_role not null default 'subscriber',
  avatar_url        text,
  phone             text,
  country           text default 'IN',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table profiles enable row level security;

create or replace function is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

create policy "profiles: owner read"   on profiles for select using (auth.uid() = id);
create policy "profiles: owner insert" on profiles for insert with check (auth.uid() = id);
create policy "profiles: owner update" on profiles for update using (auth.uid() = id);
create policy "profiles: admin all"    on profiles for all using (is_admin()) with check (is_admin());

-- ─── SUBSCRIPTIONS ────────────────────────────────────────────
create table subscriptions (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references profiles(id) on delete cascade,
  plan                subscription_plan not null,
  status              subscription_status not null default 'inactive',
  dodo_subscription_id text unique,          -- DodoPayments subscription ID
  dodo_customer_id    text,
  amount_pence        int not null,           -- plan amount in smallest currency unit
  currency            text not null default 'INR',
  charity_percentage  int not null default 10 check (charity_percentage between 10 and 100),
  selected_charity_id uuid,                   -- FK added after charities table
  current_period_start timestamptz,
  current_period_end   timestamptz,
  cancelled_at         timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

alter table subscriptions enable row level security;

create policy "subs: owner read"  on subscriptions for select using (auth.uid() = user_id);
create policy "subs: admin all"   on subscriptions for all using (is_admin());

-- ─── CHARITIES ────────────────────────────────────────────────
create table charities (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  slug          text unique not null,
  description   text,
  logo_url      text,
  cover_url     text,
  website_url   text,
  is_featured   boolean not null default false,
  is_active     boolean not null default true,
  events        jsonb default '[]',           -- upcoming golf days / events
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table charities enable row level security;

create policy "charities: public read"  on charities for select using (is_active = true);
create policy "charities: admin all"    on charities for all using (is_admin());

-- Add FK now that charities exists
alter table subscriptions
  add constraint fk_subscription_charity
  foreign key (selected_charity_id) references charities(id) on delete set null;

-- ─── GOLF SCORES ──────────────────────────────────────────────
create table golf_scores (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references profiles(id) on delete cascade,
  score       int not null check (score between 1 and 45),   -- Stableford
  score_date  date not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  -- One score per date per user
  unique (user_id, score_date)
);

alter table golf_scores enable row level security;

create policy "scores: owner read"   on golf_scores for select using (auth.uid() = user_id);
create policy "scores: owner insert" on golf_scores for insert with check (auth.uid() = user_id);
create policy "scores: owner update" on golf_scores for update using (auth.uid() = user_id);
create policy "scores: owner delete" on golf_scores for delete using (auth.uid() = user_id);
create policy "scores: admin all"    on golf_scores for all using (is_admin());

-- Rolling 5-score enforcement via trigger
create or replace function enforce_rolling_five_scores()
returns trigger language plpgsql as $$
begin
  -- After insert, delete any scores beyond the 5 most recent
  delete from golf_scores
  where user_id = new.user_id
    and id not in (
      select id from golf_scores
      where user_id = new.user_id
      order by score_date desc
      limit 5
    );
  return new;
end;
$$;

create trigger trg_rolling_five
after insert on golf_scores
for each row execute function enforce_rolling_five_scores();

-- ─── DRAWS ────────────────────────────────────────────────────
create table draws (
  id              uuid primary key default uuid_generate_v4(),
  draw_month      date not null,              -- first day of the month e.g. 2025-04-01
  status          draw_status not null default 'pending',
  logic           draw_logic not null default 'random',
  winning_numbers int[] not null default '{}', -- 5 numbers
  jackpot_amount  numeric(12,2) not null default 0,
  pool_4match     numeric(12,2) not null default 0,
  pool_3match     numeric(12,2) not null default 0,
  jackpot_rolled  boolean not null default false,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (draw_month)
);

alter table draws enable row level security;

create policy "draws: public read published" on draws for select using (status = 'published');
create policy "draws: admin all"             on draws for all using (is_admin());

-- ─── DRAW ENTRIES ─────────────────────────────────────────────
-- Each eligible subscriber gets an entry per draw (generated server-side)
create table draw_entries (
  id          uuid primary key default uuid_generate_v4(),
  draw_id     uuid not null references draws(id) on delete cascade,
  user_id     uuid not null references profiles(id) on delete cascade,
  numbers     int[] not null,          -- user's 5 latest scores at draw time
  match_count int,                     -- 0–5, populated after draw
  prize_tier  text,                    -- '5-match' | '4-match' | '3-match' | null
  created_at  timestamptz not null default now(),
  unique (draw_id, user_id)
);

alter table draw_entries enable row level security;

create policy "entries: owner read" on draw_entries for select using (auth.uid() = user_id);
create policy "entries: admin all"  on draw_entries for all using (is_admin());

-- ─── WINNERS ──────────────────────────────────────────────────
create table winners (
  id              uuid primary key default uuid_generate_v4(),
  draw_id         uuid not null references draws(id),
  user_id         uuid not null references profiles(id),
  draw_entry_id   uuid not null references draw_entries(id),
  prize_tier      text not null,               -- '5-match' | '4-match' | '3-match'
  prize_amount    numeric(12,2) not null,
  payment_status  payment_status not null default 'pending',
  proof_url       text,                        -- uploaded screenshot
  proof_reviewed_at timestamptz,
  admin_notes     text,
  paid_at         timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table winners enable row level security;

create policy "winners: owner read" on winners for select using (auth.uid() = user_id);
create policy "winners: admin all"  on winners for all using (is_admin());

-- ─── CHARITY CONTRIBUTIONS ────────────────────────────────────
create table charity_contributions (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references profiles(id),
  charity_id      uuid not null references charities(id),
  subscription_id uuid not null references subscriptions(id),
  amount          numeric(12,2) not null,
  currency        text not null default 'INR',
  period_start    timestamptz not null,
  period_end      timestamptz not null,
  created_at      timestamptz not null default now()
);

alter table charity_contributions enable row level security;

create policy "contributions: owner read" on charity_contributions for select using (auth.uid() = user_id);
create policy "contributions: admin all"  on charity_contributions for all using (is_admin());

-- ─── DONATIONS (independent / one-time) ──────────────────────
create table donations (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid references profiles(id) on delete set null,
  charity_id      uuid not null references charities(id) on delete restrict,
  donor_name      text not null,
  donor_email     text not null,
  amount_pence    int not null check (amount_pence > 0),
  currency        text not null default 'INR',
  status          text not null default 'pending',
  dodo_payment_id text unique,
  dodo_customer_id text,
  message         text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table donations enable row level security;

create policy "donations: owner read" on donations for select using (auth.uid() = user_id);
create policy "donations: admin all"  on donations for all using (is_admin());

-- ─── PAYMENT EVENTS (audit log) ───────────────────────────────
create table payment_events (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references profiles(id),
  event_type    text not null,          -- 'subscription.created' | 'payment.succeeded' etc.
  provider      text not null default 'dodopayments',
  payload       jsonb not null default '{}',
  processed     boolean not null default false,
  created_at    timestamptz not null default now()
);

alter table payment_events enable row level security;

create policy "payment_events: admin all" on payment_events for all using (is_admin());

-- ─── UPDATED_AT triggers ──────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated       before update on profiles             for each row execute function set_updated_at();
create trigger trg_subscriptions_updated  before update on subscriptions        for each row execute function set_updated_at();
create trigger trg_charities_updated      before update on charities            for each row execute function set_updated_at();
create trigger trg_scores_updated         before update on golf_scores          for each row execute function set_updated_at();
create trigger trg_draws_updated          before update on draws                for each row execute function set_updated_at();
create trigger trg_winners_updated        before update on winners              for each row execute function set_updated_at();
create trigger trg_donations_updated      before update on donations            for each row execute function set_updated_at();

-- ─── NEW USER PROFILE trigger ─────────────────────────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

-- ─── STORAGE BUCKETS ──────────────────────────────────────────
insert into storage.buckets (id, name, public)
values
  ('avatars',       'avatars',       true),
  ('charity-media', 'charity-media', true),
  ('winner-proofs', 'winner-proofs', false)
on conflict (id) do nothing;

-- ─── SEED: Sample charities ───────────────────────────────────
insert into charities (name, slug, description, is_featured) values
  ('Sewa International', 'sewa-international', 'Humanitarian relief and sustainable development across India.', true),
  ('CRY – Child Rights and You', 'cry-india', 'Ensuring happier childhoods and equal opportunities for children.', false),
  ('Akshaya Patra Foundation', 'akshaya-patra', 'Mid-day meal programme reaching millions of school children.', false);

-- ─── GRANTS ───────────────────────────────────────────────────
grant usage on schema public to anon, authenticated, service_role;

grant select on table public.charities to anon;
grant select on table public.draws to anon;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant all privileges on all tables in schema public to service_role;

grant usage, select on all sequences in schema public to authenticated, service_role;
grant execute on all functions in schema public to anon, authenticated, service_role;

alter default privileges in schema public
grant select, insert, update, delete on tables to authenticated;

alter default privileges in schema public
grant all privileges on tables to service_role;

alter default privileges in schema public
grant usage, select on sequences to authenticated, service_role;

alter default privileges in schema public
grant execute on functions to anon, authenticated, service_role;
