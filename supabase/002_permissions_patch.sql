-- Run this on an EXISTING Supabase project after 001_initial.sql
-- if the tables already exist but app reads/writes fail with
-- "permission denied for table ..." errors.

drop policy if exists "profiles: admin all" on public.profiles;
create policy "profiles: admin all"
on public.profiles
for all
using (is_admin())
with check (is_admin());

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
