"use client"

import * as React from "react"
import { Check, Copy, ExternalLink, Mail, RefreshCw, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { publishProjectAction, resendPortalEmailAction } from "@/app/dashboard/actions"
import type { ProjectStatus } from "@/lib/supabase/projects"

type Props = {
  projectId: string
  status: ProjectStatus
}

export function PublishButton({ projectId, status }: Props) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [portalUrl, setPortalUrl] = React.useState<string | null>(null)
  const [clientEmail, setClientEmail] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)
  const [resending, setResending] = React.useState(false)
  const [resendStatus, setResendStatus] = React.useState<"idle" | "sent" | "error">("idle")
  const [pendingCount, setPendingCount] = React.useState<number | null>(null)

  const disabled = status !== "active"

  async function doPublish(force: boolean) {
    setLoading(true)
    setError(null)
    const result = await publishProjectAction(projectId, force)
    setLoading(false)
    if (result.pendingWarning !== undefined) {
      setPendingCount(result.pendingWarning)
      return
    }
    if (!result.success) {
      setError(result.error ?? "Failed to publish")
      return
    }
    setPortalUrl(result.portalUrl ?? null)
    setClientEmail(result.clientEmail ?? null)
    setResendStatus("idle")
  }

  async function handlePublish() {
    await doPublish(false)
  }

  async function handleConfirmPublish() {
    setPendingCount(null)
    await doPublish(true)
  }

  async function handleCopy() {
    if (!portalUrl) return
    try {
      await navigator.clipboard.writeText(portalUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard may fail in non-secure contexts
    }
  }

  async function handleResend() {
    if (!portalUrl) return
    setResending(true)
    setResendStatus("idle")
    const result = await resendPortalEmailAction(projectId, portalUrl)
    setResending(false)
    setResendStatus(result.success ? "sent" : "error")
  }

  function handleClose() {
    setPortalUrl(null)
    setClientEmail(null)
    setCopied(false)
    setResendStatus("idle")
  }

  return (
    <>
      <Button
        size="lg"
        className="shrink-0 rounded-full px-5"
        disabled={disabled || loading}
        onClick={handlePublish}
        title={disabled ? "Approve the checklist first to enable publishing" : undefined}
      >
        <Send />
        {loading ? "Publishing…" : "Publish to Client"}
      </Button>

      {/* Pending deliverables warning */}
      <Dialog open={pendingCount !== null} onOpenChange={(o) => { if (!o) setPendingCount(null) }}>
        <DialogContent className="max-w-sm rounded-[1.5rem]">
          <DialogHeader>
            <DialogTitle>Unverified deliverables</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{pendingCount}</span>{" "}
            deliverable{pendingCount !== 1 ? "s are" : " is"} still pending. The client will see
            them as unverified in their portal. Publish anyway?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingCount(null)} disabled={loading}>
              Go back
            </Button>
            <Button onClick={handleConfirmPublish} disabled={loading}>
              {loading ? "Publishing…" : "Publish anyway"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish error modal */}
      {error && !portalUrl && (
        <Dialog open onOpenChange={() => setError(null)}>
          <DialogContent className="max-w-sm rounded-[1.5rem]">
            <DialogHeader>
              <DialogTitle>Publish failed</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-destructive">{error}</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setError(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Success modal */}
      <Dialog open={portalUrl !== null} onOpenChange={(o) => { if (!o) handleClose() }}>
        <DialogContent className="max-w-md rounded-[1.5rem]">
          <DialogHeader>
            <DialogTitle>Client portal published</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Email confirmation */}
            {clientEmail && (
              <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
                <Mail className="size-4 shrink-0 text-emerald-600" />
                <p className="text-sm text-emerald-700">
                  Email sent to <span className="font-medium">{clientEmail}</span>
                </p>
              </div>
            )}

            {/* Portal URL */}
            <div>
              <p className="mb-2 text-sm text-muted-foreground">
                Portal link — expires in 7 days.
              </p>
              <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2.5">
                <code className="min-w-0 flex-1 truncate text-xs">{portalUrl}</code>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={handleCopy}
                  aria-label="Copy link"
                >
                  {copied ? <Check className="text-green-500" /> : <Copy />}
                </Button>
              </div>
            </div>

            {/* Resend email */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={handleResend}
                disabled={resending}
              >
                <RefreshCw className={resending ? "animate-spin" : ""} />
                {resending ? "Sending…" : "Resend email"}
              </Button>
              {resendStatus === "sent" && (
                <span className="flex items-center gap-1 text-xs text-emerald-600">
                  <Check className="size-3" /> Email resent
                </span>
              )}
              {resendStatus === "error" && (
                <span className="text-xs text-destructive">Failed to resend</span>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>Close</Button>
            <Button asChild>
              <a href={portalUrl ?? "#"} target="_blank" rel="noopener noreferrer">
                <ExternalLink />
                Open portal
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
