"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { PlusCircle } from "lucide-react"

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
import { createProjectAction } from "@/app/dashboard/actions"

export function NewProjectModal() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [name, setName] = React.useState("")
  const [clientName, setClientName] = React.useState("")
  const [clientEmail, setClientEmail] = React.useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim() || !clientName.trim() || !clientEmail.trim()) {
      setError("All fields are required.")
      return
    }
    setLoading(true)
    const result = await createProjectAction(name.trim(), clientName.trim(), clientEmail.trim())
    setLoading(false)
    if (!result.success) {
      setError(result.error ?? "Something went wrong.")
      return
    }
    setOpen(false)
    setName("")
    setClientName("")
    setClientEmail("")
    router.refresh()
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} size="lg" className="h-9 rounded-full px-5">
        <PlusCircle />
        New Project
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-[1.5rem]">
          <DialogHeader>
            <DialogTitle>Create a new project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="mt-2 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="proj-name">Project name</Label>
              <Input
                id="proj-name"
                placeholder="e.g. Acme Corp Rebrand"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="client-name">Client name</Label>
              <Input
                id="client-name"
                placeholder="e.g. Jane Smith"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="client-email">Client email</Label>
              <Input
                id="client-email"
                type="email"
                placeholder="jane@acme.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating…" : "Create project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
