-- Admin-only authentication. No TOTP plaintext or encryption keys enter Postgres.
create table public.admin_authenticators (
  id uuid primary key,
  slot smallint not null unique check (slot between 1 and 3),
  label text not null check (length(label) between 1 and 60),
  encrypted_secret text not null,
  last_step bigint not null,
  created_at timestamptz not null default now()
);
create table public.admin_enrollments (
  token_hash text primary key,
  id uuid not null unique,
  label text not null check (length(label) between 1 and 60),
  encrypted_secret text not null,
  expires_at timestamptz not null default now() + interval '10 minutes'
);
create table public.admin_sessions (
  token_hash text primary key,
  authenticator_id uuid not null references public.admin_authenticators(id) on delete cascade,
  expires_at timestamptz not null default now() + interval '8 hours'
);
create index admin_sessions_authenticator_idx on public.admin_sessions(authenticator_id);
create index admin_sessions_expiry_idx on public.admin_sessions(expires_at);
create index admin_enrollments_expiry_idx on public.admin_enrollments(expires_at);
create table public.admin_auth_limits (
  key text primary key,
  attempts integer not null,
  expires_at timestamptz not null
);
create index admin_auth_limits_expiry_idx on public.admin_auth_limits(expires_at);

alter table public.admin_authenticators enable row level security;
alter table public.admin_enrollments enable row level security;
alter table public.admin_sessions enable row level security;
alter table public.admin_auth_limits enable row level security;
revoke all on public.admin_authenticators, public.admin_enrollments, public.admin_sessions, public.admin_auth_limits from public, anon, authenticated;
grant all on public.admin_authenticators, public.admin_enrollments, public.admin_sessions, public.admin_auth_limits to service_role;

-- All membership changes share this transaction lock. Slot constraints provide a
-- second, independent hard cap even for accidental direct inserts.
create function public.admin_auth_membership_guard() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  perform pg_advisory_xact_lock(782341901);
  if TG_OP = 'DELETE' and (select count(*) from public.admin_authenticators) <= 1 then
    raise exception 'The last authenticator cannot be revoked';
  end if;
  if TG_OP = 'DELETE' then return OLD; end if;
  return NEW;
end;
$$;
revoke all on function public.admin_auth_membership_guard() from public, anon, authenticated;
grant execute on function public.admin_auth_membership_guard() to service_role;
create trigger admin_auth_membership_guard before insert or delete on public.admin_authenticators
for each row execute function public.admin_auth_membership_guard();

-- Called only with a server credential. OTP cryptography happens on the server;
-- confirmation, replay consumption, sessions and revocation are atomic here.
create function public.admin_auth(p_action text, p_data jsonb default '{}') returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare
  pending public.admin_enrollments;
  factor public.admin_authenticators;
  available_slot smallint;
  attempts_used integer;
  result jsonb;
begin
  if p_action = 'limit' then
    delete from public.admin_auth_limits where expires_at <= now();
    insert into public.admin_auth_limits(key, attempts, expires_at)
      values (p_data->>'key', 1, now() + make_interval(secs => (p_data->>'seconds')::integer))
      on conflict (key) do update set attempts = public.admin_auth_limits.attempts + 1
      returning attempts into attempts_used;
    return to_jsonb(attempts_used <= (p_data->>'max')::integer);
  elsif p_action = 'status' then
    return jsonb_build_object('count', (select count(*) from public.admin_authenticators));
  elsif p_action = 'begin' then
    perform pg_advisory_xact_lock(782341901);
    delete from public.admin_enrollments where expires_at <= now() or token_hash = p_data->>'previous';
    if (select count(*) from public.admin_authenticators) >= 3 then return jsonb_build_object('error', 'Enrollment is closed.'); end if;
    insert into public.admin_enrollments(token_hash, id, label, encrypted_secret)
      values (p_data->>'token', (p_data->>'id')::uuid, p_data->>'label', p_data->>'secret');
    return '{}'::jsonb;
  elsif p_action = 'pending' then
    select * into pending from public.admin_enrollments where token_hash = p_data->>'token' and expires_at > now();
    if not found then return 'null'::jsonb; end if;
    return to_jsonb(pending);
  elsif p_action = 'confirm' then
    perform pg_advisory_xact_lock(782341901);
    select * into pending from public.admin_enrollments where token_hash = p_data->>'token' and expires_at > now() for update;
    if not found then return jsonb_build_object('error', 'Enrollment expired. Start again.'); end if;
    select n into available_slot from generate_series(1, 3) n
      where not exists (select 1 from public.admin_authenticators where slot = n) order by n limit 1;
    if available_slot is null then return jsonb_build_object('error', 'Enrollment is closed.'); end if;
    insert into public.admin_authenticators(id, slot, label, encrypted_secret, last_step)
      values (pending.id, available_slot, pending.label, pending.encrypted_secret, (p_data->>'step')::bigint);
    delete from public.admin_enrollments where token_hash = pending.token_hash;
    if (select count(*) from public.admin_authenticators) = 3 then delete from public.admin_enrollments; end if;
    return '{}'::jsonb;
  elsif p_action = 'candidates' then
    select coalesce(jsonb_agg(to_jsonb(a)), '[]') into result from public.admin_authenticators a;
    return result;
  elsif p_action = 'login' then
    perform pg_advisory_xact_lock(782341901);
    update public.admin_authenticators set last_step = (p_data->>'step')::bigint
      where id = (p_data->>'id')::uuid and last_step < (p_data->>'step')::bigint returning * into factor;
    if not found then return jsonb_build_object('error', 'Invalid or already used code.'); end if;
    delete from public.admin_sessions where expires_at <= now() or token_hash = p_data->>'previous';
    insert into public.admin_sessions(token_hash, authenticator_id) values (p_data->>'token', factor.id);
    return '{}'::jsonb;
  elsif p_action = 'session' then
    select jsonb_build_object('id', a.id, 'label', a.label) into result
      from public.admin_sessions s join public.admin_authenticators a on a.id = s.authenticator_id
      where s.token_hash = p_data->>'token' and s.expires_at > now();
    return coalesce(result, 'null'::jsonb);
  elsif p_action = 'logout' then
    delete from public.admin_sessions where token_hash = p_data->>'token';
    return '{}'::jsonb;
  elsif p_action in ('list', 'revoke') then
    perform pg_advisory_xact_lock(782341901);
    if not exists (select 1 from public.admin_sessions where token_hash = p_data->>'token' and expires_at > now()) then
      return jsonb_build_object('error', 'Authentication required.');
    end if;
    if p_action = 'list' then
      select coalesce(jsonb_agg(jsonb_build_object('id', id, 'label', label) order by slot), '[]') into result from public.admin_authenticators;
      return result;
    end if;
    if (select count(*) from public.admin_authenticators) <= 1 then return jsonb_build_object('error', 'The last authenticator cannot be revoked.'); end if;
    delete from public.admin_authenticators where id = (p_data->>'id')::uuid;
    return '{}'::jsonb;
  end if;
  raise exception 'Unknown admin auth action';
end;
$$;
revoke all on function public.admin_auth(text, jsonb) from public, anon, authenticated;
grant execute on function public.admin_auth(text, jsonb) to service_role;

-- Retire the former Supabase-user admin authorization, retaining public reads.
do $$
declare t text;
begin
  foreach t in array array['company_profile', 'founder', 'company_values', 'services', 'sectors', 'job_openings', 'insights', 'testimonials', 'media', 'social_links', 'admins', 'homepage_content'] loop
    execute format('drop policy if exists %I on public.%I', 'admins have full access to ' || t, t);
    execute format('revoke insert, update, delete on public.%I from anon, authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;
end;
$$;
-- Existing media policies call this function. Disable the legacy authority even
-- for old, still-valid Supabase JWTs. Public media read policies are untouched.
create or replace function public.is_admin() returns boolean
language sql stable security invoker set search_path = '' as $$ select false; $$;
