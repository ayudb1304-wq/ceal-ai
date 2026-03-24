import { createSupabaseAdminClient } from "@/lib/supabase/server"

const BUCKET = "deliverable-files"

/**
 * Upload a file for a deliverable.
 * Path: deliverable-files/{projectId}/{deliverableId}/{filename}
 * Returns the storage path (used as file_url in the DB).
 */
export async function uploadDeliverableFile(
  projectId: string,
  deliverableId: string,
  file: File
): Promise<string> {
  const supabase = createSupabaseAdminClient()

  const ext = file.name.includes(".") ? file.name.split(".").pop() : ""
  const safeName = `${Date.now()}${ext ? `.${ext}` : ""}`
  const path = `${projectId}/${deliverableId}/${safeName}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: true,
  })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  return path
}

/**
 * Generate a signed download URL valid for 24 hours.
 */
export async function getSignedUrl(path: string): Promise<string> {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24) // 24h

  if (error || !data?.signedUrl) throw new Error(`Failed to generate signed URL: ${error?.message}`)

  return data.signedUrl
}
