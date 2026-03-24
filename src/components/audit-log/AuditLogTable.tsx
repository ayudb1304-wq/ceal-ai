"use client"

import * as React from "react"
import Link from "next/link"
import {
  CheckCircle2,
  FilePlus,
  FileUp,
  Globe,
  KeyRound,
  Pencil,
  PlusCircle,
  RefreshCcw,
  ShieldCheck,
  ThumbsUp,
  Trash2,
  Type,
  UploadCloud,
} from "lucide-react"

import type { AuditLogEntry, AuditEventType } from "@/lib/supabase/audit-logs"

const EVENT_CONFIG: Record<AuditEventType, { icon: React.ElementType; color: string; bgColor: string }> = {
  project_created:        { icon: PlusCircle,   color: "text-primary",       bgColor: "bg-primary/10" },
  checklist_approved:     { icon: ThumbsUp,     color: "text-primary",       bgColor: "bg-primary/10" },
  deliverable_added:      { icon: PlusCircle,   color: "text-blue-600",      bgColor: "bg-blue-500/10" },
  deliverable_updated:    { icon: Pencil,       color: "text-blue-600",      bgColor: "bg-blue-500/10" },
  deliverable_deleted:    { icon: Trash2,       color: "text-rose-600",      bgColor: "bg-rose-500/10" },
  deliverable_uploaded:   { icon: UploadCloud,  color: "text-blue-600",      bgColor: "bg-blue-500/10" },
  deliverable_value_saved:{ icon: Type,         color: "text-blue-600",      bgColor: "bg-blue-500/10" },
  deliverable_verified:   { icon: CheckCircle2, color: "text-emerald-600",   bgColor: "bg-emerald-500/10" },
  credential_added:       { icon: KeyRound,     color: "text-amber-600",     bgColor: "bg-amber-500/10" },
  credential_updated:     { icon: Pencil,       color: "text-amber-600",     bgColor: "bg-amber-500/10" },
  credential_deleted:     { icon: Trash2,       color: "text-rose-600",      bgColor: "bg-rose-500/10" },
  sow_uploaded:           { icon: FileUp,       color: "text-violet-600",    bgColor: "bg-violet-500/10" },
  project_published:      { icon: Globe,        color: "text-violet-600",    bgColor: "bg-violet-500/10" },
  portal_accessed:        { icon: FilePlus,     color: "text-sky-600",       bgColor: "bg-sky-500/10" },
  portal_revisited:       { icon: RefreshCcw,   color: "text-sky-600",       bgColor: "bg-sky-500/10" },
  project_signed_off:     { icon: ShieldCheck,  color: "text-emerald-600",   bgColor: "bg-emerald-500/10" },
}

const EVENT_TYPE_LABELS: Record<AuditEventType, string> = {
  project_created:        "Project created",
  checklist_approved:     "Checklist approved",
  deliverable_added:      "Deliverable added",
  deliverable_updated:    "Deliverable updated",
  deliverable_deleted:    "Deliverable deleted",
  deliverable_uploaded:   "File uploaded",
  deliverable_value_saved:"Value saved",
  deliverable_verified:   "Deliverable verified",
  credential_added:       "Credential added",
  credential_updated:     "Credential updated",
  credential_deleted:     "Credential deleted",
  sow_uploaded:           "SOW uploaded",
  project_published:      "Portal published",
  portal_accessed:        "Portal accessed",
  portal_revisited:       "Portal revisited",
  project_signed_off:     "Signed off",
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

export function AuditLogTable({ entries }: { entries: AuditLogEntry[] }) {
  const [filterType, setFilterType] = React.useState<AuditEventType | "all">("all")
  const [filterProject, setFilterProject] = React.useState<string>("all")

  // Derive unique project names for the filter dropdown
  const projects = React.useMemo(() => {
    const seen = new Map<string, string>()
    for (const e of entries) {
      if (!seen.has(e.project_id)) seen.set(e.project_id, e.project_name ?? "Unnamed project")
    }
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }))
  }, [entries])

  const filtered = entries.filter((e) => {
    if (filterType !== "all" && e.event_type !== filterType) return false
    if (filterProject !== "all" && e.project_id !== filterProject) return false
    return true
  })

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          className="rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          <option value="all">All projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as AuditEventType | "all")}
          className="rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
        >
          <option value="all">All events</option>
          {(Object.keys(EVENT_TYPE_LABELS) as AuditEventType[]).map((type) => (
            <option key={type} value={type}>{EVENT_TYPE_LABELS[type]}</option>
          ))}
        </select>

        <span className="flex items-center text-xs text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-border/70 bg-card py-16 text-center">
          <p className="text-sm text-muted-foreground">No activity found for the selected filters.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[1.5rem] border border-border/70 bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Event</th>
                <th className="hidden px-4 py-3 text-left text-xs font-medium text-muted-foreground sm:table-cell">Project</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => {
                const config = EVENT_CONFIG[entry.event_type] ?? EVENT_CONFIG.project_created
                const Icon = config.icon
                return (
                  <tr key={entry.id} className="border-b border-border/40 last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className={`flex size-7 shrink-0 items-center justify-center rounded-lg ${config.bgColor}`}>
                          <Icon className={`size-3.5 ${config.color}`} />
                        </span>
                        <span className="font-medium">{entry.event_label}</span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      <Link
                        href={`/dashboard/projects/${entry.project_id}`}
                        className="hover:text-foreground hover:underline"
                      >
                        {entry.project_name ?? "Unnamed project"}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                      {formatDate(entry.created_at)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
