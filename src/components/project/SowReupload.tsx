"use client"

import * as React from "react"
import { CheckCircle2, FileText, LoaderCircle, Sparkles } from "lucide-react"

import { reExtractSowAction } from "@/app/dashboard/actions"
import { Button } from "@/components/ui/button"

type Props = {
  projectId: string
  currentSowUrl: string | null
}

export function SowReupload({ projectId, currentSowUrl }: Props) {
  const [state, formAction, isPending] = React.useActionState(reExtractSowAction, {
    status: "idle",
  })

  // Derive a display name from the storage path (last segment, strip timestamp prefix)
  const currentFileName = currentSowUrl
    ? currentSowUrl.split("/").pop()?.replace(/^\d+_/, "") ?? currentSowUrl
    : null

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        SOW / Project Brief
      </h2>

      <div className="rounded-[1.25rem] border border-border/70 bg-card p-4 space-y-4">
        {/* Current SOW indicator */}
        {currentFileName && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="size-4 shrink-0 text-primary" />
            <span className="truncate">{currentFileName}</span>
          </div>
        )}

        <form action={formAction} className="space-y-3">
          {/* Hidden project ID */}
          <input type="hidden" name="projectId" value={projectId} />

          <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 py-4">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <Sparkles className="size-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {currentFileName ? "Replace SOW" : "Upload SOW"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Gemini will extract deliverables and credentials and append them to the existing
                  checklist.
                </p>
                <input
                  type="file"
                  name="sowFile"
                  accept=".pdf,.docx,.txt,.md"
                  className="mt-3 w-full text-sm"
                  disabled={isPending}
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="h-10 rounded-full px-5"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Extracting with Gemini…
              </>
            ) : (
              <>
                <Sparkles className="size-4" />
                {currentFileName ? "Re-extract deliverables" : "Extract deliverables"}
              </>
            )}
          </Button>
        </form>

        {/* Success result */}
        {state.status === "success" && (
          <div className="flex items-start gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <p className="font-medium text-emerald-700">Extraction complete</p>
              <p className="mt-0.5 text-xs text-emerald-600">
                {state.deliverableCount} deliverable{state.deliverableCount !== 1 ? "s" : ""} and{" "}
                {state.credentialCount} credential{state.credentialCount !== 1 ? "s" : ""} added
                from <span className="font-medium">{state.fileName}</span>.
              </p>
            </div>
          </div>
        )}

        {/* Error */}
        {state.status === "error" && (
          <p className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {state.error}
          </p>
        )}
      </div>
    </section>
  )
}
