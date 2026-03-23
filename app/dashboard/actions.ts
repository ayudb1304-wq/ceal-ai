"use server"

import { auth } from "@/auth"
import { getAgencyIdByEmail, createProject, approveChecklist } from "@/lib/supabase/projects"
import { upsertDeliverable, deleteDeliverable } from "@/lib/supabase/deliverables"
import { createCredential, deleteCredential } from "@/lib/supabase/credentials"
import { publishProject } from "@/lib/supabase/magic-links"
import { revalidatePath } from "next/cache"

async function requireAgencyId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.email) throw new Error("Not authenticated")
  const agencyId = await getAgencyIdByEmail(session.user.email)
  if (!agencyId) throw new Error("Agency not found")
  return agencyId
}

// ── Projects ──────────────────────────────────────────────────────────────────

export async function createProjectAction(
  name: string,
  clientName: string,
  clientEmail: string
): Promise<{ success: boolean; projectId?: string; error?: string }> {
  try {
    const agencyId = await requireAgencyId()
    const projectId = await createProject(agencyId, name, clientName, clientEmail)
    revalidatePath("/dashboard")
    return { success: true, projectId }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to create project" }
  }
}

export async function approveChecklistAction(
  projectId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAgencyId() // verifies auth
    await approveChecklist(projectId)
    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to approve checklist" }
  }
}

// ── Deliverables ──────────────────────────────────────────────────────────────

export async function upsertDeliverableAction(
  projectId: string,
  deliverable: { id?: string; title: string; description?: string; requiredFormat?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAgencyId()
    await upsertDeliverable(projectId, deliverable)
    revalidatePath(`/dashboard/projects/${projectId}`)
    revalidatePath("/dashboard")
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to save deliverable" }
  }
}

export async function deleteDeliverableAction(
  projectId: string,
  deliverableId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAgencyId()
    await deleteDeliverable(deliverableId)
    revalidatePath(`/dashboard/projects/${projectId}`)
    revalidatePath("/dashboard")
    return { success: true }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to delete deliverable",
    }
  }
}

// ── Credentials ───────────────────────────────────────────────────────────────

export async function createCredentialAction(
  projectId: string,
  label: string,
  value: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAgencyId()
    await createCredential(projectId, label, value)
    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to save credential",
    }
  }
}

export async function deleteCredentialAction(
  projectId: string,
  credentialId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAgencyId()
    await deleteCredential(credentialId)
    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to delete credential",
    }
  }
}

// ── Publish ───────────────────────────────────────────────────────────────────

export async function publishProjectAction(
  projectId: string
): Promise<{ success: boolean; portalUrl?: string; error?: string }> {
  try {
    await requireAgencyId()
    const portalUrl = await publishProject(projectId)
    // Stub: log to console. Replace with Resend email in Phase 3.
    console.log(`[PUBLISH] Portal URL generated: ${portalUrl}`)
    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true, portalUrl }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to publish project",
    }
  }
}
