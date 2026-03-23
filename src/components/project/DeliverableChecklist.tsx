"use client"

import * as React from "react"
import { PlusCircle, Pencil, Trash2, CheckCircle2, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { deleteDeliverableAction } from "@/app/dashboard/actions"
import { AddEditDeliverableModal } from "@/src/components/project/AddEditDeliverableModal"
import type { DeliverableRow } from "@/lib/supabase/deliverables"

type Props = {
  projectId: string
  deliverables: DeliverableRow[]
}

export function DeliverableChecklist({ projectId, deliverables }: Props) {
  const [addOpen, setAddOpen] = React.useState(false)
  const [editTarget, setEditTarget] = React.useState<DeliverableRow | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<DeliverableRow | null>(null)
  const [deleting, setDeleting] = React.useState(false)
  const [deleteError, setDeleteError] = React.useState<string | null>(null)

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError(null)
    const result = await deleteDeliverableAction(projectId, deleteTarget.id)
    setDeleting(false)
    if (!result.success) {
      setDeleteError(result.error ?? "Failed to delete")
      return
    }
    setDeleteTarget(null)
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Deliverables
        </h2>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full"
          onClick={() => setAddOpen(true)}
        >
          <PlusCircle />
          Add
        </Button>
      </div>

      {deliverables.length === 0 ? (
        <div className="rounded-[1.25rem] border border-dashed border-border/70 py-10 text-center">
          <p className="text-xs text-muted-foreground">No deliverables yet. Add one above.</p>
        </div>
      ) : (
        <div className="divide-y divide-border/60 rounded-[1.25rem] border border-border/70 bg-card">
          {deliverables.map((d) => (
            <div key={d.id} className="flex items-center gap-3 px-4 py-3">
              {d.is_verified ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
              ) : (
                <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{d.title}</p>
                {(d.description || d.required_format) && (
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {[d.description, d.required_format ? `Format: ${d.required_format}` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </div>
              <Badge
                className={cn(
                  "shrink-0 rounded-full border-0 px-2.5 py-0.5 text-[0.65rem] font-medium",
                  d.is_verified
                    ? "bg-green-500/10 text-green-700 dark:text-green-400"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {d.is_verified ? "Verified" : "Pending"}
              </Badge>
              <div className="flex items-center gap-1">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => setEditTarget(d)}
                  aria-label="Edit deliverable"
                >
                  <Pencil />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => setDeleteTarget(d)}
                  aria-label="Delete deliverable"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add modal */}
      <AddEditDeliverableModal
        projectId={projectId}
        deliverable={null}
        open={addOpen}
        onOpenChange={setAddOpen}
      />

      {/* Edit modal */}
      <AddEditDeliverableModal
        projectId={projectId}
        deliverable={editTarget}
        open={editTarget !== null}
        onOpenChange={(o) => { if (!o) setEditTarget(null) }}
      />

      {/* Delete confirmation */}
      <Dialog open={deleteTarget !== null} onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}>
        <DialogContent className="max-w-sm rounded-[1.5rem]">
          <DialogHeader>
            <DialogTitle>Delete deliverable?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{deleteTarget?.title}</span> will be
            permanently removed from this project.
          </p>
          {deleteError && <p className="text-xs text-destructive">{deleteError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
