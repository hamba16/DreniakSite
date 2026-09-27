create table public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_media_id uuid references public.media(id) on delete set null,
  description text not null default '',
  category text not null,
  link text not null default '',
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index partners_logo_media_id_idx
  on public.partners (logo_media_id)
  where logo_media_id is not null;

create index partners_published_order_idx
  on public.partners (sort_order, name)
  where is_published;

create trigger partners_updated_at
  before update on public.partners
  for each row execute function public.set_updated_at();

alter table public.partners enable row level security;

revoke all on table public.partners from anon, authenticated, service_role;
grant select on table public.partners to anon;
grant select, insert, update, delete on table public.partners to authenticated, service_role;
grant select on table public.media to anon, authenticated;

create policy "public can read published partners"
  on public.partners for select to anon, authenticated
  using (is_published);

create policy "admins have full access to partners"
  on public.partners for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());
