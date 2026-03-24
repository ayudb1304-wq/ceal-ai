import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Building2, FolderOpen, Mail, Phone } from "lucide-react"

import { auth } from "@/auth"
import { getOnboardingStateByEmail } from "@/lib/supabase/onboarding"
import { getClientById } from "@/lib/supabase/clients"
import { getProjectsForClient } from "@/lib/supabase/projects"
import { ProjectCard } from "@/src/components/dashboard/ProjectCard"
import { EditClientModal } from "@/src/components/clients/EditClientModal"
import { NewProjectModal } from "@/src/components/dashboard/NewProjectModal"

export default async function ClientDetailPage({
  params,
}: {
  params: { clientId: string }
}) {
  const session = await auth()
  if (!session?.user?.email) redirect("/auth/signin")

  const onboardingState = await getOnboardingStateByEmail(session.user.email)
  if (!onboardingState.isComplete) redirect("/onboarding")

  const [client, projects] = await Promise.all([
    getClientById(params.clientId),
    getProjectsForClient(params.clientId),
  ])

  if (!client) notFound()

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          All clients
        </Link>

        {/* Client header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Client</p>

            {/* Name + project count badge */}
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">{client.name}</h1>
              <span className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                <FolderOpen className="size-3" />
                {projects.length} {projects.length === 1 ? "project" : "projects"}
              </span>
            </div>

            {/* Contact row */}
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {client.company && (
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Building2 className="size-3.5" />
                  {client.company}
                </p>
              )}
              {client.email && (
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="size-3.5" />
                  {client.email}
                </p>
              )}
              {client.phone && (
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="size-3.5" />
                  {client.phone}
                </p>
              )}
            </div>

            {/* Internal notes */}
            {client.notes && (
              <p className="mt-1 max-w-prose text-sm text-muted-foreground">{client.notes}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex shrink-0 gap-2">
            <EditClientModal client={client} />
            <NewProjectModal
              lockedClient={{
                id: client.id,
                name: client.name,
                email: client.email,
              }}
            />
          </div>
        </div>

        {/* Projects grid */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Projects
          </h2>

          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-border/70 bg-card py-16 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <FolderOpen className="h-5 w-5 text-muted-foreground" />
              </span>
              <p className="mt-3 text-sm font-medium">No projects yet</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Use the &quot;New Project&quot; button above to create one for {client.name}.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
