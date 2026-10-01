-- Shared fixed-window limiter. Only the server's service role can consume it.
create table public.public_intake_limits (
  key text primary key check (length(key) = 64),
  attempts integer not null check (attempts between 1 and 6),
  expires_at timestamptz not null
);
create index public_intake_limits_expiry on public.public_intake_limits(expires_at);
alter table public.public_intake_limits enable row level security;
revoke all on public.public_intake_limits from public, anon, authenticated;
grant select, insert, update, delete on public.public_intake_limits to service_role;

create function public.consume_public_limit(bucket_key text) returns boolean
language plpgsql security invoker set search_path = '' as $$
declare used integer;
begin
  -- Bounded cleanup per request, including idle buckets; no external cron needed.
  delete from public.public_intake_limits where key in (
    select key from public.public_intake_limits where expires_at <= now()
    order by expires_at limit 100 for update skip locked
  );
  insert into public.public_intake_limits as limits (key, attempts, expires_at)
  values (bucket_key, 1, now() + interval '10 minutes')
  on conflict (key) do update set
    attempts = case when limits.expires_at <= now() then 1 else least(limits.attempts + 1, 6) end,
    expires_at = case when limits.expires_at <= now() then now() + interval '10 minutes' else limits.expires_at end
  returning attempts into used;
  return used <= 5;
end;
$$;
revoke all on function public.consume_public_limit(text) from public, anon, authenticated;
grant execute on function public.consume_public_limit(text) to service_role;

-- Consent evidence must be supplied explicitly by the capture flow, never guessed
-- from a database default with a different date. Existing evidence is untouched.
alter table public.newsletter_subscribers alter column consent_version drop default;
revoke all on public.newsletter_subscribers from public, anon, authenticated;
grant select, insert, update, delete on public.newsletter_subscribers to service_role;
