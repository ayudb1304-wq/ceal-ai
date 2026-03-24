"use client"

import * as React from "react"
import { Building2, CheckCircle2, FileText, Palette, User } from "lucide-react"

import {
  updateProfileAction,
  updateBrandingAction,
  updateLegalAction,
  signOutAction,
} from "@/app/dashboard/settings/actions"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ── Types ──────────────────────────────────────────────────────────────────────

type Tab = "profile" | "branding" | "legal" | "account"
type ActionState = { success: boolean; error?: string } | null

type InitialValues = {
  name: string
  contactName: string
  ownerRole: string
  logoName: string
  brandColor: string
  gstin: string
  bankDetails: string
}

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Agency Profile", icon: Building2 },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "legal", label: "Legal & Tax", icon: FileText },
  { id: "account", label: "Account", icon: User },
]

// ── Shared field components ────────────────────────────────────────────────────

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    </label>
  )
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "flex h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15",
        props.className
      )}
    />
  )
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-28 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15",
        props.className
      )}
    />
  )
}

function FormFeedback({ state }: { state: ActionState }) {
  if (!state) return null
  if (state.success) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700">
        <CheckCircle2 className="size-4 shrink-0" />
        Changes saved.
      </div>
    )
  }
  return (
    <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
      {state.error ?? "Something went wrong."}
    </div>
  )
}

// ── Tab forms ──────────────────────────────────────────────────────────────────

function ProfileForm({ initialValues }: { initialValues: InitialValues }) {
  const [state, formAction, isPending] = React.useActionState(updateProfileAction, null)

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Agency name">
        <TextInput name="name" defaultValue={initialValues.name} placeholder="Ceal Creative" />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your full name">
          <TextInput
            name="contactName"
            defaultValue={initialValues.contactName}
            placeholder="Ayush Dubey"
          />
        </Field>
        <Field label="Your role">
          <TextInput
            name="ownerRole"
            defaultValue={initialValues.ownerRole}
            placeholder="Founder / Account Manager"
          />
        </Field>
      </div>
      <FormFeedback state={state} />
      <Button type="submit" className="h-11 rounded-full px-6" disabled={isPending}>
        {isPending ? "Saving..." : "Save profile"}
      </Button>
    </form>
  )
}

function BrandingForm({ initialValues }: { initialValues: InitialValues }) {
  const [state, formAction, isPending] = React.useActionState(updateBrandingAction, null)
  const [logoName, setLogoName] = React.useState(initialValues.logoName)

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Primary brand color">
        <div className="flex items-center gap-3 rounded-2xl border border-border px-3 py-3">
          <input
            type="color"
            name="brandColor"
            defaultValue={initialValues.brandColor || "#111827"}
            className="size-10 rounded-xl border-0 bg-transparent"
          />
          <TextInput
            name="brandColorText"
            defaultValue={initialValues.brandColor || "#111827"}
            className="h-9 border-0 px-0 focus:border-transparent focus:ring-0"
            readOnly
          />
        </div>
      </Field>

      <Field label="Agency logo" hint="Logo upload to storage coming soon. Filename stored for now.">
        <div className="rounded-3xl border border-dashed border-border bg-card px-4 py-5">
          <input
            type="hidden"
            name="logoName"
            value={logoName}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogoName(e.target.files?.[0]?.name ?? logoName)}
            className="w-full text-sm"
          />
          {logoName && (
            <p className="mt-2 text-xs text-muted-foreground">Current: {logoName}</p>
          )}
        </div>
      </Field>

      <FormFeedback state={state} />
      <Button type="submit" className="h-11 rounded-full px-6" disabled={isPending}>
        {isPending ? "Saving..." : "Save branding"}
      </Button>
    </form>
  )
}

function LegalForm({ initialValues }: { initialValues: InitialValues }) {
  const [state, formAction, isPending] = React.useActionState(updateLegalAction, null)

  return (
    <form action={formAction} className="space-y-5">
      <Field label="GSTIN">
        <TextInput
          name="gstin"
          defaultValue={initialValues.gstin}
          placeholder="22AAAAA0000A1Z5"
        />
      </Field>
      <Field label="Bank details" hint="Account name, account number, IFSC, branch.">
        <TextArea
          name="bankDetails"
          defaultValue={initialValues.bankDetails}
          placeholder="Account name, account number, IFSC, branch"
        />
      </Field>
      <FormFeedback state={state} />
      <Button type="submit" className="h-11 rounded-full px-6" disabled={isPending}>
        {isPending ? "Saving..." : "Save legal details"}
      </Button>
    </form>
  )
}

function AccountSection({ ownerEmail }: { ownerEmail: string }) {
  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-border/70 bg-card p-5">
        <p className="text-sm font-medium">Connected account</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Signed in with Google as{" "}
          <span className="font-medium text-foreground">{ownerEmail}</span>.
        </p>
      </div>

      <div className="rounded-[2rem] border border-destructive/20 bg-destructive/5 p-5">
        <p className="text-sm font-medium text-destructive">Sign out</p>
        <p className="mt-1 text-sm text-muted-foreground">
          You will be redirected to the landing page.
        </p>
        <form action={signOutAction} className="mt-4">
          <Button
            type="submit"
            variant="outline"
            className="h-10 rounded-full border-destructive/30 px-5 text-destructive hover:bg-destructive/5 hover:text-destructive"
          >
            Sign out
          </Button>
        </form>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export function SettingsTabs({
  initialValues,
  ownerEmail,
}: {
  initialValues: InitialValues
  ownerEmail: string
}) {
  const [activeTab, setActiveTab] = React.useState<Tab>("profile")

  return (
    <div className="flex flex-col gap-6 md:flex-row md:gap-8">
      {/* Tab navigation */}
      <nav className="flex shrink-0 gap-1 overflow-x-auto md:w-44 md:flex-col md:overflow-visible">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm transition-colors",
              activeTab === id
                ? "bg-primary/10 font-medium text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </button>
        ))}
      </nav>

      {/* Tab content */}
      <div className="min-w-0 flex-1 rounded-[2rem] border border-border/70 bg-card p-6 sm:p-8">
        {activeTab === "profile" && <ProfileForm initialValues={initialValues} />}
        {activeTab === "branding" && <BrandingForm initialValues={initialValues} />}
        {activeTab === "legal" && <LegalForm initialValues={initialValues} />}
        {activeTab === "account" && <AccountSection ownerEmail={ownerEmail} />}
      </div>
    </div>
  )
}
