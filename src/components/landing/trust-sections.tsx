import { Link2, SearchCheck, ShieldAlert } from "lucide-react"

const sections = [
  {
    id: "problem",
    eyebrow: "The Problem: Chaos",
    title: "Where is that vector logo?",
    description:
      "Your team finished the work, but the client still feels uncertainty. Final files live across email, Slack, Drive folders, and old export links. One missing asset turns a completed project into another week of follow-up.",
    bullets: [
      "Clients ask for files they swear were never sent",
      "Senior staff waste time scavenging instead of billing",
      "Final payment stalls while everyone searches for proof",
    ],
    icon: ShieldAlert,
  },
  {
    id: "solution",
    eyebrow: "The Solution: The Probe",
    title: "Deliver certified quality before the handoff.",
    description:
      "Ceal AI extracts deliverables from the brief, checks uploaded assets against required formats, and helps your team spot gaps before the client ever sees the portal.",
    bullets: [
      "Turn the SOW into a usable delivery checklist",
      "Verify asset delivery against format and metadata expectations",
      "Create a cleaner client handover with less guesswork",
    ],
    icon: SearchCheck,
  },
  {
    id: "outcome",
    eyebrow: "The Outcome: Peace of Mind",
    title: "The magic-link exit every agency wishes they had.",
    description:
      "Instead of a messy final email, you send one polished closing experience. Clients open a magic link, review verified assets, access credentials, and sign off with confidence.",
    bullets: [
      "Passwordless client handoff for faster completion",
      "A more professional asset delivery experience",
      "A closing moment that feels calm, final, and premium",
    ],
    icon: Link2,
  },
]

export function TrustSections() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
            Why agencies trust this flow
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            A client handoff system designed for the final, fragile moment.
          </h2>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {sections.map((section) => {
            const Icon = section.icon

            return (
              <article
                id={section.id}
                key={section.title}
                className="flex h-full flex-col rounded-[2rem] border border-border/70 bg-card p-6 shadow-sm"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <p className="mt-6 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {section.eyebrow}
                </p>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight text-balance">
                  {section.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">
                  {section.description}
                </p>
                <ul className="mt-6 space-y-3 text-sm">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="rounded-2xl border border-border/60 px-4 py-3">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
