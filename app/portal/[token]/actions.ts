"use server"

import { renderToBuffer } from "@react-pdf/renderer"
import React from "react"

import { writeAuditLog } from "@/lib/supabase/audit-logs"
import { revokePortalToken, closeProject } from "@/lib/supabase/portal"
import { uploadCertificate, getCertificateSignedUrl } from "@/lib/supabase/storage"
import { HnadoverCertificateDocument, type CertificateData } from "@/lib/pdf/certificate"

export type SignOffResult =
  | { success: true; certificateUrl: string }
  | { success: false; error: string }

export async function signOffAction(
  projectId: string,
  magicLinkId: string,
  certData: CertificateData
): Promise<SignOffResult> {
  try {
    // Generate PDF
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = React.createElement(HnadoverCertificateDocument, { data: certData }) as any
    const pdfBuffer = await renderToBuffer(element)

    // Upload certificate to storage
    const certPath = await uploadCertificate(projectId, Buffer.from(pdfBuffer))
    const certificateUrl = await getCertificateSignedUrl(certPath)

    // Close project + save certificate URL in DB
    await closeProject(projectId, certPath)

    // Revoke magic link
    await revokePortalToken(magicLinkId)

    // Log sign-off
    const auditId = await writeAuditLogAndReturnId(projectId)

    // Generate final cert URL with audit ID as certificate ID
    const finalCertData = { ...certData, certificateId: auditId ?? certData.certificateId }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalElement = React.createElement(HnadoverCertificateDocument, { data: finalCertData }) as any
    const finalBuffer = await renderToBuffer(finalElement)
    await uploadCertificate(projectId, Buffer.from(finalBuffer))

    return { success: true, certificateUrl }
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Sign-off failed." }
  }
}

async function writeAuditLogAndReturnId(projectId: string): Promise<string> {
  const { createSupabaseAdminClient } = await import("@/lib/supabase/server")
  const supabase = createSupabaseAdminClient()

  const { data } = await supabase
    .from("audit_logs")
    .insert({
      project_id: projectId,
      actor_user_id: null,
      event_type: "project_signed_off",
      event_label: "Client signed off — handover complete",
      event_metadata: {},
    })
    .select("id")
    .single()

  return data?.id ?? crypto.randomUUID()
}
