create extension if not exists "pgcrypto";

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'project_status'
  ) then
    create type public.project_status as enum ('draft', 'active', 'closed');
  end if;
end $$;

create table if not exists public.agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  brand_color text,
  gstin text,
  bank_details text,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint agencies_brand_color_hex check (
    brand_color is null
    or brand_color ~ '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
  ),
  constraint agencies_owner_unique unique (owner_id)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  client_name text not null,
  client_email text not null,
  name text,
  status public.project_status not null default 'draft',
  sow_document_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.deliverables (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  required_format text,
  is_verified boolean not null default false,
  file_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credentials (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  label text not null,
  encrypted_value text not null,
  iv text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  deliverable_id uuid references public.deliverables(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  event_label text not null,
  event_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.project_magic_links (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  magic_token text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  last_accessed_at timestamptz
);

create index if not exists projects_agency_id_idx on public.projects (agency_id);
create index if not exists projects_status_idx on public.projects (status);
create index if not exists deliverables_project_id_idx on public.deliverables (project_id);
create index if not exists credentials_project_id_idx on public.credentials (project_id);
create index if not exists audit_logs_project_id_idx on public.audit_logs (project_id);
create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);
create index if not exists project_magic_links_project_id_idx on public.project_magic_links (project_id);
create index if not exists project_magic_links_token_idx on public.project_magic_links (magic_token);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists agencies_set_updated_at on public.agencies;
create trigger agencies_set_updated_at
before update on public.agencies
for each row
execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

drop trigger if exists deliverables_set_updated_at on public.deliverables;
create trigger deliverables_set_updated_at
before update on public.deliverables
for each row
execute function public.set_updated_at();

drop trigger if exists credentials_set_updated_at on public.credentials;
create trigger credentials_set_updated_at
before update on public.credentials
for each row
execute function public.set_updated_at();

alter table public.agencies enable row level security;
alter table public.projects enable row level security;
alter table public.deliverables enable row level security;
alter table public.credentials enable row level security;
alter table public.audit_logs enable row level security;
alter table public.project_magic_links enable row level security;

drop policy if exists "agency owners can manage their agency" on public.agencies;
create policy "agency owners can manage their agency"
on public.agencies
for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "agency owners can manage projects in their agency" on public.projects;
create policy "agency owners can manage projects in their agency"
on public.projects
for all
using (
  exists (
    select 1
    from public.agencies
    where agencies.id = projects.agency_id
      and agencies.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.agencies
    where agencies.id = projects.agency_id
      and agencies.owner_id = auth.uid()
  )
);

drop policy if exists "agency owners can manage deliverables in their projects" on public.deliverables;
create policy "agency owners can manage deliverables in their projects"
on public.deliverables
for all
using (
  exists (
    select 1
    from public.projects
    join public.agencies on agencies.id = projects.agency_id
    where projects.id = deliverables.project_id
      and agencies.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.projects
    join public.agencies on agencies.id = projects.agency_id
    where projects.id = deliverables.project_id
      and agencies.owner_id = auth.uid()
  )
);

drop policy if exists "agency owners can manage credentials in their projects" on public.credentials;
create policy "agency owners can manage credentials in their projects"
on public.credentials
for all
using (
  exists (
    select 1
    from public.projects
    join public.agencies on agencies.id = projects.agency_id
    where projects.id = credentials.project_id
      and agencies.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.projects
    join public.agencies on agencies.id = projects.agency_id
    where projects.id = credentials.project_id
      and agencies.owner_id = auth.uid()
  )
);

drop policy if exists "agency owners can view audit logs in their projects" on public.audit_logs;
create policy "agency owners can view audit logs in their projects"
on public.audit_logs
for all
using (
  exists (
    select 1
    from public.projects
    join public.agencies on agencies.id = projects.agency_id
    where projects.id = audit_logs.project_id
      and agencies.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.projects
    join public.agencies on agencies.id = projects.agency_id
    where projects.id = audit_logs.project_id
      and agencies.owner_id = auth.uid()
  )
);

drop policy if exists "agency owners can manage project magic links" on public.project_magic_links;
create policy "agency owners can manage project magic links"
on public.project_magic_links
for all
using (
  exists (
    select 1
    from public.projects
    join public.agencies on agencies.id = projects.agency_id
    where projects.id = project_magic_links.project_id
      and agencies.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.projects
    join public.agencies on agencies.id = projects.agency_id
    where projects.id = project_magic_links.project_id
      and agencies.owner_id = auth.uid()
  )
);
