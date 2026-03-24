import { validatePortalToken, getPortalData } from "@/lib/supabase/portal"
import { writeAuditLog } from "@/lib/supabase/audit-logs"
import { PortalShell } from "@/src/components/portal/PortalShell"

type Params = Promise<{ token: string }>

export default async function PortalPage({ params }: { params: Params }) {
  const { token } = await params

  const validation = await validatePortalToken(token)

  if (!validation.valid) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
        <div className="max-w-sm space-y-3">
          <p className="text-4xl">🔒</p>
          <h1 className="text-xl font-semibold tracking-tight">Link expired or invalid</h1>
          <p className="text-sm text-muted-foreground">
            This link has expired or is no longer valid. Please contact your agency for a new link.
          </p>
        </div>
      </div>
    )
  }

  const { projectId, magicLinkId, isFirstVisit } = validation

  // Log portal access
  await writeAuditLog(
    projectId,
    isFirstVisit ? "portal_accessed" : "portal_revisited",
    isFirstVisit ? "Client viewed portal" : "Client revisited portal"
  )

  const portalData = await getPortalData(projectId, magicLinkId, isFirstVisit)

  return <PortalShell data={portalData} />
}
