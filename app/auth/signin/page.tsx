import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { ArrowLeft, BadgeCheck, ShieldCheck } from "lucide-react"

import { auth } from "@/auth"
import { getOnboardingStateByEmail } from "@/lib/supabase/onboarding"
import { GoogleSignInForm } from "@/src/components/auth/google-sign-in-form"

export const metadata: Metadata = {
  title: "Sign In | Ceal AI",
  description:
    "Sign in to Ceal AI and turn messy client handoff into a clean, trusted closing experience.",
}

const proofPoints = [
  "Turn the SOW into a delivery checklist",
  "Verify assets before client handoff",
  "Send one polished closing link to the client",
]

export default async function SignInPage() {
  const session = await auth()

  if (session?.user?.email) {
    const onboardingState = await getOnboardingStateByEmail(session.user.email)
    redirect(onboardingState.isComplete ? "/dashboard" : "/onboarding")
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <section className="flex flex-col justify-between rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm sm:p-8">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Back to home
            </Link>

            <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" />
              Secure sign-in for boutique agencies
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Stop closing projects through scattered files and fragile memory.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
              Sign in to Ceal AI and move from messy asset delivery to a professional client
              handoff flow with verified files, clearer accountability, and a stronger final
              handshake.
            </p>
          </div>

          <div className="mt-10 space-y-4">
            {proofPoints.map((point) => (
              <div
                key={point}
                className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm"
              >
                <BadgeCheck className="size-4 text-primary" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="flex items-center">
          <div className="w-full rounded-[2rem] border border-border/70 bg-background p-6 shadow-lg shadow-slate-950/5 sm:p-8">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
              Google Sign-In
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance">
              Start your agency workspace.
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Continue with Google, then land in your agency onboarding flow so you can set up the
              workspace, branding, and first project before moving into the full dashboard.
            </p>

            <div className="mt-8 rounded-[2rem] border border-border/70 bg-card p-5">
              <GoogleSignInForm />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
