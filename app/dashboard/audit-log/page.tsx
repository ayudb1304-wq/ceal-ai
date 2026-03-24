import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { getOnboardingStateByEmail } from "@/lib/supabase/onboarding"
import { getAuditLogsForAgency } from "@/lib/supabase/audit-logs"
import { AuditLogTable } from "@/src/components/audit-log/AuditLogTable"

export default async function AuditLogPage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/auth/signin")

  const onboardingState = await getOnboardingStateByEmail(session.user.email)
  if (!onboardingState.isComplete) redirect("/onboarding")

  const entries = onboardingState.agencyId
    ? await getAuditLogsForAgency(onboardingState.agencyId)
    : []

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Activity
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Audit Log</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All events across your projects, in reverse chronological order.
          </p>
        </div>

        <AuditLogTable entries={entries} />
      </div>
    </div>
  )
}
