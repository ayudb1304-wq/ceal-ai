"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight, FolderOpen, Menu, ScrollText, Settings2, X } from "lucide-react"

import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { label: "Projects", href: "/dashboard", icon: FolderOpen },
  { label: "Audit Log", href: "/dashboard/audit-log", icon: ScrollText },
  { label: "Settings", href: "/dashboard/settings", icon: Settings2 },
]

type Props = {
  agencyName: string
  logoUrl: string | null
  children: React.ReactNode
}

export function DashboardShell({ agencyName, logoUrl, children }: Props) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = React.useState(true)
  const [mobileOpen, setMobileOpen] = React.useState(false)

  // Hydrate collapse preference from localStorage after mount
  React.useEffect(() => {
    const stored = localStorage.getItem("ceal-sidebar-collapsed")
    if (stored !== null) setIsCollapsed(stored === "true")
  }, [])

  function toggleCollapsed() {
    setIsCollapsed((prev) => {
      const next = !prev
      localStorage.setItem("ceal-sidebar-collapsed", String(next))
      return next
    })
  }

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname.startsWith(href)
  }

  const initials = agencyName ? agencyName.slice(0, 2).toUpperCase() : "AG"

  // Shared sidebar body — used for both desktop and mobile drawer
  function SidebarContent({ onClose }: { onClose?: () => void }) {
    const expanded = !isCollapsed || Boolean(onClose)

    return (
      <div className="flex h-full flex-col">
        {/* Agency identity */}
        <div
          className={cn(
            "flex items-center gap-3 border-b border-border/60 py-4",
            expanded ? "px-4" : "justify-center px-0"
          )}
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
            {logoUrl ? (
              <img src={logoUrl} alt={agencyName} className="size-8 rounded-lg object-cover" />
            ) : (
              initials
            )}
          </div>
          {expanded && (
            <span className="flex-1 truncate text-sm font-medium">
              {agencyName || "Agency"}
            </span>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="ml-auto rounded-lg p-1 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Close menu"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 space-y-0.5 p-2">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-xl py-2.5 text-sm transition-colors",
                expanded ? "px-3" : "justify-center px-0",
                isActive(href)
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              title={!expanded ? label : undefined}
            >
              <Icon className="size-4 shrink-0" />
              {expanded && <span>{label}</span>}
            </Link>
          ))}
        </nav>

        {/* Collapse toggle — desktop only */}
        {!onClose && (
          <div className="border-t border-border/60 p-2">
            <button
              onClick={toggleCollapsed}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                expanded ? "px-3" : "justify-center px-0"
              )}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="size-4 shrink-0" />
              ) : (
                <>
                  <ChevronLeft className="size-4 shrink-0" />
                  <span>Collapse</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* ── Desktop sidebar ────────────────────────────────────────────── */}
      <aside
        className={cn(
          "hidden flex-col border-r border-border/60 bg-card transition-all duration-200 md:flex",
          isCollapsed ? "w-[60px]" : "w-[220px]"
        )}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile overlay + drawer ────────────────────────────────────── */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-[220px] flex-col border-r border-border/60 bg-card md:hidden">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </aside>
        </>
      )}

      {/* ── Main content area ─────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="flex h-14 shrink-0 items-center border-b border-border/60 bg-card px-4 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
          <span className="ml-3 text-sm font-medium">{agencyName || "Dashboard"}</span>
        </div>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
