-- Consent log: proof of every consent and withdrawal (GDPR, §7 UWG). Append-only: rows are only
-- ever added. Written by the server (service role); a parent can read their own rows.
-- notification_preferences stays the quick "what is on right now" view.

create table public.consent_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  channel text not null check (channel in ('whatsapp', 'email')),
  -- fit_checks: fit checks + rescan reminders. marketing: tips and offers.
  purpose text not null check (purpose in ('fit_checks', 'marketing')),
  -- requested: ticked in the app. confirmed: the parent answered JA / clicked the link. withdrawn: stopped.
  action text not null check (action in ('requested', 'confirmed', 'withdrawn')),
  -- Phone number (E.164) or email the consent is for.
  contact text not null check (length(contact) between 5 and 200),
  -- Which consent text the parent saw (see src/features/consent/consent.ts).
  text_version text not null,
  source text not null check (source in ('s10', 'account', 'reply', 'confirm_link', 'stop')),
  created_at timestamptz not null default now()
);
create index consent_log_user_id_idx on public.consent_log (user_id, created_at desc);

create function private.consent_log_append_only() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'consent_log is append-only' using errcode = 'insufficient_privilege';
end;
$$;
create trigger consent_log_no_update before update on public.consent_log
  for each row execute function private.consent_log_append_only();

revoke all on public.consent_log from anon, authenticated;
grant select on public.consent_log to authenticated;
grant select, insert on public.consent_log to service_role;

alter table public.consent_log enable row level security;
create policy "Parents read their own consent log" on public.consent_log
  for select to authenticated using (user_id = (select auth.uid()));
