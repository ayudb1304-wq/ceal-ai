"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { upsertDeliverableAction } from "@/app/dashboard/actions"
import { DELIVERABLE_FORMATS } from "@/lib/deliverable-formats"
import type { DeliverableRow } from "@/lib/supabase/deliverables"

type Props = {
  projectId: string
  deliverable?: DeliverableRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const FILE_FORMATS = DELIVERABLE_FORMATS.filter((f) => f.type === "file")
const TEXT_FORMATS = DELIVERABLE_FORMATS.filter((f) => f.type === "text")

export function AddEditDeliverableModal({ projectId, deliverable, open, onOpenChange }: Props) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [title, setTitle] = React.useState(deliverable?.title ?? "")
  const [description, setDescription] = React.useState(deliverable?.description ?? "")
  const [requiredFormat, setRequiredFormat] = React.useState(deliverable?.required_format ?? "")

  React.useEffect(() => {
    setTitle(deliverable?.title ?? "")
    setDescription(deliverable?.description ?? "")
    setRequiredFormat(deliverable?.required_format ?? "")
    setError(null)
  }, [deliverable, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) { setError("Title is required."); return }
    setLoading(true)
    setError(null)
    const result = await upsertDeliverableAction(projectId, {
      id: deliverable?.id,
      title: title.trim(),
      description: description.trim() || undefined,
      requiredFormat: requiredFormat || undefined,
    })
    setLoading(false)
    if (!result.success) { setError(result.error ?? "Something went wrong."); return }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[1.5rem]">
        <DialogHeader>
          <DialogTitle>{deliverable ? "Edit deliverable" : "Add deliverable"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="del-title">Title</Label>
            <Input
              id="del-title"
              placeholder="e.g. Vector Logo, Brand Color, Live Site URL"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="del-desc">Description</Label>
            <Textarea
              id="del-desc"
              placeholder="Optional — extra context for the client"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={2}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="del-fmt">Format</Label>
            <div className="relative">
              <select
                id="del-fmt"
                value={requiredFormat}
                onChange={(e) => setRequiredFormat(e.target.value)}
                disabled={loading}
                className="w-full appearance-none rounded-xl border border-border bg-background px-3 py-2.5 pr-8 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
              >
                <option value="">— No format —</option>
                <optgroup label="File uploads">
                  {FILE_FORMATS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </optgroup>
                <optgroup label="Text values">
                  {TEXT_FORMATS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </optgroup>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving…" : deliverable ? "Save changes" : "Add deliverable"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
