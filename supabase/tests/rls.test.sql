-- RLS tests: one parent can never see or change another parent's data.
-- Run with `npm run test:db`. Any failed check aborts with an error.

\set ON_ERROR_STOP on

-- ---------------------------------------------------------------------------
-- Test helpers
-- ---------------------------------------------------------------------------
create schema tests;
grant usage on schema tests to anon, authenticated, service_role;

-- Act as a signed-in parent, as an anonymous visitor, or as the server.
create function tests.as_user(p_user uuid) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', p_user, 'role', 'authenticated')::text, false);
  execute 'set role authenticated';
end $$;
create function tests.as_anon() returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, false);
  execute 'set role anon';
end $$;
create function tests.as_owner() returns void language plpgsql as $$
begin
  execute 'reset role';
  perform set_config('request.jwt.claims', '', false);
end $$;

create function tests.check(p_ok boolean, p_msg text) returns void language plpgsql as $$
begin
  if p_ok is distinct from true then
    raise exception 'FAILED: %', p_msg;
  end if;
  raise notice 'ok - %', p_msg;
end $$;

-- Runs SQL and checks it is refused by the database.
create function tests.refused(p_sql text, p_msg text) returns void language plpgsql as $$
begin
  begin
    execute p_sql;
  exception when insufficient_privilege or check_violation or with_check_option_violation then
    raise notice 'ok - % (refused)', p_msg;
    return;
  end;
  raise exception 'FAILED: % (was allowed)', p_msg;
end $$;

-- Runs an UPDATE/DELETE and returns how many rows it touched.
create function tests.rows_changed(p_sql text) returns integer language plpgsql as $$
declare n integer;
begin
  execute p_sql;
  get diagnostics n = row_count;
  return n;
end $$;

grant execute on all functions in schema tests to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Fixtures, written as the server would (table owner, bypasses RLS).
-- Parent A has Mia. Parent B has Ben. Parent C is A's co-parent for Mia.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email) values
  ('aaaaaaaa-0000-0000-0000-000000000000', 'a@example.com'),
  ('bbbbbbbb-0000-0000-0000-000000000000', 'b@example.com'),
  ('cccccccc-0000-0000-0000-000000000000', 'c@example.com');

insert into public.children (id, name, birth_date) values
  ('11111111-0000-0000-0000-000000000000', 'Mia', '2021-03-01'),
  ('22222222-0000-0000-0000-000000000000', 'Ben', '2020-06-15');

insert into public.child_guardians (child_id, user_id, role) values
  ('11111111-0000-0000-0000-000000000000', 'aaaaaaaa-0000-0000-0000-000000000000', 'owner'),
  ('22222222-0000-0000-0000-000000000000', 'bbbbbbbb-0000-0000-0000-000000000000', 'owner'),
  ('11111111-0000-0000-0000-000000000000', 'cccccccc-0000-0000-0000-000000000000', 'co_parent');

insert into public.measurements (child_id, footprint_measurement_id, foot_length_left_mm, foot_length_right_mm, recommended_size_eu, setting_colour, scanned_at) values
  ('11111111-0000-0000-0000-000000000000', 'fp-mia-1', 140.0, 141.5, 24, 'green', now()),
  ('22222222-0000-0000-0000-000000000000', 'fp-ben-1', 160.0, 159.0, 27, 'yellow', now());

insert into public.orders (id, user_id, shopify_order_id, purchase_type, paid_at) values
  ('a0000000-0000-0000-0000-000000000000', 'aaaaaaaa-0000-0000-0000-000000000000', 'shop-a-1', 'scan', now()),
  ('b0000000-0000-0000-0000-000000000000', 'bbbbbbbb-0000-0000-0000-000000000000', 'shop-b-1', 'scan', now());

insert into public.shoes (child_id, order_id, model, size_eu, setting_colour, purchased_at) values
  ('11111111-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000000', 'Explorer', 24, 'green', now()),
  ('22222222-0000-0000-0000-000000000000', 'b0000000-0000-0000-0000-000000000000', 'Explorer', 27, 'yellow', now());

-- ---------------------------------------------------------------------------
-- Every table in public has RLS on (guards future tables too).
-- ---------------------------------------------------------------------------
select tests.check(
  not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
  ),
  'every table in public has row-level security enabled'
);

-- New auth users get a profile and all-off notification preferences.
select tests.check((select count(*) from public.profiles) = 3, 'sign-up creates a profile');
select tests.check(
  (select count(*) from public.notification_preferences
   where not whatsapp_fit_checks and not whatsapp_marketing and not email_marketing) = 3,
  'sign-up creates notification preferences, all off'
);

-- ---------------------------------------------------------------------------
-- Parent A sees only their own data.
-- ---------------------------------------------------------------------------
select tests.as_user('aaaaaaaa-0000-0000-0000-000000000000');

select tests.check((select array_agg(name) from public.children) = array['Mia'], 'A sees only Mia');
select tests.check(
  not exists (select 1 from public.children where id = '22222222-0000-0000-0000-000000000000'),
  'A cannot read Ben by id'
);
select tests.check(
  (select array_agg(footprint_measurement_id) from public.measurements) = array['fp-mia-1'],
  'A sees only Mia''s measurements'
);
select tests.check((select count(*) from public.shoes) = 1
  and (select child_id from public.shoes) = '11111111-0000-0000-0000-000000000000',
  'A sees only Mia''s shoes');
select tests.check((select array_agg(shopify_order_id) from public.orders) = array['shop-a-1'], 'A sees only their own orders');
select tests.check((select array_agg(email) from public.profiles) = array['a@example.com'], 'A sees only their own profile');
select tests.check(
  (select array_agg(user_id) from public.notification_preferences) = array['aaaaaaaa-0000-0000-0000-000000000000'::uuid],
  'A sees only their own notification preferences'
);
select tests.check(
  not exists (select 1 from public.child_guardians where child_id = '22222222-0000-0000-0000-000000000000'),
  'A cannot see who looks after Ben'
);

-- A cannot change B's data: updates silently match no rows.
select tests.check(
  tests.rows_changed($$update public.children set name = 'Hacked' where id = '22222222-0000-0000-0000-000000000000'$$) = 0,
  'A cannot rename Ben'
);
select tests.check(
  tests.rows_changed($$update public.notification_preferences set whatsapp_marketing = true where user_id = 'bbbbbbbb-0000-0000-0000-000000000000'$$) = 0,
  'A cannot change B''s notification preferences'
);
select tests.check(
  tests.rows_changed($$update public.profiles set display_name = 'Hacked' where id = 'bbbbbbbb-0000-0000-0000-000000000000'$$) = 0,
  'A cannot change B''s profile'
);

-- A cannot make themselves a guardian of Ben, or write server-only data.
select tests.refused(
  $$insert into public.child_guardians (child_id, user_id) values ('22222222-0000-0000-0000-000000000000', 'aaaaaaaa-0000-0000-0000-000000000000')$$,
  'A cannot add themselves as Ben''s guardian'
);
select tests.refused(
  $$insert into public.children (name) values ('Fake')$$,
  'A cannot create children directly'
);
select tests.refused(
  $$insert into public.measurements (child_id, footprint_measurement_id, recommended_size_eu, setting_colour, scanned_at) values ('11111111-0000-0000-0000-000000000000', 'fake', 30, 'red', now())$$,
  'A cannot write scan results directly'
);
select tests.refused(
  $$insert into public.orders (user_id, shopify_order_id, purchase_type, paid_at) values ('aaaaaaaa-0000-0000-0000-000000000000', 'fake', 'scan', now())$$,
  'A cannot create orders'
);
select tests.refused(
  $$insert into public.shoes (child_id, model, size_eu, purchased_at) values ('11111111-0000-0000-0000-000000000000', 'Fake', 30, now())$$,
  'A cannot create shoes'
);
select tests.refused(
  $$delete from public.children where id = '11111111-0000-0000-0000-000000000000'$$,
  'A cannot delete children directly (deletion goes through the data-delete flow)'
);
select tests.refused(
  $$update public.profiles set email = 'x@example.com' where id = 'aaaaaaaa-0000-0000-0000-000000000000'$$,
  'A cannot change their own email or Shopify link'
);
select tests.refused(
  $$update public.notification_preferences set whatsapp_marketing_consent_at = now() - interval '1 year' where user_id = 'aaaaaaaa-0000-0000-0000-000000000000'$$,
  'A cannot forge a marketing consent time'
);

-- A can update what they are meant to.
select tests.check(
  tests.rows_changed($$update public.children set name = 'Mia Rose' where id = '11111111-0000-0000-0000-000000000000'$$) = 1,
  'A can rename Mia'
);
select tests.check(
  tests.rows_changed($$update public.notification_preferences set whatsapp_marketing = true where user_id = 'aaaaaaaa-0000-0000-0000-000000000000'$$) = 1,
  'A can opt in to WhatsApp marketing'
);
select tests.check(
  (select whatsapp_marketing_consent_at is not null from public.notification_preferences),
  'opting in records the consent time'
);
select tests.check(
  tests.rows_changed($$update public.notification_preferences set whatsapp_marketing = false where user_id = 'aaaaaaaa-0000-0000-0000-000000000000'$$) = 1,
  'A can opt out of WhatsApp marketing'
);
select tests.check(
  (select whatsapp_marketing_consent_at is null from public.notification_preferences),
  'opting out clears the consent time'
);

-- ---------------------------------------------------------------------------
-- Parent B sees only Ben, and not A's edit target.
-- ---------------------------------------------------------------------------
select tests.as_user('bbbbbbbb-0000-0000-0000-000000000000');
select tests.check((select array_agg(name) from public.children) = array['Ben'], 'B sees only Ben');
select tests.check((select count(*) from public.measurements) = 1, 'B sees only Ben''s measurement');

-- ---------------------------------------------------------------------------
-- Co-parent C sees Mia (shared), not Ben, and not A's orders or profile.
-- ---------------------------------------------------------------------------
select tests.as_user('cccccccc-0000-0000-0000-000000000000');
select tests.check((select array_agg(name) from public.children) = array['Mia Rose'], 'co-parent C sees Mia');
select tests.check((select count(*) from public.child_guardians) = 2, 'C sees both of Mia''s guardians');
select tests.check((select count(*) from public.orders) = 0, 'C cannot see A''s orders');
select tests.check((select count(*) from public.profiles) = 1, 'C sees only their own profile');

-- ---------------------------------------------------------------------------
-- Signed-out visitors get nothing.
-- ---------------------------------------------------------------------------
select tests.as_anon();
select tests.refused($$select * from public.children$$, 'anonymous visitors cannot read children');
select tests.refused($$select * from public.measurements$$, 'anonymous visitors cannot read measurements');
select tests.refused($$select * from public.profiles$$, 'anonymous visitors cannot read profiles');

-- A signed-in session with no matching guardian rows sees nothing.
select tests.as_user('dddddddd-0000-0000-0000-000000000000');
select tests.check((select count(*) from public.children) = 0, 'an unknown user sees no children');

select tests.as_owner();
\echo 'All RLS tests passed.'
