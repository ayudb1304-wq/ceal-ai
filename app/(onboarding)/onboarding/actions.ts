"use server"

import { saveOnboardingByEmail, type OnboardingFormValues } from "@/lib/supabase/onboarding"
import { upsertDeliverable } from "@/lib/supabase/deliverables"
import { createCredential } from "@/lib/supabase/credentials"
import type { ExtractSowState } from "@/src/components/onboarding/sow-extraction-state"
import type { SowExtractionResult } from "@/lib/ai/sow-types"

export async function completeOnboardingAction(
  email: string,
  values: OnboardingFormValues,
  extractionResult?: SowExtractionResult | null
): Promise<{ success: boolean; error?: string }> {
  if (!email) {
    return { success: false, error: "Missing authenticated email." }
  }

  if (!values.agencyName || !values.clientName || !values.clientEmail) {
    return {
      success: false,
      error: "Agency name, client name, and client email are required to finish onboarding.",
    }
  }

  try {
    const { projectId } = await saveOnboardingByEmail(email, values)

    if (extractionResult) {
      // Bulk-insert extracted deliverables
      await Promise.all(
        extractionResult.deliverables.map((d) =>
          upsertDeliverable(projectId, {
            title: d.title,
            description: d.description,
            requiredFormat: d.requiredFormat,
          })
        )
      )

      // Bulk-insert extracted credentials with a placeholder value.
      // The agency fills in the real values on the project detail page.
      await Promise.all(
        extractionResult.credentials.map((c) =>
          createCredential(projectId, c.label, "TBD — add value in project")
        )
      )
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unable to complete onboarding.",
    }
  }
}

export async function extractSowDeliverablesAction(
  _previousState: ExtractSowState,
  formData: FormData
): Promise<ExtractSowState> {
  const uploadedFile = formData.get("sowFile")

  if (!(uploadedFile instanceof File)) {
    return {
      status: "error",
      fileName: null,
      result: null,
      error: "Please choose a SOW file first.",
    }
  }

  try {
    const { extractDeliverablesFromSow } = await import("@/lib/ai/sow-extraction")
    const result = await extractDeliverablesFromSow(uploadedFile)

    return {
      status: "success",
      fileName: uploadedFile.name,
      result,
      error: null,
    }
  } catch (error) {
    return {
      status: "error",
      fileName: uploadedFile.name || null,
      result: null,
      error: error instanceof Error ? error.message : "Unable to extract deliverables from the SOW.",
    }
  }
}
