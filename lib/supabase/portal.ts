import { createSupabaseAdminClient } from "@/lib/supabase/server"
import { decrypt } from "@/lib/crypto"
import { getSignedUrl } from "@/lib/supabase/storage"
import { isTextFormat } from "@/lib/deliverable-formats"

export type PortalDeliverable = {
  id: string
  title: string
  description: string | null
  required_format: string | null
  is_verified: boolean
  // File deliverables
  file_url: string | null
  signed_url: string | null
  // Text deliverables
  text_value: string | null
}

export type PortalCredential = {
  id: string
  label: string
  value: string // decrypted plaintext
}

export type PortalData = {
  project: {
    id: string
    name: string | null
    client_name: string
    client_email: string
    status: string
    certificate_url: string | null
  }
  agency: {
    name: string
    logo_url: string | null
    brand_color: string | null
  }
  deliverables: PortalDeliverable[]
  credentials: PortalCredential[]
  magicLinkId: string
  isFirstVisit: boolean
}

export type TokenValidationResult =
  | { valid: true; projectId: string; magicLinkId: string; isFirstVisit: boolean }
  | { valid: false; reason: "not_found" | "expired" | "revoked" }

export async function validatePortalToken(token: string): Promise<TokenValidationResult> {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from("project_magic_links")
    .select("id, project_id, expires_at, revoked_at, last_accessed_at")
    .eq("magic_token", token)
    .maybeSingle()

  if (error || !data) return { valid: false, reason: "not_found" }
  if (data.revoked_at) return { valid: false, reason: "revoked" }
  if (new Date(data.expires_at) < new Date()) return { valid: false, reason: "expired" }

  const isFirstVisit = !data.last_accessed_at

  // Update last_accessed_at
  await supabase
    .from("project_magic_links")
    .update({ last_accessed_at: new Date().toISOString() })
    .eq("id", data.id)

  return { valid: true, projectId: data.project_id, magicLinkId: data.id, isFirstVisit }
}

export async function getPortalData(projectId: string, magicLinkId: string, isFirstVisit: boolean): Promise<PortalData> {
  const supabase = createSupabaseAdminClient()

  // Fetch project + agency in parallel
  const { data: project, error: pErr } = await supabase
    .from("projects")
    .select("id, name, client_name, client_email, status, certificate_url, agency_id")
    .eq("id", projectId)
    .single()

  if (pErr || !project) throw new Error("Project not found")

  const { data: agency, error: aErr } = await supabase
    .from("agencies")
    .select("name, logo_url, brand_color")
    .eq("id", project.agency_id)
    .single()

  if (aErr || !agency) throw new Error("Agency not found")

  // Fetch deliverables
  const { data: rawDeliverables, error: dErr } = await supabase
    .from("deliverables")
    .select("id, title, description, required_format, is_verified, file_url, text_value")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true })

  if (dErr) throw new Error("Failed to fetch deliverables")

  // Generate signed URLs for verified file deliverables
  const deliverables: PortalDeliverable[] = await Promise.all(
    (rawDeliverables ?? []).map(async (d) => {
      let signed_url: string | null = null
      if (d.is_verified && d.file_url && !isTextFormat(d.required_format)) {
        try { signed_url = await getSignedUrl(d.file_url) } catch { /* non-fatal */ }
      }
      return { ...d, signed_url }
    })
  )

  // Fetch + decrypt credentials
  const { data: rawCreds, error: cErr } = await supabase
    .from("credentials")
    .select("id, label, encrypted_value, iv")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true })

  if (cErr) throw new Error("Failed to fetch credentials")

  const credentials: PortalCredential[] = (rawCreds ?? []).map((c) => ({
    id: c.id,
    label: c.label,
    value: decrypt(c.encrypted_value, c.iv),
  }))

  return {
    project: {
      id: project.id,
      name: project.name,
      client_name: project.client_name,
      client_email: project.client_email,
      status: project.status,
      certificate_url: project.certificate_url,
    },
    agency: {
      name: agency.name,
      logo_url: agency.logo_url,
      brand_color: agency.brand_color,
    },
    deliverables,
    credentials,
    magicLinkId,
    isFirstVisit,
  }
}

export async function revokePortalToken(magicLinkId: string): Promise<void> {
  const supabase = createSupabaseAdminClient()
  await supabase
    .from("project_magic_links")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", magicLinkId)
}

export async function closeProject(projectId: string, certificateUrl: string): Promise<void> {
  const supabase = createSupabaseAdminClient()
  await supabase
    .from("projects")
    .update({ status: "closed", certificate_url: certificateUrl })
    .eq("id", projectId)
}
