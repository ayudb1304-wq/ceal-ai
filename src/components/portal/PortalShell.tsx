"use client"

import * as React from "react"

import type { PortalData } from "@/lib/supabase/portal"
import { WelcomeOverlay } from "./WelcomeOverlay"
import { AssetTable } from "./AssetTable"
import { PortalCredentialVault } from "./PortalCredentialVault"
import { SignOffSection } from "./SignOffSection"

export function PortalShell({ data }: { data: PortalData }) {
  const [overlayDismissed, setOverlayDismissed] = React.useState(false)
  const [signedOff, setSignedOff] = React.useState(data.project.status === "closed")
  const [certificateUrl, setCertificateUrl] = React.useState<string | null>(null)

  const verifiedCount = data.deliverables.filter((d) => d.is_verified).length
  const brandColor = data.agency.brand_color ?? "#111827"

  return (
    <div className="min-h-screen bg-background">
      {/* Welcome overlay */}
      {!overlayDismissed && (
        <WelcomeOverlay
          agencyName={data.agency.name}
          logoUrl={data.agency.logo_url}
          brandColor={brandColor}
          projectName={data.project.name ?? "Your Project"}
          clientName={data.project.client_name}
          onDismiss={() => setOverlayDismissed(true)}
        />
      )}

      {/* Portal content */}
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {/* Page header */}
        <div className="mb-10 space-y-1">
          <p className="text-xs font-medium uppercase tracking-[0.18em]" style={{ color: brandColor }}>
            {data.agency.name}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {data.project.name ?? "Project Handover"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Hello {data.project.client_name} — your assets are ready for review.
          </p>
        </div>

        {/* Assets */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Assets
            </h2>
            <span className="text-xs text-muted-foreground">
              {verifiedCount} of {data.deliverables.length} verified
            </span>
          </div>
          <AssetTable deliverables={data.deliverables} brandColor={brandColor} />
        </section>

        {/* Credentials */}
        {data.credentials.length > 0 && (
          <section className="mt-10 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Credentials
            </h2>
            <PortalCredentialVault credentials={data.credentials} />
          </section>
        )}

        {/* Sign-off */}
        <section className="mt-10">
          <SignOffSection
            projectId={data.project.id}
            magicLinkId={data.magicLinkId}
            clientName={data.project.client_name}
            agencyName={data.agency.name}
            projectName={data.project.name ?? "Project"}
            deliverables={data.deliverables}
            brandColor={brandColor}
            alreadySigned={signedOff}
            existingCertUrl={data.project.certificate_url}
            onSignOff={(url) => {
              setSignedOff(true)
              setCertificateUrl(url)
            }}
            certificateUrl={certificateUrl}
          />
        </section>
      </div>
    </div>
  )
}
