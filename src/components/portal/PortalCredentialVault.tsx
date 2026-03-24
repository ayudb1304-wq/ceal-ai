"use client"

import * as React from "react"
import { Check, Copy, Eye, EyeOff, KeyRound } from "lucide-react"

import type { PortalCredential } from "@/lib/supabase/portal"

function CredentialCard({ credential }: { credential: PortalCredential }) {
  const [revealed, setRevealed] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(credential.value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* noop */ }
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-[1.25rem] border border-border/70 bg-card p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
          <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
        </span>
        <span className="text-sm font-medium">{credential.label}</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1 rounded-lg bg-muted/60 px-3 py-2">
          <p
            className="truncate font-mono text-xs transition-all duration-200"
            style={{ filter: revealed ? "none" : "blur(5px)" }}
          >
            {credential.value}
          </p>
        </div>
        <button
          onClick={() => setRevealed((r) => !r)}
          aria-label={revealed ? "Hide" : "Reveal"}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
        <button
          onClick={handleCopy}
          aria-label="Copy"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
        </button>
      </div>
    </div>
  )
}

export function PortalCredentialVault({ credentials }: { credentials: PortalCredential[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {credentials.map((c) => (
        <CredentialCard key={c.id} credential={c} />
      ))}
    </div>
  )
}
