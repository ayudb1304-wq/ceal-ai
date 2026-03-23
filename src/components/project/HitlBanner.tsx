"use client"

import * as React from "react"
import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { approveChecklistAction } from "@/app/dashboard/actions"

export function HitlBanner({ projectId }: { projectId: string }) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleApprove() {
    setLoading(true)
    setError(null)
    const result = await approveChecklistAction(projectId)
    setLoading(false)
    if (!result.success) setError(result.error ?? "Failed to approve")
  }

  return (
    <div className="flex items-start gap-3 rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-3.5 dark:border-amber-800/40 dark:bg-amber-900/20">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <div className="flex-1">
        <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
          AI-generated checklist — review required
        </p>
        <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">
          Review and edit the deliverables below, then approve to enable the Publish button.
        </p>
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>
      <Button
        size="sm"
        onClick={handleApprove}
        disabled={loading}
        className="shrink-0 rounded-full"
      >
        {loading ? "Approving…" : "Approve checklist"}
      </Button>
    </div>
  )
}
