"use server"

import { auth } from "@/auth"
import {
  getAgencyIdByEmail,
  createProject,
  approveChecklist,
  updateProjectSowUrl,
} from "@/lib/supabase/projects"
import {
  upsertDeliverable,
  deleteDeliverable,
  updateDeliverableFile,
  setDeliverableVerified,
} from "@/lib/supabase/deliverables"
import { createCredential, deleteCredential } from "@/lib/supabase/credentials"
import { publishProject } from "@/lib/supabase/magic-links"
import { uploadDeliverableFile, uploadSowDocument } from "@/lib/supabase/storage"
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

// ── File uploads ──────────────────────────────────────────────────────────────

export async function uploadDeliverableFileAction(
  projectId: string,
  deliverableId: string,
  requiredFormat: string | null,
  formData: FormData
): Promise<{ success: boolean; isVerified?: boolean; mismatch?: string; error?: string }> {
  try {
    await requireAgencyId()

    const file = formData.get("file")
    if (!(file instanceof File) || file.size === 0) {
      return { success: false, error: "No file selected." }
    }

    if (file.size > 50 * 1024 * 1024) {
      return { success: false, error: "File exceeds the 50 MB limit." }
    }

    const storagePath = await uploadDeliverableFile(projectId, deliverableId, file)

    // Basic Software Probe: check extension against required_format
    const uploadedExt = file.name.includes(".")
      ? `.${file.name.split(".").pop()?.toLowerCase()}`
      : ""
    const expectedExt = requiredFormat?.toLowerCase().trim() ?? ""
    const isVerified = Boolean(expectedExt && uploadedExt === expectedExt)
    const mismatch =
      expectedExt && !isVerified
        ? `Expected ${expectedExt}, got ${uploadedExt || "unknown"}`
        : undefined

    await updateDeliverableFile(deliverableId, storagePath, isVerified)

    revalidatePath(`/dashboard/projects/${projectId}`)
    revalidatePath("/dashboard")
    return { success: true, isVerified, mismatch }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Upload failed." }
  }
}

export async function toggleVerifiedAction(
  projectId: string,
  deliverableId: string,
  isVerified: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAgencyId()
    await setDeliverableVerified(deliverableId, isVerified)
    revalidatePath(`/dashboard/projects/${projectId}`)
    revalidatePath("/dashboard")
    return { success: true }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update status." }
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

// ── SOW re-extraction ─────────────────────────────────────────────────────────

export type ReExtractSowState =
  | { status: "idle" }
  | { status: "success"; fileName: string; deliverableCount: number; credentialCount: number }
  | { status: "error"; error: string }

export async function reExtractSowAction(
  _prevState: ReExtractSowState,
  formData: FormData
): Promise<ReExtractSowState> {
  try {
    const session = await (await import("@/auth")).auth()
    if (!session?.user?.email) return { status: "error", error: "Not authenticated." }

    const projectId = formData.get("projectId") as string
    const file = formData.get("sowFile")

    if (!projectId) return { status: "error", error: "Missing project ID." }
    if (!(file instanceof File) || file.size === 0) {
      return { status: "error", error: "Please select a SOW file." }
    }

    // Upload SOW to storage and update project record
    const sowPath = await uploadSowDocument(projectId, file)
    await updateProjectSowUrl(projectId, sowPath)

    // Run Gemini extraction
    const { extractDeliverablesFromSow } = await import("@/lib/ai/sow-extraction")
    const result = await extractDeliverablesFromSow(file)

    // Append deliverables (don't replace existing ones)
    await Promise.all(
      result.deliverables.map((d) =>
        upsertDeliverable(projectId, {
          title: d.title,
          description: d.description,
          requiredFormat: d.requiredFormat,
        })
      )
    )

    // Append credentials with placeholder value
    await Promise.all(
      result.credentials.map((c) =>
        createCredential(projectId, c.label, "TBD — add value in project")
      )
    )

    revalidatePath(`/dashboard/projects/${projectId}`)
    revalidatePath("/dashboard")

    return {
      status: "success",
      fileName: file.name,
      deliverableCount: result.deliverables.length,
      credentialCount: result.credentials.length,
    }
  } catch (e) {
    return { status: "error", error: e instanceof Error ? e.message : "Extraction failed." }
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
