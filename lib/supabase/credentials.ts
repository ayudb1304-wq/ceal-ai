import { createSupabaseAdminClient } from "@/lib/supabase/server"
import { encrypt, decrypt } from "@/lib/crypto"

export type CredentialRow = {
  id: string
  project_id: string
  label: string
  // plaintext value — only returned server-side, never stored
  value: string
  created_at: string
}

export async function getCredentials(projectId: string): Promise<CredentialRow[]> {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from("credentials")
    .select("id, project_id, label, encrypted_value, iv, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true })

  if (error) throw new Error(`Failed to fetch credentials: ${error.message}`)

  return (data ?? []).map((row) => ({
    id: row.id,
    project_id: row.project_id,
    label: row.label,
    value: decrypt(row.encrypted_value, row.iv),
    created_at: row.created_at,
  }))
}

export async function createCredential(
  projectId: string,
  label: string,
  value: string
): Promise<CredentialRow> {
  const supabase = createSupabaseAdminClient()

  const { encryptedValue, iv } = encrypt(value)

  const { data, error } = await supabase
    .from("credentials")
    .insert({
      project_id: projectId,
      label,
      encrypted_value: encryptedValue,
      iv,
    })
    .select("id, project_id, label, created_at")
    .single()

  if (error) throw new Error(`Failed to create credential: ${error.message}`)

  return {
    id: data.id,
    project_id: data.project_id,
    label: data.label,
    value, // return plaintext back to caller so UI can update
    created_at: data.created_at,
  }
}

export async function updateCredential(
  id: string,
  label: string,
  value: string
): Promise<void> {
  const supabase = createSupabaseAdminClient()

  const { encryptedValue, iv } = encrypt(value)

  const { error } = await supabase
    .from("credentials")
    .update({ label, encrypted_value: encryptedValue, iv })
    .eq("id", id)

  if (error) throw new Error(`Failed to update credential: ${error.message}`)
}

export async function deleteCredential(id: string): Promise<void> {
  const supabase = createSupabaseAdminClient()

  const { error } = await supabase.from("credentials").delete().eq("id", id)
  if (error) throw new Error(`Failed to delete credential: ${error.message}`)
}
