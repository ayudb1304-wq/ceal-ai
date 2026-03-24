import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getProjectDetail, getAgencyIdByEmail } from "@/lib/supabase/projects"
import { getDeliverablesForProject } from "@/lib/supabase/deliverables"
import { getCredentials } from "@/lib/supabase/credentials"
import { cn } from "@/lib/utils"
import { HitlBanner } from "@/src/components/project/HitlBanner"
import { DeliverableChecklist } from "@/src/components/project/DeliverableChecklist"
import { CredentialVault } from "@/src/components/project/CredentialVault"
import { PublishButton } from "@/src/components/project/PublishButton"
import { SowReupload } from "@/src/components/project/SowReupload"

const statusConfig: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  active: { label: "Active", className: "bg-primary/10 text-primary" },
  closed: { label: "Closed", className: "bg-green-500/10 text-green-700 dark:text-green-400" },
}

type Params = Promise<{ projectId: string }>

export default async function ProjectDetailPage({ params }: { params: Params }) {
  const { projectId } = await params

  const session = await auth()
  if (!session?.user?.email) redirect("/auth/signin")

  const agencyId = await getAgencyIdByEmail(session.user.email)
  if (!agencyId) redirect("/onboarding")

  const project = await getProjectDetail(projectId)
  if (!project || project.agency_id !== agencyId) notFound()

  const [deliverables, credentials] = await Promise.all([
    getDeliverablesForProject(projectId),
    getCredentials(projectId),
  ])

  const status = statusConfig[project.status] ?? statusConfig.draft

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-8">
        {/* Back + header */}
        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All projects
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-semibold tracking-tight">
                {project.name ?? "Unnamed project"}
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {project.client_id ? (
                  <Link
                    href={`/dashboard/clients/${project.client_id}`}
                    className="transition-colors hover:text-foreground hover:underline"
                  >
                    {project.client_name}
                  </Link>
                ) : (
                  project.client_name
                )}
                {" · "}
                {project.client_email}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                className={cn(
                  "shrink-0 rounded-full border-0 px-2.5 py-0.5 text-[0.65rem] font-medium",
                  status.className
                )}
              >
                {status.label}
              </Badge>
              <PublishButton projectId={projectId} status={project.status} />
            </div>
          </div>
        </div>

        {/* HITL banner for draft projects */}
        {project.status === "draft" && <HitlBanner projectId={projectId} />}

        {/* SOW upload / re-extraction */}
        <SowReupload
          projectId={projectId}
          currentSowUrl={project.sow_document_url}
          projectStatus={project.status}
        />

        {/* Deliverables */}
        <DeliverableChecklist projectId={projectId} deliverables={deliverables} projectStatus={project.status} />

        {/* Credential vault */}
        <CredentialVault projectId={projectId} credentials={credentials} projectStatus={project.status} />
      </div>
    </div>
  )
}
