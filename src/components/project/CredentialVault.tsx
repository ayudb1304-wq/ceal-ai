"use client"

import * as React from "react"
import { PlusCircle, Eye, EyeOff, Copy, Check, Trash2, KeyRound } from "lucide-react"

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
import {
  createCredentialAction,
  deleteCredentialAction,
} from "@/app/dashboard/actions"
import type { CredentialRow } from "@/lib/supabase/credentials"

type Props = {
  projectId: string
  credentials: CredentialRow[]
}

export function CredentialVault({ projectId, credentials }: Props) {
  const [addOpen, setAddOpen] = React.useState(false)
  const [deleteTarget, setDeleteTarget] = React.useState<CredentialRow | null>(null)
  const [deleting, setDeleting] = React.useState(false)
  const [deleteError, setDeleteError] = React.useState<string | null>(null)

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError(null)
    const result = await deleteCredentialAction(projectId, deleteTarget.id)
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
          Credential Vault
        </h2>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full"
          onClick={() => setAddOpen(true)}
        >
          <PlusCircle />
          Add Credential
        </Button>
      </div>

      {credentials.length === 0 ? (
        <div className="rounded-[1.25rem] border border-dashed border-border/70 py-10 text-center">
          <p className="text-xs text-muted-foreground">
            No credentials stored yet. Add one above.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {credentials.map((cred) => (
            <CredentialCard
              key={cred.id}
              credential={cred}
              onDelete={() => setDeleteTarget(cred)}
            />
          ))}
        </div>
      )}

      {/* Add credential modal */}
      <AddCredentialModal
        projectId={projectId}
        open={addOpen}
        onOpenChange={setAddOpen}
      />

      {/* Delete confirmation */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null)
        }}
      >
        <DialogContent className="max-w-sm rounded-[1.5rem]">
          <DialogHeader>
            <DialogTitle>Delete credential?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{deleteTarget?.label}</span>{" "}
            will be permanently removed from this project.
          </p>
          {deleteError && <p className="text-xs text-destructive">{deleteError}</p>}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
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

function CredentialCard({
  credential,
  onDelete,
}: {
  credential: CredentialRow
  onDelete: () => void
}) {
  const [revealed, setRevealed] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(credential.value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard API may fail in non-secure contexts
    }
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-[1.25rem] border border-border/70 bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted">
            <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
          </span>
          <span className="text-sm font-medium">{credential.label}</span>
        </div>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={onDelete}
          aria-label="Delete credential"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1 rounded-lg bg-muted/60 px-3 py-2">
          <p
            className="truncate font-mono text-xs"
            style={{ filter: revealed ? "none" : "blur(5px)" }}
          >
            {credential.value}
          </p>
        </div>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => setRevealed((r) => !r)}
          aria-label={revealed ? "Hide credential" : "Reveal credential"}
        >
          {revealed ? <EyeOff /> : <Eye />}
        </Button>
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={handleCopy}
          aria-label="Copy to clipboard"
        >
          {copied ? <Check className="text-green-500" /> : <Copy />}
        </Button>
      </div>
    </div>
  )
}

function AddCredentialModal({
  projectId,
  open,
  onOpenChange,
}: {
  projectId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [label, setLabel] = React.useState("")
  const [value, setValue] = React.useState("")

  React.useEffect(() => {
    if (open) {
      setLabel("")
      setValue("")
      setError(null)
    }
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim() || !value.trim()) {
      setError("Both fields are required.")
      return
    }
    setLoading(true)
    setError(null)
    const result = await createCredentialAction(projectId, label.trim(), value.trim())
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
          <DialogTitle>Add credential</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cred-label">Label</Label>
            <Input
              id="cred-label"
              placeholder="e.g. WordPress Admin Login"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cred-value">Value</Label>
            <Input
              id="cred-value"
              placeholder="e.g. admin / p@ssw0rd"
              value={value}
              onChange={(e) => setValue(e.target.value)}
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
              {loading ? "Saving…" : "Add credential"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
