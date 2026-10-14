-- Client portal foundation. Portal authorization is based on server-managed
-- memberships and confirmed division entitlements, never user-editable claims.
create extension if not exists pgcrypto;
create schema if not exists portal_private;
revoke all on schema portal_private from public, anon, authenticated;
grant usage on schema portal_private to authenticated, service_role;

create table public.portal_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '' check (length(full_name) <= 160),
  job_title text not null default '' check (length(job_title) <= 160),
  phone_e164 text check (phone_e164 is null or phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  timezone text not null default 'Africa/Kampala' check (timezone in ('Africa/Kampala', 'Europe/London')),
  currency text not null default 'UGX' check (currency in ('UGX', 'GBP', 'USD')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.portal_staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('dreniak_engineer', 'dreniak_admin')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 200),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organisation_members (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('client_admin', 'client_member')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_id, user_id)
);

create table public.organisation_divisions (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete restrict,
  division text not null check (division in ('engineering', 'asset-management')),
  confirmed_by uuid references public.portal_staff(user_id) on delete set null,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organisation_id, division),
  check ((confirmed_by is null) = (confirmed_at is null))
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete restrict,
  email text not null check (length(email) <= 254),
  role text not null check (role in ('client_admin', 'client_member')),
  invited_by uuid not null references public.portal_staff(user_id) on delete restrict,
  expires_at timestamptz not null default now() + interval '7 days',
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (accepted_at is null or revoked_at is null)
);
create index invitations_org_email_idx on public.invitations(organisation_id, lower(email));
create index invitations_expiry_idx on public.invitations(expires_at);

create table public.onboarding_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  organisation_id uuid not null references public.organisations(id) on delete restrict,
  current_step smallint not null default 1 check (current_step between 1 and 5),
  profile_data jsonb not null default '{}'::jsonb,
  category_request text check (category_request is null or category_request in ('engineering', 'asset-management', 'both')),
  notifications_data jsonb not null default '{}'::jsonb,
  regional_data jsonb not null default '{}'::jsonb,
  privacy_version text,
  privacy_accepted_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((privacy_version is null) = (privacy_accepted_at is null))
);

create table public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email_enabled boolean not null default true,
  whatsapp_enabled boolean not null default false,
  event_types text[] not null default '{}'
    check (event_types <@ array['new_document','message','milestone_change','invoice_issued','invoice_overdue','supervision_issue']::text[]),
  whatsapp_consent_version text,
  whatsapp_consented_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (whatsapp_enabled = false or (whatsapp_consent_version is not null and whatsapp_consented_at is not null))
);

create table public.notification_outbox (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  channel text not null check (channel in ('email', 'whatsapp')),
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed', 'not_configured')),
  attempt_count smallint not null default 0 check (attempt_count between 0 and 10),
  available_at timestamptz not null default now(),
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index notification_outbox_queue_idx on public.notification_outbox(status, available_at) where status in ('pending', 'failed');

create table public.engagements (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete restrict,
  division text not null check (division in ('engineering', 'asset-management')),
  name text not null check (length(name) between 1 and 200),
  stage text not null default 'discovery' check (stage in ('discovery', 'planning', 'delivery', 'monitoring', 'complete', 'paused')),
  status_text text not null default '' check (length(status_text) <= 4000),
  start_date date,
  target_date date,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (target_date is null or start_date is null or target_date >= start_date)
);

create table public.engagement_staff (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  user_id uuid not null references public.portal_staff(user_id) on delete cascade,
  assignment text not null default 'team' check (assignment in ('lead', 'team')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (engagement_id, user_id)
);

create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  title text not null check (length(title) between 1 and 200),
  description text not null default '' check (length(description) <= 2000),
  due_date date,
  completed_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.status_updates (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete restrict,
  body text not null check (length(body) between 1 and 4000),
  client_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  title text not null check (length(title) between 1 and 200),
  document_type text not null default 'other' check (document_type in ('contract', 'report', 'drawing', 'invoice', 'image', 'other')),
  visibility text not null default 'internal' check (visibility in ('client', 'internal')),
  requires_acknowledgement boolean not null default false,
  deleted_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  storage_path text not null unique,
  filename text not null check (length(filename) between 1 and 255),
  mime_type text not null check (mime_type in ('application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')),
  size_bytes bigint not null check (size_bytes between 1 and 20971520),
  checksum_sha256 text check (checksum_sha256 is null or checksum_sha256 ~ '^[a-f0-9]{64}$'),
  uploaded_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (document_id, version_number)
);

create table public.document_acknowledgements (
  id uuid primary key default gen_random_uuid(),
  document_version_id uuid not null references public.document_versions(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  action text not null check (action in ('acknowledge', 'approve')),
  note text not null default '' check (length(note) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (document_version_id, user_id, action)
);

create table public.threads (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  subject text not null check (length(subject) between 1 and 200),
  created_by uuid not null references auth.users(id) on delete restrict,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.threads(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete restrict,
  body text not null check (length(body) between 1 and 10000),
  read_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.requests (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete restrict,
  request_type text not null check (request_type in ('information', 'site_visit', 'variation_query', 'general')),
  title text not null check (length(title) between 1 and 200),
  body text not null check (length(body) between 1 and 10000),
  status text not null default 'open' check (status in ('open', 'in_progress', 'closed')),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete restrict,
  invoice_number text not null unique check (length(invoice_number) between 1 and 80),
  status text not null default 'draft' check (status in ('draft', 'issued', 'part_paid', 'paid', 'overdue', 'void')),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  subtotal_minor bigint not null default 0 check (subtotal_minor >= 0),
  tax_minor bigint not null default 0 check (tax_minor >= 0),
  total_minor bigint not null default 0 check (total_minor = subtotal_minor + tax_minor),
  issued_at timestamptz,
  due_date date,
  deleted_at timestamptz,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'draft' and issued_at is null) or status <> 'draft')
);

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  description text not null check (length(description) between 1 and 500),
  quantity_milli integer not null check (quantity_milli > 0),
  unit_minor bigint not null check (unit_minor >= 0),
  tax_rate_basis_points integer not null default 0 check (tax_rate_basis_points between 0 and 10000),
  line_subtotal_minor bigint not null check (line_subtotal_minor >= 0),
  line_tax_minor bigint not null check (line_tax_minor >= 0),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.invoice_payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete restrict,
  amount_minor bigint not null check (amount_minor > 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  paid_at timestamptz not null,
  reference text not null default '' check (length(reference) <= 200),
  recorded_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payment_reference_notes (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  reference text not null check (length(reference) between 1 and 200),
  note text not null default '' check (length(note) <= 1000),
  status text not null default 'submitted' check (status in ('submitted', 'reviewed', 'matched', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.supervision_logs (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  observed_on date not null,
  location text not null default '' check (length(location) <= 300),
  work_package text not null default '' check (length(work_package) <= 300),
  observation text not null check (length(observation) between 1 and 10000),
  visibility text not null default 'client' check (visibility in ('client', 'internal')),
  created_by uuid not null references auth.users(id) on delete restrict,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.supervision_issues (
  id uuid primary key default gen_random_uuid(),
  supervision_log_id uuid not null references public.supervision_logs(id) on delete cascade,
  title text not null check (length(title) between 1 and 200),
  description text not null default '' check (length(description) <= 5000),
  status text not null default 'open' check (status in ('open', 'in_progress', 'closed', 'overdue')),
  severity text not null default 'medium' check (severity in ('low', 'medium', 'high', 'critical')),
  owner_name text not null default '' check (length(owner_name) <= 160),
  due_date date,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contract_events (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  event_type text not null check (event_type in ('notice', 'instruction', 'variation', 'obligation', 'other')),
  title text not null check (length(title) between 1 and 200),
  details text not null default '' check (length(details) <= 10000),
  status text not null default 'open' check (status in ('open', 'in_progress', 'closed', 'overdue')),
  event_date date not null,
  visibility text not null default 'client' check (visibility in ('client', 'internal')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quality_records (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  record_type text not null check (record_type in ('inspection', 'test', 'safety', 'quality', 'other')),
  title text not null check (length(title) between 1 and 200),
  work_package text not null default '' check (length(work_package) <= 300),
  recorded_on date not null,
  result text not null default '' check (length(result) <= 10000),
  visibility text not null default 'client' check (visibility in ('client', 'internal')),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete restrict,
  asset_code text not null check (length(asset_code) between 1 and 120),
  name text not null check (length(name) between 1 and 200),
  asset_class text not null default '' check (length(asset_class) <= 160),
  location text not null default '' check (length(location) <= 300),
  latitude numeric(9,6) check (latitude between -90 and 90),
  longitude numeric(9,6) check (longitude between -180 and 180),
  condition_grade smallint check (condition_grade between 1 and 5),
  criticality text not null default 'medium' check (criticality in ('low', 'medium', 'high', 'critical')),
  risk_score numeric(6,2) check (risk_score between 0 and 100),
  installed_on date,
  expected_life_years smallint check (expected_life_years > 0),
  replacement_cost_minor bigint check (replacement_cost_minor >= 0),
  currency text check (currency is null or currency ~ '^[A-Z]{3}$'),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (engagement_id, asset_code)
);

create table public.asset_condition_records (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  condition_grade smallint not null check (condition_grade between 1 and 5),
  risk_score numeric(6,2) check (risk_score between 0 and 100),
  notes text not null default '' check (length(notes) <= 5000),
  assessed_on date not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.asset_interventions (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  title text not null check (length(title) between 1 and 200),
  intervention_type text not null check (intervention_type in ('maintenance', 'renewal', 'inspection', 'other')),
  planned_on date,
  completed_on date,
  cost_minor bigint check (cost_minor is null or cost_minor >= 0),
  currency text check (currency is null or currency ~ '^[A-Z]{3}$'),
  status text not null default 'planned' check (status in ('planned', 'approved', 'complete', 'deferred', 'cancelled')),
  notes text not null default '' check (length(notes) <= 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.capital_plan_items (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  title text not null check (length(title) between 1 and 200),
  rationale text not null default '' check (length(rationale) <= 5000),
  cost_minor bigint check (cost_minor is null or cost_minor >= 0),
  currency text check (currency is null or currency ~ '^[A-Z]{3}$'),
  target_year smallint,
  rank integer not null default 0,
  status text not null default 'proposed' check (status in ('proposed', 'approved', 'deferred')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.maturity_assessments (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  answers smallint[] not null check (cardinality(answers) = 6 and array_position(answers, null) is null and answers <@ array[0,1,2,3]::smallint[]),
  score smallint not null check (score = round(((answers[1] + answers[2] + answers[3] + answers[4] + answers[5] + answers[6])::numeric / 18) * 100)::smallint),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.privacy_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  organisation_id uuid references public.organisations(id) on delete restrict,
  request_type text not null check (request_type in ('data_export', 'deletion')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'complete', 'declined')),
  note text not null default '' check (length(note) <= 2000),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  organisation_id uuid references public.organisations(id) on delete set null,
  engagement_id uuid references public.engagements(id) on delete set null,
  action text not null check (length(action) between 1 and 120),
  target_type text not null check (length(target_type) <= 120),
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Index foreign keys and common tenant, status, and chronology filters.
create index organisation_members_user_idx on public.organisation_members(user_id);
create index organisation_divisions_org_idx on public.organisation_divisions(organisation_id);
create index invitations_invited_by_idx on public.invitations(invited_by);
create index onboarding_org_idx on public.onboarding_state(organisation_id);
create index notification_outbox_user_idx on public.notification_outbox(user_id, created_at desc);
create index engagements_org_division_idx on public.engagements(organisation_id, division, created_at desc) where deleted_at is null;
create index engagement_staff_user_idx on public.engagement_staff(user_id, engagement_id);
create index milestones_engagement_idx on public.milestones(engagement_id, sort_order, due_date);
create index status_updates_engagement_idx on public.status_updates(engagement_id, created_at desc);
create index status_updates_author_idx on public.status_updates(author_id);
create index documents_engagement_idx on public.documents(engagement_id, visibility) where deleted_at is null;
create index documents_created_by_idx on public.documents(created_by);
create index document_versions_document_idx on public.document_versions(document_id, version_number desc);
create index document_versions_uploaded_by_idx on public.document_versions(uploaded_by);
create index document_ack_user_idx on public.document_acknowledgements(user_id, created_at desc);
create index threads_engagement_idx on public.threads(engagement_id, created_at desc);
create index threads_created_by_idx on public.threads(created_by);
create index messages_thread_idx on public.messages(thread_id, created_at);
create index messages_sender_idx on public.messages(sender_id);
create index requests_engagement_idx on public.requests(engagement_id, status, created_at desc) where deleted_at is null;
create index requests_created_by_idx on public.requests(created_by);
create index invoices_engagement_status_idx on public.invoices(engagement_id, status, due_date) where deleted_at is null;
create index invoices_created_by_idx on public.invoices(created_by);
create index invoice_items_invoice_idx on public.invoice_items(invoice_id, sort_order);
create index invoice_payments_invoice_idx on public.invoice_payments(invoice_id, paid_at desc);
create index invoice_payments_recorded_by_idx on public.invoice_payments(recorded_by);
create index payment_reference_invoice_idx on public.payment_reference_notes(invoice_id, created_at desc);
create index payment_reference_user_idx on public.payment_reference_notes(user_id);
create index supervision_logs_engagement_idx on public.supervision_logs(engagement_id, observed_on desc) where deleted_at is null;
create index supervision_logs_created_by_idx on public.supervision_logs(created_by);
create index supervision_issues_log_idx on public.supervision_issues(supervision_log_id, status, due_date);
create index contract_events_engagement_idx on public.contract_events(engagement_id, event_date desc);
create index contract_events_created_by_idx on public.contract_events(created_by);
create index quality_records_engagement_idx on public.quality_records(engagement_id, recorded_on desc);
create index quality_records_created_by_idx on public.quality_records(created_by);
create index assets_engagement_idx on public.assets(engagement_id, asset_class, condition_grade) where deleted_at is null;
create index asset_condition_asset_idx on public.asset_condition_records(asset_id, assessed_on desc);
create index asset_condition_created_by_idx on public.asset_condition_records(created_by);
create index asset_interventions_asset_idx on public.asset_interventions(asset_id, planned_on, status);
create index capital_plan_engagement_rank_idx on public.capital_plan_items(engagement_id, rank);
create index maturity_org_created_idx on public.maturity_assessments(organisation_id, created_at desc);
create index maturity_user_idx on public.maturity_assessments(user_id, created_at desc);
create index privacy_requests_user_idx on public.privacy_requests(user_id, created_at desc);
create index privacy_requests_org_idx on public.privacy_requests(organisation_id, status);
create index audit_actor_idx on public.audit_log(actor_id, created_at desc);
create index audit_org_idx on public.audit_log(organisation_id, created_at desc);
create index audit_engagement_idx on public.audit_log(engagement_id, created_at desc);

create function public.portal_set_updated_at() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function public.portal_set_updated_at() from public, anon, authenticated;

do $$
declare t text;
begin
  foreach t in array array[
    'portal_profiles','portal_staff','organisations','organisation_members','organisation_divisions',
    'invitations','onboarding_state','notification_preferences','notification_outbox','engagements',
    'engagement_staff','milestones','status_updates','documents','document_versions',
    'document_acknowledgements','threads','messages','requests','invoices','invoice_items',
    'invoice_payments','payment_reference_notes','supervision_logs','supervision_issues',
    'contract_events','quality_records','assets','asset_condition_records','asset_interventions',
    'capital_plan_items','maturity_assessments','privacy_requests'
  ] loop
    execute format('create trigger %I before update on public.%I for each row execute function public.portal_set_updated_at()', t || '_updated_at', t);
  end loop;
end;
$$;

-- These helpers run with a fixed search path in a non-exposed schema to avoid
-- recursive membership policies. Role changes are service-role-only.
create or replace function portal_private.is_staff()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.portal_staff s where s.user_id = (select auth.uid()) and s.active)
$$;
create or replace function portal_private.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.portal_staff s where s.user_id = (select auth.uid()) and s.active and s.role = 'dreniak_admin')
$$;
create or replace function portal_private.is_org_member(org_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.organisation_members m join public.organisations o on o.id = m.organisation_id where m.organisation_id = $1 and m.user_id = (select auth.uid()) and o.deleted_at is null)
$$;
create or replace function portal_private.is_org_admin(org_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.organisation_members m where m.organisation_id = $1 and m.user_id = (select auth.uid()) and m.role = 'client_admin')
$$;
create or replace function portal_private.has_division(org_id uuid, division_name text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.organisation_divisions d where d.organisation_id = $1 and d.division = $2 and d.confirmed_at is not null)
$$;
create or replace function portal_private.can_read_engagement(engagement_uuid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.engagements e
    where e.id = $1 and e.deleted_at is null and (
      portal_private.is_admin() or
      exists (select 1 from public.engagement_staff es join public.portal_staff ps on ps.user_id = es.user_id and ps.active where es.engagement_id = e.id and es.user_id = (select auth.uid())) or
      (portal_private.is_org_member(e.organisation_id) and portal_private.has_division(e.organisation_id, e.division))
    )
  )
$$;
create or replace function portal_private.can_manage_engagement(engagement_uuid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select portal_private.is_admin() or exists (
    select 1 from public.engagement_staff es join public.portal_staff ps on ps.user_id = es.user_id and ps.active where es.engagement_id = $1 and es.user_id = (select auth.uid())
  )
$$;
create or replace function portal_private.can_read_document(document_uuid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.documents d where d.id = $1 and d.deleted_at is null and portal_private.can_read_engagement(d.engagement_id) and (d.visibility = 'client' or portal_private.is_staff()))
$$;
create or replace function portal_private.can_read_thread(thread_uuid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.threads t where t.id = $1 and portal_private.can_read_engagement(t.engagement_id))
$$;
create or replace function portal_private.can_read_invoice(invoice_uuid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.invoices i where i.id = $1 and i.deleted_at is null and portal_private.can_read_engagement(i.engagement_id) and (i.status <> 'draft' or portal_private.is_staff()))
$$;
create or replace function portal_private.can_read_asset(asset_uuid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.assets a join public.engagements e on e.id = a.engagement_id where a.id = $1 and a.deleted_at is null and e.division = 'asset-management' and portal_private.can_read_engagement(a.engagement_id))
$$;
create or replace function portal_private.can_read_engagement_in_division(engagement_uuid uuid, division_name text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.engagements e where e.id = $1 and e.division = $2 and portal_private.can_read_engagement(e.id))
$$;
create or replace function portal_private.can_manage_asset(asset_uuid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.assets a join public.engagements e on e.id = a.engagement_id where a.id = $1 and e.division = 'asset-management' and portal_private.can_manage_engagement(a.engagement_id))
$$;
create or replace function portal_private.can_read_profile(profile_uuid uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select $1 = (select auth.uid()) or portal_private.is_staff() or exists (
    select 1 from public.organisation_members mine
    join public.organisation_members theirs on theirs.organisation_id = mine.organisation_id
    where mine.user_id = (select auth.uid()) and theirs.user_id = $1
  ) or exists (
    select 1 from public.engagement_staff es
    join public.engagements e on e.id = es.engagement_id
    where es.user_id = $1 and portal_private.can_read_engagement(e.id)
  )
$$;
create or replace function portal_private.can_read_file(object_name text)
returns boolean language plpgsql stable security definer set search_path = '' as $$
declare org_uuid uuid; engagement_uuid uuid; document_uuid uuid; filename text;
begin
  if split_part(object_name, '/', 1) <> 'org'
    or split_part(object_name, '/', 3) <> 'engagement'
    or split_part(object_name, '/', 6) in ('', '.', '..')
    or split_part(object_name, '/', 7) <> '' then return false; end if;
  begin
    org_uuid := split_part(object_name, '/', 2)::uuid;
    engagement_uuid := split_part(object_name, '/', 4)::uuid;
    document_uuid := split_part(object_name, '/', 5)::uuid;
    filename := split_part(object_name, '/', 6);
  exception when invalid_text_representation then return false;
  end;
  return length(filename) <= 255 and portal_private.can_read_document(document_uuid) and exists (
    select 1 from public.documents d join public.engagements e on e.id = d.engagement_id
    where d.id = document_uuid and d.engagement_id = engagement_uuid and e.organisation_id = org_uuid
  );
end;
$$;
create or replace function portal_private.can_manage_file(object_name text)
returns boolean language plpgsql stable security definer set search_path = '' as $$
declare org_uuid uuid; engagement_uuid uuid; document_uuid uuid;
begin
  if split_part(object_name, '/', 1) <> 'org'
    or split_part(object_name, '/', 3) <> 'engagement'
    or split_part(object_name, '/', 6) in ('', '.', '..')
    or split_part(object_name, '/', 7) <> '' then return false; end if;
  begin
    org_uuid := split_part(object_name, '/', 2)::uuid;
    engagement_uuid := split_part(object_name, '/', 4)::uuid;
    document_uuid := split_part(object_name, '/', 5)::uuid;
  exception when invalid_text_representation then return false;
  end;
  return exists (
    select 1 from public.documents d join public.engagements e on e.id = d.engagement_id
    where d.id = document_uuid and d.engagement_id = engagement_uuid
      and e.organisation_id = org_uuid and portal_private.can_manage_engagement(d.engagement_id)
  );
end;
$$;

revoke all on all functions in schema portal_private from public, anon;
grant execute on all functions in schema portal_private to authenticated, service_role;
alter default privileges in schema portal_private revoke execute on functions from public;

-- Explicit table grants narrow the write surface; RLS then scopes every row.
do $$
declare t text;
begin
  foreach t in array array[
    'portal_profiles','portal_staff','organisations','organisation_members','organisation_divisions',
    'invitations','onboarding_state','notification_preferences','notification_outbox','engagements',
    'engagement_staff','milestones','status_updates','documents','document_versions',
    'document_acknowledgements','threads','messages','requests','invoices','invoice_items',
    'invoice_payments','payment_reference_notes','supervision_logs','supervision_issues',
    'contract_events','quality_records','assets','asset_condition_records','asset_interventions',
    'capital_plan_items','maturity_assessments','privacy_requests','audit_log'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from public, anon', t);
    execute format('grant select on public.%I to authenticated', t);
    execute format('grant all on public.%I to service_role', t);
  end loop;
end;
$$;

grant insert on public.portal_profiles to authenticated;
grant update (full_name, job_title, phone_e164, timezone, currency) on public.portal_profiles to authenticated;
grant insert (organisation_id, user_id, answers, score) on public.maturity_assessments to authenticated;
grant insert (user_id, organisation_id, request_type, note) on public.privacy_requests to authenticated;
grant insert (document_version_id, user_id, action, note) on public.document_acknowledgements to authenticated;
grant insert (invoice_id, user_id, reference, note) on public.payment_reference_notes to authenticated;

create policy portal_profiles_read on public.portal_profiles for select to authenticated using (portal_private.can_read_profile(user_id));
create policy portal_profiles_insert_self on public.portal_profiles for insert to authenticated with check (user_id = (select auth.uid()));
create policy portal_profiles_update_self on public.portal_profiles for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy portal_staff_read on public.portal_staff for select to authenticated using (user_id = (select auth.uid()) or portal_private.is_admin());
create policy organisations_member_read on public.organisations for select to authenticated using (portal_private.is_org_member(id) or portal_private.is_admin());
create policy organisations_staff_manage on public.organisations for all to authenticated using (portal_private.is_admin()) with check (portal_private.is_admin());
create policy organisation_members_org_read on public.organisation_members for select to authenticated using (portal_private.is_org_member(organisation_id) or portal_private.is_admin());
create policy organisation_members_admin_manage on public.organisation_members for all to authenticated using (portal_private.is_admin()) with check (portal_private.is_admin());
create policy organisation_divisions_org_read on public.organisation_divisions for select to authenticated using (portal_private.is_org_member(organisation_id) or portal_private.is_admin());
create policy organisation_divisions_staff_manage on public.organisation_divisions for all to authenticated using (portal_private.is_admin()) with check (portal_private.is_admin());
create policy invitations_staff_only on public.invitations for all to authenticated using (portal_private.is_admin()) with check (portal_private.is_admin());
create policy onboarding_state_self_read on public.onboarding_state for select to authenticated using (user_id = (select auth.uid()) or portal_private.is_admin());
create policy onboarding_state_self_insert on public.onboarding_state for insert to authenticated with check (user_id = (select auth.uid()) and portal_private.is_org_member(organisation_id));
create policy onboarding_state_self_update on public.onboarding_state for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()) and portal_private.is_org_member(organisation_id));
create policy notification_preferences_self_read on public.notification_preferences for select to authenticated using (user_id = (select auth.uid()) or portal_private.is_admin());
create policy notification_preferences_self_insert on public.notification_preferences for insert to authenticated with check (user_id = (select auth.uid()));
create policy notification_preferences_self_update on public.notification_preferences for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy notification_outbox_staff_only on public.notification_outbox for all to authenticated using (portal_private.is_staff()) with check (portal_private.is_staff());
create policy engagements_read on public.engagements for select to authenticated using (portal_private.can_read_engagement(id));
create policy engagements_staff_manage on public.engagements for all to authenticated using (portal_private.can_manage_engagement(id)) with check (portal_private.can_manage_engagement(id));
create policy engagement_staff_read on public.engagement_staff for select to authenticated using (portal_private.can_read_engagement(engagement_id));
create policy engagement_staff_admin_manage on public.engagement_staff for all to authenticated using (portal_private.is_admin()) with check (portal_private.is_admin());
create policy milestones_read on public.milestones for select to authenticated using (portal_private.can_read_engagement(engagement_id));
create policy milestones_staff_manage on public.milestones for all to authenticated using (portal_private.can_manage_engagement(engagement_id)) with check (portal_private.can_manage_engagement(engagement_id));
create policy status_updates_read on public.status_updates for select to authenticated using (portal_private.can_read_engagement(engagement_id) and (client_visible or portal_private.is_staff()));
create policy status_updates_staff_manage on public.status_updates for all to authenticated using (portal_private.can_manage_engagement(engagement_id)) with check (portal_private.can_manage_engagement(engagement_id));
create policy documents_read on public.documents for select to authenticated using (portal_private.can_read_document(id));
create policy documents_staff_manage on public.documents for all to authenticated using (portal_private.can_manage_engagement(engagement_id)) with check (portal_private.can_manage_engagement(engagement_id));
create policy document_versions_read on public.document_versions for select to authenticated using (portal_private.can_read_document(document_id));
create policy document_versions_staff_manage on public.document_versions for all to authenticated using (portal_private.is_admin() or exists (select 1 from public.documents d where d.id = document_id and portal_private.can_manage_engagement(d.engagement_id))) with check (portal_private.is_admin() or exists (select 1 from public.documents d where d.id = document_id and portal_private.can_manage_engagement(d.engagement_id)));
create policy document_ack_read on public.document_acknowledgements for select to authenticated using (user_id = (select auth.uid()) or portal_private.is_staff());
create policy document_ack_insert on public.document_acknowledgements for insert to authenticated with check (user_id = (select auth.uid()) and portal_private.can_read_document((select dv.document_id from public.document_versions dv where dv.id = document_version_id)) and (select d.requires_acknowledgement from public.documents d join public.document_versions dv on dv.document_id = d.id where dv.id = document_version_id));
create policy threads_read on public.threads for select to authenticated using (portal_private.can_read_engagement(engagement_id));
create policy threads_client_insert on public.threads for insert to authenticated with check (created_by = (select auth.uid()) and closed_at is null and portal_private.is_org_member((select e.organisation_id from public.engagements e where e.id = engagement_id)) and portal_private.has_division((select e.organisation_id from public.engagements e where e.id = engagement_id), (select e.division from public.engagements e where e.id = engagement_id)));
create policy threads_staff_manage on public.threads for update to authenticated using (portal_private.can_manage_engagement(engagement_id)) with check (portal_private.can_manage_engagement(engagement_id));
create policy messages_read on public.messages for select to authenticated using (portal_private.can_read_thread(thread_id) and deleted_at is null);
create policy messages_client_insert on public.messages for insert to authenticated with check (sender_id = (select auth.uid()) and read_at is null and deleted_at is null and portal_private.can_read_thread(thread_id));
create policy messages_staff_update on public.messages for update to authenticated using (portal_private.is_staff() and portal_private.can_read_thread(thread_id)) with check (portal_private.is_staff() and portal_private.can_read_thread(thread_id));
create policy requests_read on public.requests for select to authenticated using (portal_private.can_read_engagement(engagement_id) and (created_by = (select auth.uid()) or portal_private.is_staff()));
create policy requests_client_insert on public.requests for insert to authenticated with check (created_by = (select auth.uid()) and status = 'open' and deleted_at is null and portal_private.can_read_engagement(engagement_id) and not portal_private.is_staff());
create policy requests_staff_update on public.requests for update to authenticated using (portal_private.can_manage_engagement(engagement_id)) with check (portal_private.can_manage_engagement(engagement_id));
create policy invoices_read on public.invoices for select to authenticated using (portal_private.can_read_invoice(id));
create policy invoices_staff_manage on public.invoices for all to authenticated using (portal_private.can_manage_engagement(engagement_id)) with check (portal_private.can_manage_engagement(engagement_id));
create policy invoice_items_read on public.invoice_items for select to authenticated using (portal_private.can_read_invoice(invoice_id));
create policy invoice_items_staff_manage on public.invoice_items for all to authenticated using (portal_private.is_admin() or exists (select 1 from public.invoices i where i.id = invoice_id and portal_private.can_manage_engagement(i.engagement_id))) with check (portal_private.is_admin() or exists (select 1 from public.invoices i where i.id = invoice_id and portal_private.can_manage_engagement(i.engagement_id)));
create policy invoice_payments_read on public.invoice_payments for select to authenticated using (portal_private.can_read_invoice(invoice_id));
create policy invoice_payments_staff_manage on public.invoice_payments for all to authenticated using (portal_private.is_admin() or exists (select 1 from public.invoices i where i.id = invoice_id and portal_private.can_manage_engagement(i.engagement_id))) with check (portal_private.is_admin() or exists (select 1 from public.invoices i where i.id = invoice_id and portal_private.can_manage_engagement(i.engagement_id)));
create policy payment_reference_read on public.payment_reference_notes for select to authenticated using (user_id = (select auth.uid()) or portal_private.is_staff());
create policy payment_reference_insert on public.payment_reference_notes for insert to authenticated with check (user_id = (select auth.uid()) and portal_private.can_read_invoice(invoice_id) and not portal_private.is_staff());
create policy supervision_logs_read on public.supervision_logs for select to authenticated using (portal_private.can_read_engagement_in_division(engagement_id, 'engineering') and (visibility = 'client' or portal_private.is_staff()));
create policy supervision_logs_staff_manage on public.supervision_logs for all to authenticated using (portal_private.can_read_engagement_in_division(engagement_id, 'engineering') and portal_private.can_manage_engagement(engagement_id)) with check (portal_private.can_read_engagement_in_division(engagement_id, 'engineering') and portal_private.can_manage_engagement(engagement_id));
create policy supervision_issues_read on public.supervision_issues for select to authenticated using (exists (select 1 from public.supervision_logs l where l.id = supervision_log_id and portal_private.can_read_engagement_in_division(l.engagement_id, 'engineering') and (l.visibility = 'client' or portal_private.is_staff())));
create policy supervision_issues_staff_manage on public.supervision_issues for all to authenticated using (portal_private.is_admin() or exists (select 1 from public.supervision_logs l where l.id = supervision_log_id and portal_private.can_read_engagement_in_division(l.engagement_id, 'engineering') and portal_private.can_manage_engagement(l.engagement_id))) with check (portal_private.is_admin() or exists (select 1 from public.supervision_logs l where l.id = supervision_log_id and portal_private.can_read_engagement_in_division(l.engagement_id, 'engineering') and portal_private.can_manage_engagement(l.engagement_id)));
create policy contract_events_read on public.contract_events for select to authenticated using (portal_private.can_read_engagement_in_division(engagement_id, 'engineering') and (visibility = 'client' or portal_private.is_staff()));
create policy contract_events_staff_manage on public.contract_events for all to authenticated using (portal_private.can_read_engagement_in_division(engagement_id, 'engineering') and portal_private.can_manage_engagement(engagement_id)) with check (portal_private.can_read_engagement_in_division(engagement_id, 'engineering') and portal_private.can_manage_engagement(engagement_id));
create policy quality_records_read on public.quality_records for select to authenticated using (portal_private.can_read_engagement_in_division(engagement_id, 'engineering') and (visibility = 'client' or portal_private.is_staff()));
create policy quality_records_staff_manage on public.quality_records for all to authenticated using (portal_private.can_read_engagement_in_division(engagement_id, 'engineering') and portal_private.can_manage_engagement(engagement_id)) with check (portal_private.can_read_engagement_in_division(engagement_id, 'engineering') and portal_private.can_manage_engagement(engagement_id));
create policy assets_read on public.assets for select to authenticated using (portal_private.can_read_asset(id));
create policy assets_staff_manage on public.assets for all to authenticated using (portal_private.can_read_engagement_in_division(engagement_id, 'asset-management') and portal_private.can_manage_engagement(engagement_id)) with check (portal_private.can_read_engagement_in_division(engagement_id, 'asset-management') and portal_private.can_manage_engagement(engagement_id));
create policy asset_condition_read on public.asset_condition_records for select to authenticated using (portal_private.can_read_asset(asset_id));
create policy asset_condition_staff_manage on public.asset_condition_records for all to authenticated using (portal_private.can_manage_asset(asset_id)) with check (portal_private.can_manage_asset(asset_id));
create policy asset_interventions_read on public.asset_interventions for select to authenticated using (portal_private.can_read_asset(asset_id));
create policy asset_interventions_staff_manage on public.asset_interventions for all to authenticated using (portal_private.can_manage_asset(asset_id)) with check (portal_private.can_manage_asset(asset_id));
create policy capital_plan_read on public.capital_plan_items for select to authenticated using (portal_private.can_read_engagement_in_division(engagement_id, 'asset-management'));
create policy capital_plan_staff_manage on public.capital_plan_items for all to authenticated using (portal_private.can_read_engagement_in_division(engagement_id, 'asset-management') and portal_private.can_manage_engagement(engagement_id)) with check (portal_private.can_read_engagement_in_division(engagement_id, 'asset-management') and portal_private.can_manage_engagement(engagement_id));
create policy maturity_read on public.maturity_assessments for select to authenticated using (user_id = (select auth.uid()) or portal_private.is_admin());
create policy maturity_insert on public.maturity_assessments for insert to authenticated with check (user_id = (select auth.uid()) and portal_private.is_org_member(organisation_id) and portal_private.has_division(organisation_id, 'asset-management'));
create policy privacy_requests_read on public.privacy_requests for select to authenticated using (user_id = (select auth.uid()) or portal_private.is_admin());
create policy privacy_requests_insert on public.privacy_requests for insert to authenticated with check (user_id = (select auth.uid()) and status = 'open' and completed_at is null and (organisation_id is null or portal_private.is_org_member(organisation_id)));
create policy audit_log_staff_read on public.audit_log for select to authenticated using (portal_private.is_admin());

-- Client reads require an authenticated RLS check before signed URLs are issued.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portal-files', 'portal-files', false, 20971520, array[
  'application/pdf','image/jpeg','image/png','image/webp','text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]) on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
create policy portal_files_read on storage.objects for select to authenticated using (bucket_id = 'portal-files' and portal_private.can_read_file(name));
create policy portal_files_staff_upload on storage.objects for insert to authenticated with check (bucket_id = 'portal-files' and portal_private.is_staff() and portal_private.can_manage_file(name));
create policy portal_files_staff_update on storage.objects for update to authenticated using (bucket_id = 'portal-files' and portal_private.can_manage_file(name)) with check (bucket_id = 'portal-files' and portal_private.can_manage_file(name));
create policy portal_files_staff_delete on storage.objects for delete to authenticated using (bucket_id = 'portal-files' and portal_private.is_admin());

-- Audit is immutable to all application roles; staff server operations append
-- via the service role. No full names, email addresses, or document contents.
revoke update, delete, truncate on public.audit_log from public, anon, authenticated, service_role;
grant insert on public.audit_log to service_role;
grant insert on public.audit_log to authenticated;
create policy audit_log_self_signin on public.audit_log for insert to authenticated
with check (
  actor_id = (select auth.uid()) and organisation_id is null and engagement_id is null
  and action = 'auth.sign_in' and target_type = 'auth' and target_id is null
  and metadata = '{"method":"email_magic_link"}'::jsonb
);
create policy audit_log_document_event on public.audit_log for insert to authenticated
with check (
  actor_id = (select auth.uid()) and action in ('document.view', 'document.download')
  and target_type = 'document_version' and organisation_id is not null and engagement_id is not null
  and metadata = '{}'::jsonb
  and exists (
    select 1 from public.document_versions dv
    join public.documents d on d.id = dv.document_id
    join public.engagements e on e.id = d.engagement_id
    where dv.id = audit_log.target_id
      and d.engagement_id = audit_log.engagement_id
      and e.organisation_id = audit_log.organisation_id
      and portal_private.can_read_document(d.id)
  )
);
create function public.portal_log_sign_in() returns void
language plpgsql security invoker set search_path = '' as $$
begin
  if (select auth.uid()) is null then raise exception 'Authentication required'; end if;
  insert into public.audit_log(actor_id, action, target_type, metadata)
    values ((select auth.uid()), 'auth.sign_in', 'auth', '{"method":"email_magic_link"}'::jsonb);
end;
$$;
revoke all on function public.portal_log_sign_in() from public, anon;
grant execute on function public.portal_log_sign_in() to authenticated;
create function public.portal_log_document_event(p_action text, p_version_id uuid) returns void
language plpgsql security invoker set search_path = '' as $$
declare doc_engagement_id uuid; org_id uuid;
begin
  if p_action not in ('document.view', 'document.download') then raise exception 'Invalid audit action'; end if;
  select d.engagement_id, e.organisation_id into doc_engagement_id, org_id
  from public.document_versions dv join public.documents d on d.id = dv.document_id
  join public.engagements e on e.id = d.engagement_id
  where dv.id = p_version_id and portal_private.can_read_document(d.id);
  if not found then raise exception 'Document unavailable'; end if;
  insert into public.audit_log(actor_id, organisation_id, engagement_id, action, target_type, target_id, metadata)
  values ((select auth.uid()), org_id, doc_engagement_id, p_action, 'document_version', p_version_id, '{}'::jsonb);
end;
$$;
revoke all on function public.portal_log_document_event(text, uuid) from public, anon;
grant execute on function public.portal_log_document_event(text, uuid) to authenticated;

create function public.portal_accept_invitation(
  p_invitation_id uuid,
  p_user_id uuid,
  p_email text
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare invite public.invitations;
begin
  if not exists (
    select 1 from auth.users u
    where u.id = p_user_id and lower(u.email) = lower(p_email) and u.email_confirmed_at is not null
  ) then
    raise exception 'Invitation identity could not be verified';
  end if;

  select * into invite from public.invitations i
  where i.id = p_invitation_id and lower(i.email) = lower(p_email)
    and i.accepted_at is null and i.revoked_at is null and i.expires_at > now()
  for update;
  if not found then raise exception 'Invitation is expired or unavailable'; end if;

  update public.invitations set accepted_at = now() where id = invite.id;
  insert into public.organisation_members(organisation_id, user_id, role)
    values (invite.organisation_id, p_user_id, invite.role)
    on conflict (organisation_id, user_id) do update set role = excluded.role;
  insert into public.portal_profiles(user_id) values (p_user_id) on conflict (user_id) do nothing;
  insert into public.onboarding_state(user_id, organisation_id)
    values (p_user_id, invite.organisation_id) on conflict (user_id) do nothing;
  insert into public.audit_log(actor_id, organisation_id, action, target_type, target_id, metadata)
    values (p_user_id, invite.organisation_id, 'invite.accepted', 'invitation', invite.id, '{}'::jsonb);
  return invite.organisation_id;
end;
$$;
revoke all on function public.portal_accept_invitation(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.portal_accept_invitation(uuid, uuid, text) to service_role;
