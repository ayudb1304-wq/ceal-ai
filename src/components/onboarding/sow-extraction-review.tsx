"use client"

import * as React from "react"
import { LoaderCircle, Sparkles } from "lucide-react"

import { extractSowDeliverablesAction } from "@/app/(onboarding)/onboarding/actions"
import { Button } from "@/components/ui/button"
import { initialExtractSowState } from "@/src/components/onboarding/sow-extraction-state"
import type { SowExtractionResult } from "@/lib/ai/sow-types"

export function SowExtractionReview({
  onFileNameChange,
  onExtractionComplete,
}: {
  onFileNameChange: (fileName: string) => void
  onExtractionComplete?: (result: SowExtractionResult) => void
}) {
  const [state, formAction, isPending] = React.useActionState(
    extractSowDeliverablesAction,
    initialExtractSowState
  )

  React.useEffect(() => {
    if (state.status === "success" && state.result) {
      onExtractionComplete?.(state.result)
    }
  }, [state.status, state.result, onExtractionComplete])

  return (
    <div className="space-y-5">
      <form action={formAction} className="space-y-4">
        <div className="rounded-[2rem] border border-dashed border-primary/30 bg-primary/5 p-5">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Sparkles className="size-5" />
            </div>
            <div className="flex-1">
              <input
                type="file"
                name="sowFile"
                accept=".pdf,.docx,.txt,.md"
                onChange={(event) => onFileNameChange(event.target.files?.[0]?.name ?? "")}
                className="w-full text-sm"
              />
              <p className="mt-3 text-sm text-muted-foreground">
                Upload a PDF, DOCX, TXT, or MD file to extract handoff deliverables and technical
                credentials.
              </p>
            </div>
          </div>
        </div>

        <Button type="submit" className="h-11 rounded-full px-6" disabled={isPending}>
          {isPending ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              Extracting with Gemini...
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              Extract deliverables
            </>
          )}
        </Button>
      </form>

      {state.status === "error" ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      ) : null}

      {state.status === "success" && state.result ? (
        <div className="rounded-[2rem] border border-border/70 bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Extracted from {state.fileName}</p>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700">
              {state.result.deliverables.length} deliverable{state.result.deliverables.length !== 1 ? "s" : ""}
              {state.result.credentials.length > 0
                ? ` · ${state.result.credentials.length} credential${state.result.credentials.length !== 1 ? "s" : ""}`
                : ""}
            </span>
          </div>

          <div className="mt-4 h-48 overflow-y-auto rounded-2xl border border-border/50 bg-background p-3 space-y-2">
            {state.result.deliverables.length > 0 ? (
              state.result.deliverables.map((deliverable) => (
                <div
                  key={`${deliverable.title}-${deliverable.requiredFormat}`}
                  className="rounded-xl border border-border/60 px-4 py-3"
                >
                  <p className="text-sm font-medium">{deliverable.title}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs">
                    {deliverable.requiredFormat ? (
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-primary">
                        {deliverable.requiredFormat}
                      </span>
                    ) : null}
                    {deliverable.category ? (
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-muted-foreground">
                        {deliverable.category}
                      </span>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No deliverables were extracted.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
