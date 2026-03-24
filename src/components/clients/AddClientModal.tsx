"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { UserPlus } from "lucide-react"

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
import { createClientAction } from "@/app/dashboard/clients/actions"

export function AddClientModal() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [company, setCompany] = React.useState("")
  const [notes, setNotes] = React.useState("")

  function resetForm() {
    setName("")
    setEmail("")
    setPhone("")
    setCompany("")
    setNotes("")
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError("Name is required."); return }
    setLoading(true)
    setError(null)

    const result = await createClientAction({
      name: name.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      company: company.trim() || null,
      notes: notes.trim() || null,
    })

    setLoading(false)
    if (!result.success || !result.clientId) {
      setError(result.error ?? "Failed to create client.")
      return
    }

    setOpen(false)
    resetForm()
    router.push(`/dashboard/clients/${result.clientId}`)
  }

  return (
    <>
      <Button size="lg" className="h-9 rounded-full px-5" onClick={() => setOpen(true)}>
        <UserPlus />
        Add Client
      </Button>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm() }}>
        <DialogContent className="max-w-md rounded-[1.5rem]">
          <DialogHeader>
            <DialogTitle>Add a new client</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-2 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  placeholder="Jane Smith"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label>Company</Label>
                <Input
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  disabled={loading}
                  placeholder="Acme Corp"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  placeholder="jane@acme.com"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Internal notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={loading}
                  placeholder="Notes only visible to your team…"
                  rows={3}
                />
              </div>
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
                {loading ? "Creating…" : "Create client"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
