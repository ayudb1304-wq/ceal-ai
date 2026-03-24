import { createSupabaseAdminClient } from "@/lib/supabase/server"

export type ClientRow = {
  id: string
  agency_id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  notes: string | null
  project_count: number
  created_at: string
}

export type ClientDetail = {
  id: string
  agency_id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  notes: string | null
  created_at: string
}

export type ClientFields = {
  name: string
  email?: string | null
  phone?: string | null
  company?: string | null
  notes?: string | null
}

export async function getClientsForAgency(agencyId: string): Promise<ClientRow[]> {
  const supabase = createSupabaseAdminClient()

  const { data: clients, error } = await supabase
    .from("clients")
    .select("id, agency_id, name, email, phone, company, notes, created_at")
    .eq("agency_id", agencyId)
    .order("created_at", { ascending: false })

  if (error) throw new Error(`Failed to fetch clients: ${error.message}`)
  if (!clients?.length) return []

  // Fetch project counts
  const { data: projects, error: pErr } = await supabase
    .from("projects")
    .select("client_id")
    .in("client_id", clients.map((c) => c.id))

  if (pErr) throw new Error(`Failed to fetch project counts: ${pErr.message}`)

  const countMap: Record<string, number> = {}
  for (const p of projects ?? []) {
    if (p.client_id) countMap[p.client_id] = (countMap[p.client_id] ?? 0) + 1
  }

  return clients.map((c) => ({ ...c, project_count: countMap[c.id] ?? 0 }))
}

export async function getClientById(clientId: string): Promise<ClientDetail | null> {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from("clients")
    .select("id, agency_id, name, email, phone, company, notes, created_at")
    .eq("id", clientId)
    .maybeSingle()

  if (error) throw new Error(`Failed to fetch client: ${error.message}`)
  return data
}

export async function createClient(agencyId: string, fields: ClientFields): Promise<string> {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from("clients")
    .insert({ agency_id: agencyId, ...fields })
    .select("id")
    .single()

  if (error) throw new Error(`Failed to create client: ${error.message}`)
  return data.id
}

export async function upsertClientByEmail(
  agencyId: string,
  fields: ClientFields
): Promise<string> {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from("clients")
    .upsert(
      { agency_id: agencyId, ...fields },
      { onConflict: "agency_id,email" }
    )
    .select("id")
    .single()

  if (error) throw new Error(`Failed to upsert client: ${error.message}`)
  return data.id
}

export async function updateClient(clientId: string, fields: Partial<ClientFields>): Promise<void> {
  const supabase = createSupabaseAdminClient()

  const { error } = await supabase
    .from("clients")
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq("id", clientId)

  if (error) throw new Error(`Failed to update client: ${error.message}`)
}

export async function deleteClient(clientId: string): Promise<void> {
  const supabase = createSupabaseAdminClient()

  const { error } = await supabase.from("clients").delete().eq("id", clientId)
  if (error) throw new Error(`Failed to delete client: ${error.message}`)
}
