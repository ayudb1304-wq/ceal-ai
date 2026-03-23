"use client"

import * as React from "react"

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
import type { DeliverableRow } from "@/lib/supabase/deliverables"

type Props = {
  projectId: string
  deliverable?: DeliverableRow | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddEditDeliverableModal({ projectId, deliverable, open, onOpenChange }: Props) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [title, setTitle] = React.useState(deliverable?.title ?? "")
  const [description, setDescription] = React.useState(deliverable?.description ?? "")
  const [requiredFormat, setRequiredFormat] = React.useState(deliverable?.required_format ?? "")

  // Sync fields when deliverable prop changes (e.g. opening edit for different row)
  React.useEffect(() => {
    setTitle(deliverable?.title ?? "")
    setDescription(deliverable?.description ?? "")
    setRequiredFormat(deliverable?.required_format ?? "")
    setError(null)
  }, [deliverable, open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      setError("Title is required.")
      return
    }
    setLoading(true)
    setError(null)
    const result = await upsertDeliverableAction(projectId, {
      id: deliverable?.id,
      title: title.trim(),
      description: description.trim() || undefined,
      requiredFormat: requiredFormat.trim() || undefined,
    })
    setLoading(false)
    if (!result.success) {
      setError(result.error ?? "Something went wrong.")
      return
    }
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
              placeholder="e.g. Vector Logo (AI/EPS)"
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
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="del-fmt">Required format</Label>
            <Input
              id="del-fmt"
              placeholder="e.g. .ai, .eps, .pdf"
              value={requiredFormat}
              onChange={(e) => setRequiredFormat(e.target.value)}
              disabled={loading}
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
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
