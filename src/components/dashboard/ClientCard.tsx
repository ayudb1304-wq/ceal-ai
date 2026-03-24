import Link from "next/link"
import { Building2, FolderOpen, Mail, Phone } from "lucide-react"

import type { ClientRow } from "@/lib/supabase/clients"

export function ClientCard({ client }: { client: ClientRow }) {
  return (
    <Link
      href={`/dashboard/clients/${client.id}`}
      className="group block rounded-[1.5rem] border border-border/70 bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
    >
      {/* Name + company */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold tracking-tight group-hover:text-primary">
            {client.name}
          </p>
          {client.company && (
            <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-muted-foreground">
              <Building2 className="size-3 shrink-0" />
              {client.company}
            </p>
          )}
        </div>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
          <FolderOpen className="size-3" />
          {client.project_count} {client.project_count === 1 ? "project" : "projects"}
        </span>
      </div>

      {/* Contact details */}
      <div className="mt-4 space-y-1.5">
        {client.email && (
          <p className="flex items-center gap-2 truncate text-xs text-muted-foreground">
            <Mail className="size-3 shrink-0" />
            {client.email}
          </p>
        )}
        {client.phone && (
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="size-3 shrink-0" />
            {client.phone}
          </p>
        )}
      </div>
    </Link>
  )
}
