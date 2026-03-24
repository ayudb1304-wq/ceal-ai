import { createSupabaseAdminClient } from "@/lib/supabase/server"

export type ProjectStatus = "draft" | "active" | "closed"

export type ProjectRow = {
  id: string
  name: string | null
  client_name: string
  client_email: string
  status: ProjectStatus
  sow_document_url: string | null
  created_at: string
  deliverable_count: number
  verified_count: number
}

export type ProjectDetail = {
  id: string
  name: string | null
  client_name: string
  client_email: string
  status: ProjectStatus
  sow_document_url: string | null
  agency_id: string
}

export async function getProjectsForAgency(agencyId: string): Promise<ProjectRow[]> {
  const supabase = createSupabaseAdminClient()

  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, name, client_name, client_email, status, sow_document_url, created_at")
    .eq("agency_id", agencyId)
    .order("created_at", { ascending: false })

  if (error) throw new Error(`Failed to fetch projects: ${error.message}`)
  if (!projects) return []

  // Fetch deliverable counts in one query
  const projectIds = projects.map((p) => p.id)
  if (projectIds.length === 0) return []

  const { data: deliverables, error: delError } = await supabase
    .from("deliverables")
    .select("project_id, is_verified")
    .in("project_id", projectIds)

  if (delError) throw new Error(`Failed to fetch deliverable counts: ${delError.message}`)

  const countMap: Record<string, { total: number; verified: number }> = {}
  for (const d of deliverables ?? []) {
    if (!countMap[d.project_id]) countMap[d.project_id] = { total: 0, verified: 0 }
    countMap[d.project_id].total++
    if (d.is_verified) countMap[d.project_id].verified++
  }

  return projects.map((p) => ({
    ...p,
    deliverable_count: countMap[p.id]?.total ?? 0,
    verified_count: countMap[p.id]?.verified ?? 0,
  }))
}

export async function getProjectDetail(projectId: string): Promise<ProjectDetail | null> {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from("projects")
    .select("id, name, client_name, client_email, status, sow_document_url, agency_id")
    .eq("id", projectId)
    .maybeSingle()

  if (error) throw new Error(`Failed to fetch project: ${error.message}`)
  return data
}

export async function createProject(
  agencyId: string,
  name: string,
  clientId: string,
  clientName: string,
  clientEmail: string
): Promise<string> {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from("projects")
    .insert({
      agency_id: agencyId,
      name,
      client_id: clientId,
      client_name: clientName,
      client_email: clientEmail,
      status: "active",
    })
    .select("id")
    .single()

  if (error) throw new Error(`Failed to create project: ${error.message}`)
  return data.id
}

export async function getProjectsForClient(clientId: string): Promise<ProjectRow[]> {
  const supabase = createSupabaseAdminClient()

  const { data: projects, error } = await supabase
    .from("projects")
    .select("id, name, client_name, client_email, status, sow_document_url, created_at")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })

  if (error) throw new Error(`Failed to fetch projects: ${error.message}`)
  if (!projects?.length) return []

  const projectIds = projects.map((p) => p.id)

  const { data: deliverables, error: delError } = await supabase
    .from("deliverables")
    .select("project_id, is_verified")
    .in("project_id", projectIds)

  if (delError) throw new Error(`Failed to fetch deliverable counts: ${delError.message}`)

  const countMap: Record<string, { total: number; verified: number }> = {}
  for (const d of deliverables ?? []) {
    if (!countMap[d.project_id]) countMap[d.project_id] = { total: 0, verified: 0 }
    countMap[d.project_id].total++
    if (d.is_verified) countMap[d.project_id].verified++
  }

  return projects.map((p) => ({
    ...p,
    deliverable_count: countMap[p.id]?.total ?? 0,
    verified_count: countMap[p.id]?.verified ?? 0,
  }))
}

export async function getProjectStatus(projectId: string): Promise<string | null> {
  const supabase = createSupabaseAdminClient()
  const { data } = await supabase
    .from("projects")
    .select("status")
    .eq("id", projectId)
    .maybeSingle()
  return data?.status ?? null
}

export async function approveChecklist(projectId: string): Promise<void> {
  const supabase = createSupabaseAdminClient()

  const { error } = await supabase
    .from("projects")
    .update({ status: "active" })
    .eq("id", projectId)

  if (error) throw new Error(`Failed to approve checklist: ${error.message}`)
}

export type ProjectEmailContext = {
  clientName: string
  clientEmail: string
  projectName: string
  agencyName: string
}

export async function getProjectEmailContext(
  projectId: string
): Promise<ProjectEmailContext | null> {
  const supabase = createSupabaseAdminClient()

  const { data: project, error: pErr } = await supabase
    .from("projects")
    .select("client_name, client_email, name, agency_id")
    .eq("id", projectId)
    .maybeSingle()

  if (pErr || !project) return null

  const { data: agency, error: aErr } = await supabase
    .from("agencies")
    .select("name")
    .eq("id", project.agency_id)
    .maybeSingle()

  if (aErr) return null

  return {
    clientName: project.client_name,
    clientEmail: project.client_email,
    projectName: project.name ?? "Your Project",
    agencyName: agency?.name ?? "Your Agency",
  }
}

export async function updateProjectSowUrl(
  projectId: string,
  sowUrl: string
): Promise<void> {
  const supabase = createSupabaseAdminClient()

  const { error } = await supabase
    .from("projects")
    .update({ sow_document_url: sowUrl })
    .eq("id", projectId)

  if (error) throw new Error(`Failed to update SOW URL: ${error.message}`)
}

export async function getAgencyIdByEmail(email: string): Promise<string | null> {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from("agencies")
    .select("id")
    .eq("owner_email", email)
    .maybeSingle()

  if (error) throw new Error(`Failed to fetch agency: ${error.message}`)
  return data?.id ?? null
}
