"use client"

import { ArrowRight } from "lucide-react"

type Props = {
  agencyName: string
  logoUrl: string | null
  brandColor: string
  projectName: string
  clientName: string
  onDismiss: () => void
}

export function WelcomeOverlay({ agencyName, logoUrl, brandColor, projectName, clientName, onDismiss }: Props) {
  const initials = agencyName.slice(0, 2).toUpperCase()

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background px-6 text-center">
      {/* Agency identity */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold text-white"
          style={{ backgroundColor: brandColor }}
        >
          {logoUrl ? (
            <img src={logoUrl} alt={agencyName} className="h-16 w-16 rounded-2xl object-cover" />
          ) : (
            initials
          )}
        </div>
        <p className="text-sm font-medium text-muted-foreground">{agencyName}</p>
      </div>

      {/* Headline */}
      <div className="max-w-md space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          Your <span style={{ color: brandColor }}>{projectName}</span> assets are ready for handoff.
        </h1>
        <p className="text-muted-foreground">
          Hello {clientName} — review your deliverables, access your credentials, and sign off when
          you&apos;re ready.
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onDismiss}
        className="mt-10 flex items-center gap-2 rounded-full px-7 py-3 text-sm font-medium text-white shadow-lg transition-opacity hover:opacity-90 active:opacity-80"
        style={{ backgroundColor: brandColor }}
      >
        View My Assets
        <ArrowRight className="size-4" />
      </button>
    </div>
  )
}
