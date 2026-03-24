import { redirect } from "next/navigation"
import { Users } from "lucide-react"

import { auth } from "@/auth"
import { getOnboardingStateByEmail } from "@/lib/supabase/onboarding"
import { getClientsForAgency } from "@/lib/supabase/clients"
import { ClientCard } from "@/src/components/dashboard/ClientCard"
import { AddClientModal } from "@/src/components/clients/AddClientModal"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.email) redirect("/auth/signin")

  const onboardingState = await getOnboardingStateByEmail(session.user.email)
  if (!onboardingState.isComplete) redirect("/onboarding")

  const clients = onboardingState.agencyId
    ? await getClientsForAgency(onboardingState.agencyId)
    : []

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
              Dashboard
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Clients</h1>
          </div>
          <AddClientModal />
        </div>

        {/* Clients grid */}
        {clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-border/70 bg-card py-20 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Users className="h-6 w-6 text-muted-foreground" />
            </span>
            <p className="mt-4 text-sm font-medium">No clients yet</p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              Add your first client to start building structured closing portals for your work.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
