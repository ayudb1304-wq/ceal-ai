"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { getAgencyIdByEmail } from "@/lib/supabase/projects"
import {
  createClient,
  updateClient,
  deleteClient,
  type ClientFields,
} from "@/lib/supabase/clients"

async function requireAgencyId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.email) throw new Error("Not authenticated")
  const agencyId = await getAgencyIdByEmail(session.user.email)
  if (!agencyId) throw new Error("Agency not found")
  return agencyId
}

export async function createClientAction(
  fields: ClientFields
): Promise<{ success: boolean; clientId?: string; error?: string }> {
  try {
    const agencyId = await requireAgencyId()
    const clientId = await createClient(agencyId, fields)
    revalidatePath("/dashboard")
    return { success: true, clientId }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to create client." }
  }
}

export async function updateClientAction(
  clientId: string,
  fields: Partial<ClientFields>
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAgencyId()
    await updateClient(clientId, fields)
    revalidatePath("/dashboard")
    revalidatePath(`/dashboard/clients/${clientId}`)
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update client." }
  }
}

export async function deleteClientAction(
  clientId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAgencyId()
    await deleteClient(clientId)
    revalidatePath("/dashboard")
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to delete client." }
  }
}
