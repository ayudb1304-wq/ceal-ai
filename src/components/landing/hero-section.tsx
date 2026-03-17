import Link from "next/link"

import { ArrowRight, BadgeCheck, FileCheck2, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"

const heroSignals = [
  "AI checklist extraction from your SOW",
  "Verified asset delivery before client handoff",
  "Magic-link closing portal for sign-off and download",
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_55%)]" />
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-24">
        <div className="flex max-w-3xl flex-col justify-center">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <Sparkles className="size-3.5 text-primary" />
            Built for boutique agencies closing $5k-$20k projects
          </div>

          <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            The project is done.
            <span className="block text-primary">Why is the last 5% still delaying payment?</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Ceal AI gives agencies a cleaner client handover: turn the SOW into a checklist,
            verify the right files, and send a polished client handoff link that makes asset
            delivery feel final, organized, and easy to trust.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="h-11 rounded-full px-6 text-sm shadow-md">
              <Link href="/auth/signin">
                Ceal Your Project
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-full px-6 text-sm shadow-sm"
            >
              <a href="#terminal-friction">See the closing gap</a>
            </Button>
          </div>

          <ul className="mt-8 grid gap-3 text-sm text-foreground sm:grid-cols-3">
            {heroSignals.map((signal) => (
              <li
                key={signal}
                className="flex items-start gap-2 rounded-2xl border border-border/70 bg-card/70 px-4 py-3 shadow-sm"
              >
                <BadgeCheck className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{signal}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-[2rem] bg-primary/8 blur-3xl" />
          <div className="rounded-[2rem] border border-border/70 bg-card p-5 shadow-xl shadow-slate-950/5 sm:p-6">
            <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-background px-4 py-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Certified Closing
                </p>
                <p className="mt-1 text-sm font-medium">Client handoff status</p>
              </div>
              <div className="rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-medium text-emerald-700">
                Ready to close
              </div>
            </div>

            <div className="mt-5 rounded-3xl border border-border/70 bg-background p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Brand identity handoff</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Everything the client expects from the brief, organized before the final
                    handshake.
                  </p>
                </div>
                <div className="rounded-2xl bg-primary px-3 py-2 text-center text-primary-foreground">
                  <p className="text-[10px] uppercase tracking-[0.18em]">Close score</p>
                  <p className="text-lg font-semibold">95%</p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {[
                  ["Vector logo (.ai, .eps)", "Verified"],
                  ["CMYK PDF for print", "Verified"],
                  ["Brand guidelines PDF", "Verified"],
                  ["Staging credentials", "Ready for reveal"],
                ].map(([label, status]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-primary/10 p-2 text-primary">
                        <FileCheck2 className="size-4" />
                      </div>
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700">
                      <BadgeCheck className="size-3.5" />
                      {status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-border/70 bg-background p-4">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Before Ceal AI
                </p>
                <p className="mt-2 text-sm font-medium">
                  Final files scattered across mail, chat, drives, and old folders.
                </p>
              </div>
              <div className="rounded-3xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
                  After Ceal AI
                </p>
                <p className="mt-2 text-sm font-medium">
                  One clean client handover link, verified files, and a confident sign-off.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
