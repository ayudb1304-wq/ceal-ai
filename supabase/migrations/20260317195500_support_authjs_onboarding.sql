alter table public.agencies
  alter column owner_id drop not null;

alter table public.agencies
  add column if not exists owner_email text,
  add column if not exists contact_name text,
  add column if not exists owner_role text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'agencies_owner_email_unique'
  ) then
    alter table public.agencies
      add constraint agencies_owner_email_unique unique (owner_email);
  end if;
end $$;
