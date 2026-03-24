import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { getOnboardingStateByEmail } from "@/lib/supabase/onboarding"
import { SettingsTabs } from "@/src/components/settings/SettingsTabs"

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/auth/signin")

  const state = await getOnboardingStateByEmail(session.user.email)
  if (!state.isComplete) redirect("/onboarding")

  const { initialValues } = state

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Settings</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Agency Settings</h1>
        </div>

        <SettingsTabs
          initialValues={{
            name: initialValues.agencyName,
            contactName: initialValues.fullName,
            ownerRole: initialValues.role,
            logoName: initialValues.logoName,
            brandColor: initialValues.brandColor,
            gstin: initialValues.gstin,
            bankDetails: initialValues.bankDetails,
          }}
          ownerEmail={session.user.email}
        />
      </div>
    </div>
  )
}
