import { auth } from "@/auth"
import { getOnboardingStateByEmail } from "@/lib/supabase/onboarding"
import { DashboardShell } from "@/src/components/dashboard/DashboardShell"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  let agencyName = ""
  let logoUrl: string | null = null

  if (session?.user?.email) {
    const state = await getOnboardingStateByEmail(session.user.email)
    agencyName = state.initialValues.agencyName
    logoUrl = state.initialValues.logoName || null
  }

  return (
    <DashboardShell agencyName={agencyName} logoUrl={logoUrl}>
      {children}
    </DashboardShell>
  )
}
