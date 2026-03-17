"use client"

import * as React from "react"
import { FileJson, LoaderCircle, Sparkles } from "lucide-react"

import { extractSowDeliverablesAction } from "@/app/(onboarding)/onboarding/actions"
import { Button } from "@/components/ui/button"
import { initialExtractSowState } from "@/src/components/onboarding/sow-extraction-state"

export function SowExtractionReview({
  onFileNameChange,
}: {
  onFileNameChange: (fileName: string) => void
}) {
  const [state, formAction, isPending] = React.useActionState(
    extractSowDeliverablesAction,
    initialExtractSowState
  )

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
        <div className="space-y-5">
          <div className="rounded-[2rem] border border-border/70 bg-card p-5">
            <p className="text-sm font-medium">Extraction review</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Review the structured output from <span className="font-medium">{state.fileName}</span>
              .
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-[2rem] border border-border/70 bg-card p-5">
              <p className="text-sm font-medium">Deliverables</p>
              <div className="mt-4 space-y-3">
                {state.result.deliverables.length > 0 ? (
                  state.result.deliverables.map((deliverable) => (
                    <div
                      key={`${deliverable.title}-${deliverable.requiredFormat}`}
                      className="rounded-2xl border border-border/60 px-4 py-4"
                    >
                      <p className="text-sm font-medium">{deliverable.title}</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {deliverable.description}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                          {deliverable.requiredFormat || "Format not specified"}
                        </span>
                        <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
                          {deliverable.category || "Uncategorized"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No deliverables were extracted.</p>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-[2rem] border border-border/70 bg-card p-5">
                <p className="text-sm font-medium">Technical credentials</p>
                <div className="mt-4 space-y-3">
                  {state.result.credentials.length > 0 ? (
                    state.result.credentials.map((credential) => (
                      <div
                        key={credential.label}
                        className="rounded-2xl border border-border/60 px-4 py-4"
                      >
                        <p className="text-sm font-medium">{credential.label}</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {credential.description}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No technical credentials were extracted.
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] border border-border/70 bg-card p-5">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileJson className="size-4" />
                  Structured JSON
                </div>
                <pre className="mt-4 overflow-x-auto rounded-2xl bg-background p-4 text-xs text-muted-foreground">
                  {JSON.stringify(state.result, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
