"use server"

import { revalidatePath } from "next/cache"
import { auth, signOut } from "@/auth"
import { updateAgency } from "@/lib/supabase/agency"

type ActionState = { success: boolean; error?: string } | null

async function requireEmail(): Promise<string> {
  const session = await auth()
  if (!session?.user?.email) throw new Error("Not authenticated")
  return session.user.email
}

export async function updateProfileAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const email = await requireEmail()
    await updateAgency(email, {
      name: (formData.get("name") as string) || undefined,
      contact_name: (formData.get("contactName") as string) || undefined,
      owner_role: (formData.get("ownerRole") as string) || undefined,
    })
    revalidatePath("/dashboard", "layout")
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to save profile." }
  }
}

export async function updateBrandingAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const email = await requireEmail()
    await updateAgency(email, {
      logo_url: (formData.get("logoName") as string) || null,
      brand_color: (formData.get("brandColor") as string) || null,
    })
    revalidatePath("/dashboard", "layout")
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to save branding." }
  }
}

export async function updateLegalAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const email = await requireEmail()
    await updateAgency(email, {
      gstin: (formData.get("gstin") as string) || null,
      bank_details: (formData.get("bankDetails") as string) || null,
    })
    revalidatePath("/dashboard", "layout")
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to save legal details." }
  }
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/" })
}
