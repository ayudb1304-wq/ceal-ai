"use client"

import * as React from "react"
import { Pencil } from "lucide-react"

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
import { updateClientAction } from "@/app/dashboard/clients/actions"
import type { ClientDetail } from "@/lib/supabase/clients"

export function EditClientModal({ client }: { client: ClientDetail }) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  const [name, setName] = React.useState(client.name)
  const [email, setEmail] = React.useState(client.email ?? "")
  const [phone, setPhone] = React.useState(client.phone ?? "")
  const [company, setCompany] = React.useState(client.company ?? "")
  const [notes, setNotes] = React.useState(client.notes ?? "")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) { setError("Name is required."); return }
    setLoading(true)
    setError(null)
    const result = await updateClientAction(client.id, {
      name: name.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      company: company.trim() || null,
      notes: notes.trim() || null,
    })
    setLoading(false)
    if (!result.success) { setError(result.error ?? "Failed to save."); return }
    setSuccess(true)
    setTimeout(() => { setOpen(false); setSuccess(false) }, 800)
  }

  return (
    <>
      <Button variant="outline" size="sm" className="rounded-full" onClick={() => setOpen(true)}>
        <Pencil />
        Edit client
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-[1.5rem]">
          <DialogHeader>
            <DialogTitle>Edit client</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-2 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Name *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} disabled={loading} placeholder="Jane Smith" />
              </div>
              <div className="space-y-1.5">
                <Label>Company</Label>
                <Input value={company} onChange={(e) => setCompany(e.target.value)} disabled={loading} placeholder="Acme Corp" />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={loading} placeholder="+91 98765 43210" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} placeholder="jane@acme.com" />
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
            {success && <p className="text-xs text-emerald-600">Saved!</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save changes"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
