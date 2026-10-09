-- consent_log: parents read only their own rows, nobody but the server writes, rows never change.
\set ON_ERROR_STOP on

insert into auth.users (id, email) values
  ('cccccccc-0000-0000-0000-000000000001', 'c1@example.com'),
  ('cccccccc-0000-0000-0000-000000000002', 'c2@example.com');

set role service_role;
insert into public.consent_log (user_id, channel, purpose, action, contact, text_version, source) values
  ('cccccccc-0000-0000-0000-000000000001', 'whatsapp', 'fit_checks', 'requested', '+4915112345678', 'v1', 's10'),
  ('cccccccc-0000-0000-0000-000000000002', 'email', 'marketing', 'requested', 'x@example.com', 'v1', 's10');
select tests.check((select count(*) from public.consent_log) = 2, 'the server can log consent');
select tests.refused($$update public.consent_log set action = 'withdrawn'$$, 'a logged consent can never be changed');
reset role;

select tests.as_user('cccccccc-0000-0000-0000-000000000001');
select tests.check((select count(*) from public.consent_log) = 1, 'a parent sees only their own consent rows');
select tests.refused($$insert into public.consent_log (user_id, channel, purpose, action, contact, text_version, source) values ('cccccccc-0000-0000-0000-000000000001', 'email', 'marketing', 'confirmed', 'a@b.de', 'v1', 's10')$$, 'a parent cannot write consent rows');
select tests.refused($$delete from public.consent_log$$, 'a parent cannot delete consent rows');
select tests.as_anon();
select tests.refused($$select count(*) from public.consent_log$$, 'an anonymous visitor cannot read consent rows');
reset role;
\echo 'consent_log tests passed.'
