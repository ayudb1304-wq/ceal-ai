import { randomUUID } from "crypto"
import { createSupabaseAdminClient } from "@/lib/supabase/server"

const TOKEN_TTL_DAYS = 7

export async function publishProject(projectId: string): Promise<string> {
  const supabase = createSupabaseAdminClient()

  const token = randomUUID()
  const expiresAt = new Date(Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await supabase.from("project_magic_links").insert({
    project_id: projectId,
    magic_token: token,
    expires_at: expiresAt,
  })

  if (error) throw new Error(`Failed to create magic link: ${error.message}`)

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000"
  return `${baseUrl}/portal/${token}`
}
