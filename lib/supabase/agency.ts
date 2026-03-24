import { createSupabaseAdminClient } from "@/lib/supabase/server"

type AgencyFields = {
  name?: string
  contact_name?: string
  owner_role?: string
  logo_url?: string | null
  brand_color?: string | null
  gstin?: string | null
  bank_details?: string | null
}

export async function updateAgency(ownerEmail: string, fields: AgencyFields): Promise<void> {
  const supabase = createSupabaseAdminClient()

  const { error } = await supabase
    .from("agencies")
    .update(fields)
    .eq("owner_email", ownerEmail)

  if (error) throw new Error(`Failed to update agency: ${error.message}`)
}
