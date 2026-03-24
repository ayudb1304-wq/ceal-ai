"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  FileUp,
  Palette,
  ShieldCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { completeOnboardingAction } from "@/app/(onboarding)/onboarding/actions"
import { cn } from "@/lib/utils"
import { SowExtractionReview } from "@/src/components/onboarding/sow-extraction-review"
import type { SowExtractionResult } from "@/lib/ai/sow-types"

const steps = [
  {
    title: "Profile",
    description: "Who is setting up the agency workspace?",
    icon: BriefcaseBusiness,
  },
  {
    title: "Branding",
    description: "Set the client-facing brand details.",
    icon: Palette,
  },
  {
    title: "Legal & Tax",
    description: "Store operational details for handoff confidence.",
    icon: ShieldCheck,
  },
  {
    title: "First Project",
    description: "Upload the SOW and stage the magic moment.",
    icon: FileUp,
  },
]

export type OnboardingWizardValues = {
  fullName: string
  role: string
  agencyName: string
  logoName: string
  brandColor: string
  gstin: string
  bankDetails: string
  projectName: string
  clientName: string
  clientEmail: string
  sowFileName: string
}

const initialFormState: OnboardingWizardValues = {
  fullName: "",
  role: "",
  agencyName: "",
  logoName: "",
  brandColor: "#111827",
  gstin: "",
  bankDetails: "",
  projectName: "",
  clientName: "",
  clientEmail: "",
  sowFileName: "",
}

function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: React.ReactNode
  hint?: string
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
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

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
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

export function AgencyOnboardingWizard({
  initialValues = initialFormState,
  ownerEmail,
}: {
  initialValues?: OnboardingWizardValues
  ownerEmail: string
}) {
  const router = useRouter()
  const [stepIndex, setStepIndex] = React.useState(0)
  const [formState, setFormState] = React.useState<OnboardingWizardValues>(initialValues)
  const [extractionResult, setExtractionResult] = React.useState<SowExtractionResult | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const progressValue = ((stepIndex + 1) / steps.length) * 100
  const currentStep = steps[stepIndex]

  function updateField<Key extends keyof OnboardingWizardValues>(
    key: Key,
    value: OnboardingWizardValues[Key]
  ) {
    setFormState((current) => ({ ...current, [key]: value }))
  }

  function nextStep() {
    setStepIndex((current) => Math.min(current + 1, steps.length - 1))
  }

  function previousStep() {
    setStepIndex((current) => Math.max(current - 1, 0))
  }

  async function finishOnboarding() {
    setIsSubmitting(true)
    setErrorMessage(null)

    const result = await completeOnboardingAction(ownerEmail, formState, extractionResult)

    if (!result.success) {
      setErrorMessage(result.error ?? "Unable to finish onboarding.")
      setIsSubmitting(false)
      return
    }

    router.push("/dashboard")
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.4fr_0.6fr]">
      <aside className="rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
          2-minute setup
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance">
          Set up the agency once. Close projects faster from then on.
        </h2>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          This onboarding is designed to get you from zero to your first structured client handoff
          without slowing down the team.
        </p>

        <div className="mt-6 h-2 rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progressValue}%` }}
          />
        </div>

        <div className="mt-8 space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = index === stepIndex
            const isDone = index < stepIndex

            return (
              <div
                key={step.title}
                className={cn(
                  "rounded-3xl border px-4 py-4 transition",
                  isActive
                    ? "border-primary/30 bg-primary/5"
                    : "border-border/70 bg-background",
                  isDone && "border-emerald-500/20 bg-emerald-500/5"
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "mt-0.5 flex size-10 items-center justify-center rounded-2xl",
                      isDone
                        ? "bg-emerald-500/15 text-emerald-700"
                        : isActive
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isDone ? <CheckCircle2 className="size-5" /> : <Icon className="size-5" />}
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      Step {index + 1}: {step.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </aside>

      <section className="rounded-[2rem] border border-border/70 bg-background p-6 shadow-lg shadow-slate-950/5 sm:p-8">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
          {currentStep.title}
        </p>
        <h3 className="mt-4 text-3xl font-semibold tracking-tight text-balance">
          {currentStep.description}
        </h3>

        <div className="mt-8 space-y-6">
          {stepIndex === 0 ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Your full name">
                <Input
                  value={formState.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                  placeholder="Ayush Dubey"
                />
              </Field>
              <Field label="Your role">
                <Input
                  value={formState.role}
                  onChange={(event) => updateField("role", event.target.value)}
                  placeholder="Founder / Account Manager"
                />
              </Field>
              <Field label="Agency name" hint="This will appear in your future client handoff flow.">
                <Input
                  value={formState.agencyName}
                  onChange={(event) => updateField("agencyName", event.target.value)}
                  placeholder="Ceal Creative"
                />
              </Field>
            </div>
          ) : null}

          {stepIndex === 1 ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Primary brand color">
                <div className="flex items-center gap-3 rounded-2xl border border-border px-3 py-3">
                  <input
                    type="color"
                    value={formState.brandColor}
                    onChange={(event) => updateField("brandColor", event.target.value)}
                    className="size-10 rounded-xl border-0 bg-transparent"
                  />
                  <Input
                    value={formState.brandColor}
                    onChange={(event) => updateField("brandColor", event.target.value)}
                    className="h-9 border-0 px-0 focus:border-transparent focus:ring-0"
                  />
                </div>
              </Field>
              <Field label="Logo upload" hint="Logo upload UI is ready; storage wiring comes with Supabase.">
                <div className="rounded-3xl border border-dashed border-border bg-card px-4 py-5">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      updateField("logoName", event.target.files?.[0]?.name ?? "")
                    }
                    className="w-full text-sm"
                  />
                  <p className="mt-3 text-sm text-muted-foreground">
                    {formState.logoName || "No logo selected yet."}
                  </p>
                </div>
              </Field>
            </div>
          ) : null}

          {stepIndex === 2 ? (
            <div className="grid gap-5">
              <Field label="GSTIN">
                <Input
                  value={formState.gstin}
                  onChange={(event) => updateField("gstin", event.target.value)}
                  placeholder="22AAAAA0000A1Z5"
                />
              </Field>
              <Field
                label="Bank details"
                hint="For now, keep this to essential business payout details."
              >
                <Textarea
                  value={formState.bankDetails}
                  onChange={(event) => updateField("bankDetails", event.target.value)}
                  placeholder="Account name, account number, IFSC, branch"
                />
              </Field>
            </div>
          ) : null}

          {stepIndex === 3 ? (
            <div className="grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="First project name">
                  <Input
                    value={formState.projectName}
                    onChange={(event) => updateField("projectName", event.target.value)}
                    placeholder="Brand Refresh Retainer"
                  />
                </Field>
                <Field label="Client name">
                  <Input
                    value={formState.clientName}
                    onChange={(event) => updateField("clientName", event.target.value)}
                    placeholder="Acme Foods"
                  />
                </Field>
              </div>

              <Field label="Client email">
                <Input
                  type="email"
                  value={formState.clientEmail}
                  onChange={(event) => updateField("clientEmail", event.target.value)}
                  placeholder="team@acmefoods.com"
                />
              </Field>

              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Upload SOW / brief</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Upload the brief and review the structured handoff items extracted by Gemini.
                  </p>
                </div>
                <SowExtractionReview
                  onFileNameChange={(fileName) => updateField("sowFileName", fileName)}
                  onExtractionComplete={setExtractionResult}
                />
              </div>

              <div className="rounded-[2rem] border border-border/70 bg-card p-5">
                <p className="text-sm font-medium">What happens next</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Once the backend AI action is wired, this upload becomes the moment where Ceal AI
                  extracts deliverables and technical credentials from the SOW into a reviewable
                  checklist.
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {errorMessage ? (
          <div className="mt-8 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-full px-6"
            onClick={previousStep}
            disabled={stepIndex === 0 || isSubmitting}
          >
            Back
          </Button>

          {stepIndex < steps.length - 1 ? (
            <Button type="button" className="h-11 rounded-full px-6" onClick={nextStep}>
              Continue
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              type="button"
              className="h-11 rounded-full px-6"
              onClick={finishOnboarding}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Finishing setup..." : "Enter dashboard"}
            </Button>
          )}
        </div>
      </section>
    </div>
  )
}
