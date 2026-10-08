-- Sizeless schema v1 (backlog item 2).
--
-- Privacy model: a parent can only ever see children they are a guardian of,
-- and data hanging off those children (measurements, shoes). Orders, profile
-- and notification preferences are visible to their own parent only.
-- Row-level security is on for every table. Anything parents cannot write
-- themselves (orders, scan results, shoes, new children) is written by the
-- server with the service role (Shopify webhook, Footprint result handler).

-- Helpers live in a schema the Supabase API does not expose.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

-- Shoe adjustment setting. This is NOT the shoe's colourway.
create type public.setting_colour as enum ('green', 'yellow', 'red');
create type public.guardian_role as enum ('owner', 'co_parent');
create type public.purchase_type as enum ('scan', 'skip_scan');

create function private.set_updated_at() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles: one row per parent, 1:1 with auth.users ("users" in the docs).
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text check (char_length(display_name) <= 100),
  shopify_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- children and who may see them. A child can have several guardians, so a
-- co-parent invite (backlog item 13) needs no schema change.
-- ---------------------------------------------------------------------------
create table public.children (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 60),
  birth_date date check (birth_date > date '2000-01-01'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.child_guardians (
  child_id uuid not null references public.children (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.guardian_role not null default 'owner',
  created_at timestamptz not null default now(),
  primary key (child_id, user_id)
);
create index child_guardians_user_id_idx on public.child_guardians (user_id);

-- ---------------------------------------------------------------------------
-- measurements: foot scan results from Footprint.
-- ---------------------------------------------------------------------------
create table public.measurements (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  footprint_measurement_id text not null unique,
  foot_length_left_mm numeric(5, 1) check (foot_length_left_mm between 50 and 400),
  foot_length_right_mm numeric(5, 1) check (foot_length_right_mm between 50 and 400),
  recommended_size_eu numeric(3, 1) not null check (recommended_size_eu between 10 and 50),
  setting_colour public.setting_colour not null,
  scanned_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index measurements_child_id_idx on public.measurements (child_id, scanned_at desc);

-- ---------------------------------------------------------------------------
-- orders: from the Shopify "order paid" webhook.
-- ---------------------------------------------------------------------------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  shopify_order_id text not null unique,
  shopify_order_number text,
  purchase_type public.purchase_type not null,
  total_minor_units integer check (total_minor_units >= 0),
  currency char(3),
  paid_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index orders_user_id_idx on public.orders (user_id, paid_at desc);

-- ---------------------------------------------------------------------------
-- shoes: each pair bought for a child.
-- ---------------------------------------------------------------------------
create table public.shoes (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  measurement_id uuid references public.measurements (id) on delete set null,
  model text not null check (char_length(model) <= 200),
  size_eu numeric(3, 1) not null check (size_eu between 10 and 50),
  -- Setting the shoe was bought at (adjustment setting, not colourway).
  setting_colour public.setting_colour,
  purchased_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index shoes_child_id_idx on public.shoes (child_id, purchased_at desc);
create index shoes_order_id_idx on public.shoes (order_id);
create index shoes_measurement_id_idx on public.shoes (measurement_id);

-- ---------------------------------------------------------------------------
-- notification_preferences: one row per parent. Service messages (fit checks)
-- and marketing consent are separate. Consent times are set by the database,
-- never by the client.
-- ---------------------------------------------------------------------------
create table public.notification_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  whatsapp_phone text check (whatsapp_phone ~ '^\+[1-9][0-9]{6,14}$'),
  whatsapp_fit_checks boolean not null default false,
  whatsapp_marketing boolean not null default false,
  whatsapp_marketing_consent_at timestamptz,
  email_marketing boolean not null default false,
  email_marketing_consent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function private.stamp_marketing_consent() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.whatsapp_marketing_consent_at = case when new.whatsapp_marketing then now() end;
    new.email_marketing_consent_at = case when new.email_marketing then now() end;
  else
    if new.whatsapp_marketing is distinct from old.whatsapp_marketing then
      new.whatsapp_marketing_consent_at = case when new.whatsapp_marketing then now() end;
    else
      new.whatsapp_marketing_consent_at = old.whatsapp_marketing_consent_at;
    end if;
    if new.email_marketing is distinct from old.email_marketing then
      new.email_marketing_consent_at = case when new.email_marketing then now() end;
    else
      new.email_marketing_consent_at = old.email_marketing_consent_at;
    end if;
  end if;
  return new;
end;
$$;

create trigger notification_preferences_consent
  before insert or update on public.notification_preferences
  for each row execute function private.stamp_marketing_consent();

create trigger profiles_updated_at before update on public.profiles
  for each row execute function private.set_updated_at();
create trigger children_updated_at before update on public.children
  for each row execute function private.set_updated_at();
create trigger notification_preferences_updated_at before update on public.notification_preferences
  for each row execute function private.set_updated_at();

-- A new auth user (first Shopify order, or email-code sign-in) gets a profile
-- and default (all off) notification preferences.
create function private.handle_new_user() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email) values (new.id, coalesce(new.email, ''));
  insert into public.notification_preferences (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- True when the signed-in parent is a guardian of the child. Security definer
-- so policies can call it without recursing into child_guardians' own RLS.
create function private.is_guardian(p_child_id uuid) returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.child_guardians g
    where g.child_id = p_child_id and g.user_id = (select auth.uid())
  )
$$;
revoke all on all functions in schema private from public;
grant execute on function private.is_guardian(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Privileges. Supabase grants everything to anon and authenticated by
-- default; take it all back and grant only what parents need. RLS then
-- limits which rows those grants reach.
-- ---------------------------------------------------------------------------
revoke all on public.profiles, public.children, public.child_guardians, public.measurements,
  public.orders, public.shoes, public.notification_preferences
  from anon, authenticated;

grant select on public.profiles, public.children, public.child_guardians, public.measurements,
  public.orders, public.shoes, public.notification_preferences
  to authenticated;
grant update (display_name) on public.profiles to authenticated;
grant update (name, birth_date) on public.children to authenticated;
grant update (whatsapp_phone, whatsapp_fit_checks, whatsapp_marketing, email_marketing)
  on public.notification_preferences to authenticated;

grant all on public.profiles, public.children, public.child_guardians, public.measurements,
  public.orders, public.shoes, public.notification_preferences
  to service_role;

-- ---------------------------------------------------------------------------
-- Row-level security on every table.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.children enable row level security;
alter table public.child_guardians enable row level security;
alter table public.measurements enable row level security;
alter table public.orders enable row level security;
alter table public.shoes enable row level security;
alter table public.notification_preferences enable row level security;

create policy "Parents read their own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "Parents update their own profile" on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "Guardians read their children" on public.children
  for select to authenticated using (private.is_guardian(id));
create policy "Guardians update their children" on public.children
  for update to authenticated
  using (private.is_guardian(id)) with check (private.is_guardian(id));

create policy "Guardians see who else looks after their children" on public.child_guardians
  for select to authenticated using (private.is_guardian(child_id));

create policy "Guardians read their children's measurements" on public.measurements
  for select to authenticated using (private.is_guardian(child_id));

create policy "Parents read their own orders" on public.orders
  for select to authenticated using (user_id = (select auth.uid()));

create policy "Guardians read their children's shoes" on public.shoes
  for select to authenticated using (private.is_guardian(child_id));

create policy "Parents read their own notification preferences" on public.notification_preferences
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Parents update their own notification preferences" on public.notification_preferences
  for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
