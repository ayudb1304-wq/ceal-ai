import { createSupabaseAdminClient } from "@/lib/supabase/server"

export type DeliverableRow = {
  id: string
  project_id: string
  title: string
  description: string | null
  required_format: string | null
  is_verified: boolean
  file_url: string | null
  text_value: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export async function getDeliverablesForProject(projectId: string): Promise<DeliverableRow[]> {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from("deliverables")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true })

  if (error) throw new Error(`Failed to fetch deliverables: ${error.message}`)
  return data ?? []
}

export async function upsertDeliverable(
  projectId: string,
  deliverable: {
    id?: string
    title: string
    description?: string
    requiredFormat?: string
  }
): Promise<DeliverableRow> {
  const supabase = createSupabaseAdminClient()

  const payload = {
    project_id: projectId,
    title: deliverable.title,
    description: deliverable.description ?? null,
    required_format: deliverable.requiredFormat ?? null,
  }

  let result

  if (deliverable.id) {
    const { data, error } = await supabase
      .from("deliverables")
      .update(payload)
      .eq("id", deliverable.id)
      .select()
      .single()
    if (error) throw new Error(`Failed to update deliverable: ${error.message}`)
    result = data
  } else {
    const { data, error } = await supabase
      .from("deliverables")
      .insert(payload)
      .select()
      .single()
    if (error) throw new Error(`Failed to create deliverable: ${error.message}`)
    result = data
  }

  return result
}

export async function updateDeliverableFile(
  id: string,
  fileUrl: string,
  isVerified: boolean
): Promise<void> {
  const supabase = createSupabaseAdminClient()

  const { error } = await supabase
    .from("deliverables")
    .update({ file_url: fileUrl, is_verified: isVerified })
    .eq("id", id)

  if (error) throw new Error(`Failed to update deliverable file: ${error.message}`)
}

export async function setDeliverableVerified(id: string, isVerified: boolean): Promise<void> {
  const supabase = createSupabaseAdminClient()

  const { error } = await supabase
    .from("deliverables")
    .update({ is_verified: isVerified })
    .eq("id", id)

  if (error) throw new Error(`Failed to update verification status: ${error.message}`)
}

export async function updateDeliverableTextValue(
  id: string,
  textValue: string
): Promise<void> {
  const supabase = createSupabaseAdminClient()

  const { error } = await supabase
    .from("deliverables")
    .update({
      text_value: textValue || null,
      is_verified: textValue.trim().length > 0,
    })
    .eq("id", id)

  if (error) throw new Error(`Failed to update deliverable value: ${error.message}`)
}

export async function deleteDeliverable(id: string): Promise<void> {
  const supabase = createSupabaseAdminClient()

  const { error } = await supabase.from("deliverables").delete().eq("id", id)
  if (error) throw new Error(`Failed to delete deliverable: ${error.message}`)
}
