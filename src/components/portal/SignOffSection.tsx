"use client"

import * as React from "react"
import { Download, ShieldCheck } from "lucide-react"
import confetti from "canvas-confetti"

import { signOffAction } from "@/app/portal/[token]/actions"
import type { PortalDeliverable } from "@/lib/supabase/portal"
import { getCertificateSignedUrl } from "@/lib/supabase/storage"

type Props = {
  projectId: string
  magicLinkId: string
  clientName: string
  agencyName: string
  projectName: string
  deliverables: PortalDeliverable[]
  brandColor: string
  alreadySigned: boolean
  existingCertUrl: string | null
  onSignOff: (certificateUrl: string) => void
  certificateUrl: string | null
}

export function SignOffSection({
  projectId,
  magicLinkId,
  clientName,
  agencyName,
  projectName,
  deliverables,
  brandColor,
  alreadySigned,
  existingCertUrl,
  onSignOff,
  certificateUrl,
}: Props) {
  const [checked, setChecked] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [resolvedCertUrl, setResolvedCertUrl] = React.useState<string | null>(certificateUrl)

  // If already signed (project closed), try to resolve a signed URL for the cert
  React.useEffect(() => {
    if (alreadySigned && existingCertUrl && !resolvedCertUrl) {
      getCertificateSignedUrl(existingCertUrl)
        .then((url) => setResolvedCertUrl(url))
        .catch(() => {})
    }
  }, [alreadySigned, existingCertUrl, resolvedCertUrl])

  async function handleSignOff() {
    if (!checked) return
    setLoading(true)
    setError(null)

    const result = await signOffAction(projectId, magicLinkId, {
      certificateId: crypto.randomUUID(), // will be replaced by audit log ID server-side
      agencyName,
      projectName,
      clientName,
      signedOffAt: new Date().toISOString(),
      deliverables: deliverables.map((d) => ({
        title: d.title,
        required_format: d.required_format,
        is_verified: d.is_verified,
      })),
    })

    setLoading(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    // Confetti 🎉
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: [brandColor, "#ffffff", "#10b981"],
    })

    setResolvedCertUrl(result.certificateUrl)
    onSignOff(result.certificateUrl)
  }

  // Already signed — show success state
  if (alreadySigned) {
    return (
      <div className="rounded-[1.5rem] border border-green-500/30 bg-green-500/5 p-6 text-center">
        <ShieldCheck className="mx-auto mb-3 size-10 text-green-500" />
        <h3 className="font-semibold">Handover complete</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          You have signed off on this project. Thank you, {clientName}.
        </p>
        {resolvedCertUrl && (
          <a
            href={resolvedCertUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white shadow"
            style={{ backgroundColor: brandColor }}
          >
            <Download className="size-4" />
            Download Certificate
          </a>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-[1.5rem] border border-border/70 bg-card p-6">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
        <div className="space-y-1">
          <h3 className="font-semibold">Final sign-off</h3>
          <p className="text-sm text-muted-foreground">
            Confirm receipt of all assets and credentials listed above.
          </p>
        </div>
      </div>

      <label className="mt-5 flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded accent-current cursor-pointer"
          style={{ accentColor: brandColor }}
          disabled={loading}
        />
        <span className="text-sm">
          I, <strong>{clientName}</strong>, confirm receipt of all assets and credentials listed
          above and approve this handover.
        </span>
      </label>

      {error && <p className="mt-3 text-xs text-destructive">{error}</p>}

      <button
        onClick={handleSignOff}
        disabled={!checked || loading}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-medium text-white shadow transition-opacity disabled:opacity-40"
        style={{ backgroundColor: brandColor }}
      >
        <ShieldCheck className="size-4" />
        {loading ? "Signing off…" : "Sign Off & Complete Handover"}
      </button>
    </div>
  )
}
