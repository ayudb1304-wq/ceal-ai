import type { Metadata } from "next"

import { FinalCta } from "@/src/components/landing/final-cta"
import { HeroSection } from "@/src/components/landing/hero-section"
import { LandingHeader } from "@/src/components/landing/landing-header"
import { SiteFooter } from "@/src/components/landing/site-footer"
import { TerminalFrictionGap } from "@/src/components/landing/terminal-friction-gap"
import { TrustSections } from "@/src/components/landing/trust-sections"

export const metadata: Metadata = {
  title: "Ceal AI | Client Handover and Certified Closing for Agencies",
  description:
    "Ceal AI helps boutique agencies turn messy client handoff into a verified, high-trust closing flow with cleaner asset delivery, software checks, and magic-link sign-off.",
  keywords: [
    "client handover",
    "client handoff",
    "asset delivery",
    "project closing",
    "agency handoff portal",
    "deliverable verification",
  ],
}

export default function Page() {
  return (
    <main className="min-h-screen bg-background">
      <LandingHeader />
      <HeroSection />
      <TerminalFrictionGap />
      <TrustSections />
      <FinalCta />
      <SiteFooter />
    </main>
  )
}
