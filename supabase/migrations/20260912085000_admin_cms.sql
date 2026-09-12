create extension if not exists pgcrypto;

create table public.media (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null,
  public_url text not null,
  media_type text not null check (media_type in ('image', 'video')),
  alt_text text not null default '',
  division text check (division in ('engineering', 'asset-management')),
  uploaded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.company_profile (
  id uuid primary key default gen_random_uuid(),
  division text unique check (division in ('engineering', 'asset-management')),
  story text not null default '',
  mission text not null default '',
  vision text not null default '',
  landing_kicker text not null default '',
  landing_title text not null default '',
  landing_description text not null default '',
  landing_intro_label text not null default '',
  landing_intro text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.founder (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  portrait_media_id uuid references public.media(id) on delete set null,
  story_href text not null default '/story',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.company_values (
  id uuid primary key default gen_random_uuid(),
  division text check (division in ('engineering', 'asset-management')),
  name text not null,
  text text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  division text check (division in ('engineering', 'asset-management')),
  name text not null,
  description text not null default '',
  includes text[] not null default '{}',
  value text not null default '',
  editorial_status text not null default 'published',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sectors (
  id uuid primary key default gen_random_uuid(),
  division text check (division in ('engineering', 'asset-management')),
  name text not null,
  description text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.job_openings (
  id uuid primary key default gen_random_uuid(),
  division text check (division in ('engineering', 'asset-management')),
  title text not null,
  location text not null default '',
  description text not null default '',
  application_url text not null default '',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.insights (
  id uuid primary key default gen_random_uuid(),
  division text check (division in ('engineering', 'asset-management')),
  slug text not null unique,
  title text not null,
  category text not null default '',
  date date not null default current_date,
  summary text not null default '',
  body text[] not null default '{}',
  external_url text,
  author text not null default '',
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  division text check (division in ('engineering', 'asset-management')),
  quote text not null,
  name text not null,
  role text not null default '',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  href text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.homepage_content (
  id uuid primary key default gen_random_uuid(),
  hero_kicker text not null default '',
  hero_title text not null default '',
  hero_subtitle text not null default '',
  premise_label text not null default '',
  premise_heading text not null default '',
  closing_text text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'company_profile', 'founder', 'company_values', 'services', 'sectors',
    'job_openings', 'insights', 'testimonials', 'media', 'social_links', 'admins', 'homepage_content'
  ] loop
    execute format(
      'create trigger %I_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      table_name, table_name
    );
  end loop;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where id = auth.uid()
  );
$$;

alter table public.company_profile enable row level security;
alter table public.founder enable row level security;
alter table public.company_values enable row level security;
alter table public.services enable row level security;
alter table public.sectors enable row level security;
alter table public.job_openings enable row level security;
alter table public.insights enable row level security;
alter table public.testimonials enable row level security;
alter table public.media enable row level security;
alter table public.social_links enable row level security;
alter table public.admins enable row level security;
alter table public.homepage_content enable row level security;

create policy "public can read company profile" on public.company_profile for select to anon, authenticated using (true);
create policy "public can read founder" on public.founder for select to anon, authenticated using (true);
create policy "public can read values" on public.company_values for select to anon, authenticated using (true);
create policy "public can read services" on public.services for select to anon, authenticated using (true);
create policy "public can read sectors" on public.sectors for select to anon, authenticated using (true);
create policy "public can read published jobs" on public.job_openings for select to anon, authenticated using (is_published);
create policy "public can read published insights" on public.insights for select to anon, authenticated using (is_published);
create policy "public can read published testimonials" on public.testimonials for select to anon, authenticated using (is_published);
create policy "public can read media" on public.media for select to anon, authenticated using (true);
create policy "public can read social links" on public.social_links for select to anon, authenticated using (true);
create policy "public can read homepage content" on public.homepage_content for select to anon, authenticated using (true);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'company_profile', 'founder', 'company_values', 'services', 'sectors',
    'job_openings', 'insights', 'testimonials', 'media', 'social_links', 'admins', 'homepage_content'
  ] loop
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',
      'admins have full access to ' || table_name, table_name
    );
  end loop;
end;
$$;

insert into storage.buckets (id, name, public)
values ('media-images', 'media-images', true), ('media-videos', 'media-videos', true)
on conflict (id) do update set public = excluded.public;

create policy "public can read media images"
on storage.objects for select to anon, authenticated
using (bucket_id = 'media-images');

create policy "public can read media videos"
on storage.objects for select to anon, authenticated
using (bucket_id = 'media-videos');

create policy "admins can insert media images"
on storage.objects for insert to authenticated
with check (bucket_id = 'media-images' and public.is_admin());

create policy "admins can update media images"
on storage.objects for update to authenticated
using (bucket_id = 'media-images' and public.is_admin())
with check (bucket_id = 'media-images' and public.is_admin());

create policy "admins can delete media images"
on storage.objects for delete to authenticated
using (bucket_id = 'media-images' and public.is_admin());

create policy "admins can insert media videos"
on storage.objects for insert to authenticated
with check (bucket_id = 'media-videos' and public.is_admin());

create policy "admins can update media videos"
on storage.objects for update to authenticated
using (bucket_id = 'media-videos' and public.is_admin())
with check (bucket_id = 'media-videos' and public.is_admin());

create policy "admins can delete media videos"
on storage.objects for delete to authenticated
using (bucket_id = 'media-videos' and public.is_admin());
