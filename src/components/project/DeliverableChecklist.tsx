"use client"

import * as React from "react"
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Paperclip,
  Pencil,
  PlusCircle,
  Trash2,
  UploadCloud,
} from "lucide-react"

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
import {
  deleteDeliverableAction,
  uploadDeliverableFileAction,
  toggleVerifiedAction,
} from "@/app/dashboard/actions"
import { AddEditDeliverableModal } from "@/src/components/project/AddEditDeliverableModal"
import type { DeliverableRow } from "@/lib/supabase/deliverables"

// ── Single deliverable row ─────────────────────────────────────────────────────

function DeliverableRow({
  projectId,
  d,
  onEdit,
  onDelete,
}: {
  projectId: string
  d: DeliverableRow
  onEdit: () => void
  onDelete: () => void
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = React.useState(false)
  const [uploadError, setUploadError] = React.useState<string | null>(null)
  const [mismatchWarning, setMismatchWarning] = React.useState<string | null>(
    // Persist mismatch warning in state so it shows after upload
    null
  )
  const [toggling, setToggling] = React.useState(false)

  // Derive display filename from storage path (last segment)
  const fileName = d.file_url ? d.file_url.split("/").pop() ?? d.file_url : null

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError(null)
    setMismatchWarning(null)

    const formData = new FormData()
    formData.append("file", file)

    const result = await uploadDeliverableFileAction(
      projectId,
      d.id,
      d.required_format ?? null,
      formData
    )

    setUploading(false)

    if (!result.success) {
      setUploadError(result.error ?? "Upload failed.")
      return
    }

    if (result.mismatch) {
      setMismatchWarning(result.mismatch)
    }

    // Reset input so the same file can be re-selected after a replace
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  async function handleToggleVerified() {
    setToggling(true)
    await toggleVerifiedAction(projectId, d.id, !d.is_verified)
    setToggling(false)
  }

  return (
    <div className="space-y-2 px-4 py-3">
      {/* Top row: status icon + title + badges + actions */}
      <div className="flex items-center gap-3">
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
            onClick={onEdit}
            aria-label="Edit deliverable"
          >
            <Pencil />
          </Button>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={onDelete}
            aria-label="Delete deliverable"
            className="text-destructive hover:text-destructive"
          >
            <Trash2 />
          </Button>
        </div>
      </div>

      {/* File row */}
      <div className="ml-7 flex flex-wrap items-center gap-2">
        {fileName ? (
          <span className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            <Paperclip className="size-3 shrink-0" />
            <span className="max-w-[180px] truncate">{fileName}</span>
          </span>
        ) : null}

        {/* Upload / Replace button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
        >
          <UploadCloud className="size-3 shrink-0" />
          {uploading ? "Uploading…" : fileName ? "Replace" : "Upload file"}
        </button>

        {/* Manual verify toggle — only shown when file is uploaded */}
        {fileName && (
          <button
            type="button"
            onClick={handleToggleVerified}
            disabled={toggling}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition-colors disabled:opacity-50",
              d.is_verified
                ? "bg-green-500/10 text-green-700 hover:bg-green-500/20"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            )}
          >
            <CheckCircle2 className="size-3 shrink-0" />
            {d.is_verified ? "Mark unverified" : "Mark verified"}
          </button>
        )}
      </div>

      {/* Mismatch warning */}
      {mismatchWarning && (
        <div className="ml-7 flex items-center gap-1.5 text-xs text-amber-600">
          <AlertTriangle className="size-3 shrink-0" />
          {mismatchWarning} — file saved but marked as pending.
        </div>
      )}

      {/* Upload error */}
      {uploadError && (
        <p className="ml-7 text-xs text-destructive">{uploadError}</p>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}

// ── Checklist ──────────────────────────────────────────────────────────────────

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
            <DeliverableRow
              key={d.id}
              projectId={projectId}
              d={d}
              onEdit={() => setEditTarget(d)}
              onDelete={() => setDeleteTarget(d)}
            />
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
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}
      >
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
