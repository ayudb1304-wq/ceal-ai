import Link from "next/link"
import { ArrowRight, FileText } from "lucide-react"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ProjectRow } from "@/lib/supabase/projects"

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  active: { label: "Active", className: "bg-primary/10 text-primary" },
  closed: { label: "Closed", className: "bg-green-500/10 text-green-700 dark:text-green-400" },
}

export function ProjectCard({ project }: { project: ProjectRow }) {
  const pct =
    project.deliverable_count === 0
      ? 0
      : Math.round((project.verified_count / project.deliverable_count) * 100)

  const status = statusConfig[project.status] ?? statusConfig.draft

  return (
    <Link
      href={`/dashboard/projects/${project.id}`}
      className="group flex flex-col gap-4 rounded-[1.5rem] border border-border/70 bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
            <FileText className="h-4 w-4 text-muted-foreground" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight">
              {project.name ?? "Unnamed project"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{project.client_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[0.65rem] font-medium border-0",
              status.className
            )}
          >
            {status.label}
          </Badge>
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {project.verified_count} / {project.deliverable_count} assets verified
          </span>
          <span className="text-xs font-semibold text-foreground">{pct}%</span>
        </div>
        <Progress value={pct} className="h-1.5" />
      </div>
    </Link>
  )
}
