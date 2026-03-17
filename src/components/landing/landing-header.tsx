import Link from "next/link"

import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            C
          </span>
          <span className="text-sm sm:text-base">Ceal AI</span>
        </Link>

        <div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a href="#problem">The Problem</a>
          <a href="#solution">The Probe</a>
          <a href="#outcome">The Exit</a>
        </div>

        <Button asChild className="h-10 rounded-full px-5 text-sm shadow-sm">
          <Link href="/auth/signin">
            Ceal Your Project
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </header>
  )
}
