import { createSupabaseAdminClient } from "@/lib/supabase/server"
import { upsertClientByEmail } from "@/lib/supabase/clients"

export type OnboardingFormValues = {
  fullName: string
  role: string
  agencyName: string
  logoName: string
  brandColor: string
  gstin: string
  bankDetails: string
  projectName: string
  clientName: string
  clientEmail: string
  sowFileName: string
}

export type OnboardingState = {
  agencyId: string | null
  projectId: string | null
  isComplete: boolean
  initialValues: OnboardingFormValues
}

const defaultOnboardingValues: OnboardingFormValues = {
  fullName: "",
  role: "",
  agencyName: "",
  logoName: "",
  brandColor: "#111827",
  gstin: "",
  bankDetails: "",
  projectName: "",
  clientName: "",
  clientEmail: "",
  sowFileName: "",
}

export async function getOnboardingStateByEmail(email: string): Promise<OnboardingState> {
  const supabase = createSupabaseAdminClient()

  const { data: agency, error: agencyError } = await supabase
    .from("agencies")
    .select("id, name, logo_url, brand_color, gstin, bank_details, contact_name, owner_role")
    .eq("owner_email", email)
    .maybeSingle()

  if (agencyError) {
    throw new Error(`Failed to fetch agency: ${agencyError.message}`)
  }

  if (!agency) {
    return {
      agencyId: null,
      projectId: null,
      isComplete: false,
      initialValues: defaultOnboardingValues,
    }
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, name, client_name, client_email, sow_document_url")
    .eq("agency_id", agency.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (projectError) {
    throw new Error(`Failed to fetch project: ${projectError.message}`)
  }

  return {
    agencyId: agency.id,
    projectId: project?.id ?? null,
    isComplete: Boolean(project),
    initialValues: {
      fullName: agency.contact_name ?? "",
      role: agency.owner_role ?? "",
      agencyName: agency.name ?? "",
      logoName: agency.logo_url ?? "",
      brandColor: agency.brand_color ?? "#111827",
      gstin: agency.gstin ?? "",
      bankDetails: agency.bank_details ?? "",
      projectName: project?.name ?? "",
      clientName: project?.client_name ?? "",
      clientEmail: project?.client_email ?? "",
      sowFileName: project?.sow_document_url ?? "",
    },
  }
}

export async function saveOnboardingByEmail(
  email: string,
  values: OnboardingFormValues
): Promise<{ projectId: string }> {
  const supabase = createSupabaseAdminClient()

  const { data: agency, error: agencyError } = await supabase
    .from("agencies")
    .upsert(
      {
        owner_email: email,
        contact_name: values.fullName,
        owner_role: values.role,
        name: values.agencyName,
        logo_url: values.logoName || null,
        brand_color: values.brandColor || null,
        gstin: values.gstin || null,
        bank_details: values.bankDetails || null,
      },
      {
        onConflict: "owner_email",
      }
    )
    .select("id")
    .single()

  if (agencyError) {
    throw new Error(`Failed to save agency: ${agencyError.message}`)
  }

  const { data: existingProject, error: existingProjectError } = await supabase
    .from("projects")
    .select("id")
    .eq("agency_id", agency.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle()

  if (existingProjectError) {
    throw new Error(`Failed to load project: ${existingProjectError.message}`)
  }

  let projectId: string

  // Ensure a client record exists for this project's client
  const clientId = await upsertClientByEmail(agency.id, {
    name: values.clientName,
    email: values.clientEmail || null,
  })

  if (existingProject) {
    const { error: updateProjectError } = await supabase
      .from("projects")
      .update({
        name: values.projectName || null,
        client_id: clientId,
        client_name: values.clientName,
        client_email: values.clientEmail,
        sow_document_url: values.sowFileName || null,
        status: "draft",
      })
      .eq("id", existingProject.id)

    if (updateProjectError) {
      throw new Error(`Failed to update project: ${updateProjectError.message}`)
    }

    projectId = existingProject.id
  } else {
    const { data: newProject, error: insertProjectError } = await supabase
      .from("projects")
      .insert({
        agency_id: agency.id,
        name: values.projectName || null,
        client_id: clientId,
        client_name: values.clientName,
        client_email: values.clientEmail,
        sow_document_url: values.sowFileName || null,
        status: "draft",
      })
      .select("id")
      .single()

    if (insertProjectError || !newProject) {
      throw new Error(`Failed to create project: ${insertProjectError?.message}`)
    }

    projectId = newProject.id
  }

  return { projectId }
}
