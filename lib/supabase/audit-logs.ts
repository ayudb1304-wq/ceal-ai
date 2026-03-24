import { createSupabaseAdminClient } from "@/lib/supabase/server"

export type AuditEventType =
  | "project_created"
  | "checklist_approved"
  | "deliverable_uploaded"
  | "deliverable_verified"
  | "credential_added"
  | "project_published"
  | "portal_accessed"
  | "portal_revisited"
  | "project_signed_off"

export type AuditLogEntry = {
  id: string
  project_id: string
  project_name: string | null
  deliverable_id: string | null
  event_type: AuditEventType
  event_label: string
  event_metadata: Record<string, unknown>
  created_at: string
}

export async function writeAuditLog(
  projectId: string,
  eventType: AuditEventType,
  eventLabel: string,
  opts?: {
    deliverableId?: string
    metadata?: Record<string, unknown>
  }
): Promise<void> {
  const supabase = createSupabaseAdminClient()

  await supabase.from("audit_logs").insert({
    project_id: projectId,
    deliverable_id: opts?.deliverableId ?? null,
    actor_user_id: null, // NextAuth JWT — no Supabase auth UUID available
    event_type: eventType,
    event_label: eventLabel,
    event_metadata: opts?.metadata ?? {},
  })
  // Silently swallow errors — audit log writes must never break the main action
}

export async function getAuditLogsForProject(projectId: string): Promise<AuditLogEntry[]> {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from("audit_logs")
    .select("id, project_id, deliverable_id, event_type, event_label, event_metadata, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) throw new Error(`Failed to fetch audit logs: ${error.message}`)

  return (data ?? []).map((row) => ({
    ...row,
    project_name: null,
    event_type: row.event_type as AuditEventType,
    event_metadata: (row.event_metadata ?? {}) as Record<string, unknown>,
  }))
}

export async function getAuditLogsForAgency(agencyId: string): Promise<AuditLogEntry[]> {
  const supabase = createSupabaseAdminClient()

  // Get all project IDs for this agency
  const { data: projects, error: pErr } = await supabase
    .from("projects")
    .select("id, name")
    .eq("agency_id", agencyId)

  if (pErr) throw new Error(`Failed to fetch projects: ${pErr.message}`)
  if (!projects?.length) return []

  const projectIds = projects.map((p) => p.id)
  const nameMap: Record<string, string | null> = {}
  for (const p of projects) nameMap[p.id] = p.name

  const { data, error } = await supabase
    .from("audit_logs")
    .select("id, project_id, deliverable_id, event_type, event_label, event_metadata, created_at")
    .in("project_id", projectIds)
    .order("created_at", { ascending: false })
    .limit(500)

  if (error) throw new Error(`Failed to fetch audit logs: ${error.message}`)

  return (data ?? []).map((row) => ({
    ...row,
    project_name: nameMap[row.project_id] ?? null,
    event_type: row.event_type as AuditEventType,
    event_metadata: (row.event_metadata ?? {}) as Record<string, unknown>,
  }))
}
