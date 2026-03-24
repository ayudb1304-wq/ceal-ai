import { createSupabaseAdminClient } from "@/lib/supabase/server"

const BUCKET = "deliverable-files"
const SOW_BUCKET = "sow-documents"

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
 * Upload a SOW document for a project.
 * Path: sow-documents/{projectId}/{timestamp}_{filename}
 * Returns the storage path.
 */
export async function uploadSowDocument(projectId: string, file: File): Promise<string> {
  const supabase = createSupabaseAdminClient()

  const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`
  const path = `${projectId}/${safeName}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error } = await supabase.storage.from(SOW_BUCKET).upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  })

  if (error) throw new Error(`SOW upload failed: ${error.message}`)

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
