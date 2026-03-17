# Supabase Setup

This project now includes the initial Ceal AI schema migration in `supabase/migrations/`.

## What exists

- Core tables: `agencies`, `projects`, `deliverables`, `credentials`
- Supporting tables: `audit_logs`, `project_magic_links`
- `project_status` enum
- RLS policies scoped to the agency owner
- `updated_at` trigger support for mutable tables

## What is still needed to apply remotely

To run this schema against the hosted Supabase project, one of these is required:

- Supabase CLI linked to the project
- Database password / connection string
- Or direct SQL editor access in the Supabase dashboard

## Expected env vars

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
