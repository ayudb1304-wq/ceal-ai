import Link from "next/link"

import { ArrowRight, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"

export function FinalCta() {
  return (
    <section className="pb-16 sm:pb-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-primary/15 bg-primary px-6 py-10 text-primary-foreground shadow-xl shadow-slate-950/10 sm:px-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em]">
              <ShieldCheck className="size-3.5" />
              Certified closing for boutique agencies
            </div>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              Stop letting the client handoff feel shakier than the project itself.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-primary-foreground/80 sm:text-base">
              If the work is premium, the final handshake should be premium too. Give clients one
              trusted place for asset delivery, credentials, and sign-off, so your team can close
              faster and move on with confidence.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                variant="secondary"
                className="h-11 rounded-full px-6 text-sm text-primary shadow-sm"
              >
                <Link href="/auth/signin">
                  Ceal Your Project
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <p className="flex items-center text-sm text-primary-foreground/80">
                Built to make client handover, client handoff, and final asset delivery feel
                complete.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
