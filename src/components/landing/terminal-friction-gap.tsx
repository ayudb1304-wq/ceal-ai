import { AlertTriangle, ArrowRight, CircleCheckBig } from "lucide-react"

const stages = [
  { label: "Creative approved", value: 100, tone: "done" },
  { label: "Assets organized", value: 78, tone: "warning" },
  { label: "Client handoff", value: 42, tone: "warning" },
  { label: "Final payment released", value: 18, tone: "stuck" },
]

export function TerminalFrictionGap() {
  return (
    <section
      id="terminal-friction"
      className="border-y border-border/70 bg-muted/30 py-16 sm:py-20"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
            The Terminal Friction Gap
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Projects rarely fail in the middle.
            <span className="block">They stall at the handoff.</span>
          </h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
            Agencies do the hard work, reach 95%, then lose momentum in the final client
            handover. One missing source file, one unclear credential, one scattered asset
            delivery thread, and the project slips into zombie mode.
          </p>
          <div className="mt-6 flex items-start gap-3 rounded-3xl border border-border/70 bg-background p-5 shadow-sm">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
            <p className="text-sm leading-6 text-muted-foreground">
              The last 5% carries the highest emotional and payment risk. Ceal AI is built to
              make that last step feel controlled, provable, and easy to complete.
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-border/70 bg-background p-5 shadow-lg shadow-slate-950/5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Without a structured closing system</p>
              <p className="mt-1 text-sm text-muted-foreground">
                The project looks almost done, but confidence collapses where it matters most.
              </p>
            </div>
            <div className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700">
              Final 5% at risk
            </div>
          </div>

          <div className="mt-8 space-y-5">
            {stages.map((stage, index) => (
              <div key={stage.label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 font-medium">
                    {stage.tone === "done" ? (
                      <CircleCheckBig className="size-4 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="size-4 text-amber-600" />
                    )}
                    {stage.label}
                  </div>
                  <span className="text-muted-foreground">{stage.value}%</span>
                </div>
                <div className="h-3 rounded-full bg-muted">
                  <div
                    className={`h-3 rounded-full ${
                      stage.tone === "done"
                        ? "bg-emerald-600"
                        : stage.tone === "warning"
                          ? "bg-amber-500"
                          : "bg-primary"
                    }`}
                    style={{ width: `${stage.value}%` }}
                  />
                </div>
                {index < stages.length - 1 ? (
                  <div className="mt-4 flex items-center gap-2 pl-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    <ArrowRight className="size-3.5" />
                    friction builds here
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
