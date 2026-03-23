"use client"

import * as React from "react"
import { Send, Copy, Check, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { publishProjectAction } from "@/app/dashboard/actions"
import type { ProjectStatus } from "@/lib/supabase/projects"

type Props = {
  projectId: string
  status: ProjectStatus
}

export function PublishButton({ projectId, status }: Props) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [portalUrl, setPortalUrl] = React.useState<string | null>(null)
  const [copied, setCopied] = React.useState(false)

  const disabled = status !== "active"

  async function handlePublish() {
    setLoading(true)
    setError(null)
    const result = await publishProjectAction(projectId)
    setLoading(false)
    if (!result.success) {
      setError(result.error ?? "Failed to publish")
      return
    }
    setPortalUrl(result.portalUrl ?? null)
  }

  async function handleCopy() {
    if (!portalUrl) return
    try {
      await navigator.clipboard.writeText(portalUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard API may fail in non-secure contexts
    }
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

      {error && !portalUrl && (
        <Dialog open onOpenChange={() => setError(null)}>
          <DialogContent className="max-w-sm rounded-[1.5rem]">
            <DialogHeader>
              <DialogTitle>Publish failed</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-destructive">{error}</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setError(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Dialog
        open={portalUrl !== null}
        onOpenChange={(o) => {
          if (!o) {
            setPortalUrl(null)
            setCopied(false)
          }
        }}
      >
        <DialogContent className="max-w-md rounded-[1.5rem]">
          <DialogHeader>
            <DialogTitle>Client portal link ready</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Share this link with your client. It expires in 7 days.
            </p>
            <div className="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2.5">
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
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPortalUrl(null)
                setCopied(false)
              }}
            >
              Close
            </Button>
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
