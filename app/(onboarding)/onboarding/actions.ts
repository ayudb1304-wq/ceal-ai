"use server"

import { saveOnboardingByEmail, type OnboardingFormValues } from "@/lib/supabase/onboarding"
import type { ExtractSowState } from "@/src/components/onboarding/sow-extraction-state"

export async function completeOnboardingAction(
  email: string,
  values: OnboardingFormValues
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
    await saveOnboardingByEmail(email, values)
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
