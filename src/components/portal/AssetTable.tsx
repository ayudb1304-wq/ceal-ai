"use client"

import * as React from "react"
import { CheckCircle2, Clock, Copy, Download, Check } from "lucide-react"

import { getFormat, isTextFormat } from "@/lib/deliverable-formats"
import type { PortalDeliverable } from "@/lib/supabase/portal"

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = React.useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* noop */ }
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
    >
      {copied ? <Check className="size-3 text-green-500" /> : <Copy className="size-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  )
}

export function AssetTable({
  deliverables,
  brandColor,
}: {
  deliverables: PortalDeliverable[]
  brandColor: string
}) {
  if (deliverables.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-border/70 py-12 text-center">
        <p className="text-sm text-muted-foreground">No assets have been added yet.</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-border/60 overflow-hidden rounded-[1.5rem] border border-border/70 bg-card">
      {deliverables.map((d) => {
        const fmt = getFormat(d.required_format)
        const isText = isTextFormat(d.required_format)

        return (
          <div key={d.id} className="flex items-center gap-4 px-5 py-4">
            {/* Status icon */}
            {d.is_verified ? (
              <CheckCircle2 className="size-4 shrink-0 text-green-500" />
            ) : (
              <Clock className="size-4 shrink-0 text-muted-foreground" />
            )}

            {/* Title + description */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{d.title}</p>
              {d.description && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{d.description}</p>
              )}
            </div>

            {/* Format badge */}
            {fmt && (
              <span className="hidden shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-[0.65rem] font-medium text-muted-foreground sm:inline">
                {fmt.value}
              </span>
            )}

            {/* Action */}
            <div className="shrink-0">
              {d.is_verified ? (
                isText && d.text_value ? (
                  /* Text deliverable — show value + copy */
                  <div className="flex items-center gap-2">
                    <span className="hidden max-w-[120px] truncate rounded-lg bg-muted px-2.5 py-1 font-mono text-xs sm:block">
                      {d.text_value}
                    </span>
                    <CopyButton value={d.text_value} />
                  </div>
                ) : d.signed_url ? (
                  /* File deliverable — download */
                  <a
                    href={d.signed_url}
                    download
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: brandColor }}
                  >
                    <Download className="size-3" />
                    Download
                  </a>
                ) : (
                  <span className="rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-700">
                    Verified
                  </span>
                )
              ) : (
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                  Pending
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
