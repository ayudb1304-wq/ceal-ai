"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, PlusCircle, UserPlus } from "lucide-react"

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
import { createClientAction } from "@/app/dashboard/clients/actions"

type ClientOption = {
  id: string
  name: string
  email: string | null
  company: string | null
}

type Props = {
  // When coming from a client detail page — client is pre-selected and locked
  lockedClient?: { id: string; name: string; email: string | null }
  // List of existing clients to populate the dropdown
  clients?: ClientOption[]
}

const NEW_CLIENT_VALUE = "__new__"

export function NewProjectModal({ lockedClient, clients = [] }: Props) {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Project fields
  const [name, setName] = React.useState("")

  // Client selection (when not locked)
  const [selectedClientId, setSelectedClientId] = React.useState<string>(
    clients[0]?.id ?? NEW_CLIENT_VALUE
  )

  // New client inline fields
  const [newName, setNewName] = React.useState("")
  const [newEmail, setNewEmail] = React.useState("")
  const [newPhone, setNewPhone] = React.useState("")
  const [newCompany, setNewCompany] = React.useState("")

  const isNewClient = !lockedClient && selectedClientId === NEW_CLIENT_VALUE
  const selectedExisting = !lockedClient && selectedClientId !== NEW_CLIENT_VALUE
    ? clients.find((c) => c.id === selectedClientId) ?? null
    : null

  function resetForm() {
    setName("")
    setSelectedClientId(clients[0]?.id ?? NEW_CLIENT_VALUE)
    setNewName("")
    setNewEmail("")
    setNewPhone("")
    setNewCompany("")
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError("Project name is required.")
      return
    }

    let clientId: string
    let clientName: string
    let clientEmail: string

    if (lockedClient) {
      clientId = lockedClient.id
      clientName = lockedClient.name
      clientEmail = lockedClient.email ?? ""
    } else if (selectedExisting) {
      clientId = selectedExisting.id
      clientName = selectedExisting.name
      clientEmail = selectedExisting.email ?? ""
    } else {
      // Creating a new client inline
      if (!newName.trim()) {
        setError("Client name is required.")
        return
      }
      setLoading(true)
      const clientResult = await createClientAction({
        name: newName.trim(),
        email: newEmail.trim() || null,
        phone: newPhone.trim() || null,
        company: newCompany.trim() || null,
      })
      if (!clientResult.success || !clientResult.clientId) {
        setLoading(false)
        setError(clientResult.error ?? "Failed to create client.")
        return
      }
      clientId = clientResult.clientId
      clientName = newName.trim()
      clientEmail = newEmail.trim()
    }

    setLoading(true)
    const result = await createProjectAction(name.trim(), clientId, clientName, clientEmail)
    setLoading(false)

    if (!result.success) {
      setError(result.error ?? "Something went wrong.")
      return
    }

    setOpen(false)
    resetForm()
    if (result.projectId) {
      router.push(`/dashboard/projects/${result.projectId}`)
    } else {
      router.refresh()
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} size="lg" className="h-9 rounded-full px-5">
        <PlusCircle />
        New Project
      </Button>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm() }}>
        <DialogContent className="max-w-md rounded-[1.5rem]">
          <DialogHeader>
            <DialogTitle>Create a new project</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-2 space-y-4">
            {/* Project name */}
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

            {/* Client section */}
            <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/30 p-4">
              <p className="text-sm font-medium">Client</p>

              {lockedClient ? (
                // Locked — coming from client detail page
                <div className="rounded-xl border border-border bg-background px-3 py-2.5">
                  <p className="text-sm font-medium">{lockedClient.name}</p>
                  {lockedClient.email && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{lockedClient.email}</p>
                  )}
                </div>
              ) : (
                <>
                  {/* Client dropdown */}
                  <div className="relative">
                    <select
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      disabled={loading}
                      className="w-full appearance-none rounded-xl border border-border bg-background px-3 py-2.5 pr-8 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-50"
                    >
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}{c.company ? ` — ${c.company}` : ""}
                        </option>
                      ))}
                      <option value={NEW_CLIENT_VALUE}>+ New client</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>

                  {/* Inline new client fields */}
                  {isNewClient && (
                    <div className="space-y-3 rounded-xl border border-dashed border-border bg-background p-3">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <UserPlus className="size-3.5" />
                        New client details
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Name *</Label>
                          <Input
                            placeholder="Jane Smith"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            disabled={loading}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Company</Label>
                          <Input
                            placeholder="Acme Corp"
                            value={newCompany}
                            onChange={(e) => setNewCompany(e.target.value)}
                            disabled={loading}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Email</Label>
                          <Input
                            type="email"
                            placeholder="jane@acme.com"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            disabled={loading}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Phone</Label>
                          <Input
                            placeholder="+91 98765 43210"
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                            disabled={loading}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => { setOpen(false); resetForm() }}
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
