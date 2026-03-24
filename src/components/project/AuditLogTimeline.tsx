import {
  CheckCircle2,
  FilePlus,
  FileUp,
  Globe,
  KeyRound,
  PlusCircle,
  RefreshCcw,
  ShieldCheck,
  ThumbsUp,
} from "lucide-react"

import type { AuditLogEntry, AuditEventType } from "@/lib/supabase/audit-logs"

const EVENT_CONFIG: Record<
  AuditEventType,
  { icon: React.ElementType; color: string; bgColor: string }
> = {
  project_created:   { icon: PlusCircle,  color: "text-primary",         bgColor: "bg-primary/10" },
  checklist_approved:{ icon: ThumbsUp,    color: "text-primary",         bgColor: "bg-primary/10" },
  deliverable_uploaded:{ icon: FileUp,    color: "text-blue-600",        bgColor: "bg-blue-500/10" },
  deliverable_verified:{ icon: CheckCircle2, color: "text-emerald-600",  bgColor: "bg-emerald-500/10" },
  credential_added:  { icon: KeyRound,    color: "text-amber-600",       bgColor: "bg-amber-500/10" },
  project_published: { icon: Globe,       color: "text-violet-600",      bgColor: "bg-violet-500/10" },
  portal_accessed:   { icon: FilePlus,    color: "text-sky-600",         bgColor: "bg-sky-500/10" },
  portal_revisited:  { icon: RefreshCcw,  color: "text-sky-600",         bgColor: "bg-sky-500/10" },
  project_signed_off:{ icon: ShieldCheck, color: "text-emerald-600",     bgColor: "bg-emerald-500/10" },
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

export function AuditLogTimeline({ entries }: { entries: AuditLogEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">No activity recorded yet.</p>
    )
  }

  return (
    <ol className="space-y-0">
      {entries.map((entry, i) => {
        const config = EVENT_CONFIG[entry.event_type] ?? EVENT_CONFIG.project_created
        const Icon = config.icon
        const isLast = i === entries.length - 1

        return (
          <li key={entry.id} className="flex gap-4">
            {/* Left: icon + connector line */}
            <div className="flex flex-col items-center">
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full ${config.bgColor}`}
              >
                <Icon className={`size-3.5 ${config.color}`} />
              </span>
              {!isLast && <div className="mt-1 w-px flex-1 bg-border/60" />}
            </div>

            {/* Right: label + timestamp */}
            <div className={`min-w-0 pb-5 ${isLast ? "" : ""}`}>
              <p className="text-sm font-medium leading-tight">{entry.event_label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(entry.created_at)}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
