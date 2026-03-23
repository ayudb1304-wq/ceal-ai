import { redirect } from "next/navigation"
import { FolderOpen } from "lucide-react"

import { auth, signOut } from "@/auth"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getOnboardingStateByEmail } from "@/lib/supabase/onboarding"
import { getProjectsForAgency } from "@/lib/supabase/projects"
import { ProjectCard } from "@/src/components/dashboard/ProjectCard"
import { NewProjectModal } from "@/src/components/dashboard/NewProjectModal"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.email) redirect("/auth/signin")

  const onboardingState = await getOnboardingStateByEmail(session.user.email)
  if (!onboardingState.isComplete) redirect("/onboarding")

  const projects = onboardingState.agencyId
    ? await getProjectsForAgency(onboardingState.agencyId)
    : []

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
              Dashboard
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Projects</h1>
          </div>
          <div className="flex items-center gap-3">
            <NewProjectModal />
            <form
              action={async () => {
                "use server"
                await signOut({ redirectTo: "/" })
              }}
            >
              <Button type="submit" variant="outline" size="lg" className="h-9 rounded-full px-5">
                Sign out
              </Button>
            </form>
          </div>
        </div>

        {/* Project grid */}
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-border/70 bg-card py-20 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <FolderOpen className="h-6 w-6 text-muted-foreground" />
            </span>
            <p className="mt-4 text-sm font-medium">No projects yet</p>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              Create your first project to start building a structured closing portal for your
              client.
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
    </main>
  )
}
