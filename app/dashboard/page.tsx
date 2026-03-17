import { redirect } from "next/navigation"

import { signOut, auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { getOnboardingStateByEmail } from "@/lib/supabase/onboarding"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/auth/signin")
  }

  const onboardingState = await getOnboardingStateByEmail(session.user.email)

  if (!onboardingState.isComplete) {
    redirect("/onboarding")
  }

  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">Dashboard</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Signed in as {session.user.name ?? session.user.email ?? "your agency account"}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
          Your onboarding data is now persisted in Supabase, and returning users are routed
          directly into the dashboard once their agency and first project are in place.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <form
            action={async () => {
              "use server"

              await signOut({ redirectTo: "/" })
            }}
          >
            <Button type="submit" variant="outline" className="h-10 rounded-full px-5">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}
