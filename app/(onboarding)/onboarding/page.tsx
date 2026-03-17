import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { getOnboardingStateByEmail } from "@/lib/supabase/onboarding"
import { AgencyOnboardingWizard } from "@/src/components/onboarding/agency-onboarding-wizard"

export const metadata: Metadata = {
  title: "Agency Onboarding | Ceal AI",
  description:
    "Set up your agency workspace, brand, legal details, and first project to prepare Ceal AI for faster project closing.",
}

export default async function OnboardingPage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/auth/signin")
  }

  const onboardingState = await getOnboardingStateByEmail(session.user.email)

  if (onboardingState.isComplete) {
    redirect("/dashboard")
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
            Agency onboarding
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance">
            Turn a signed-in account into a client-ready closing workspace.
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Welcome{session.user.name ? `, ${session.user.name}` : ""}. Start with your agency
            details, then tee up the first project and SOW so Ceal AI can create that first
            checklist moment.
          </p>
        </div>

        <AgencyOnboardingWizard
          initialValues={onboardingState.initialValues}
          ownerEmail={session.user.email}
        />
      </div>
    </main>
  )
}
