 "use client"

import { Chrome, LockKeyhole, MoveRight } from "lucide-react"
import { signIn } from "next-auth/react"

import { Button } from "@/components/ui/button"

export function GoogleSignInForm() {
  return (
    <div className="space-y-4">
      <Button
        type="button"
        className="h-11 w-full rounded-full bg-primary text-sm text-primary-foreground shadow-md"
        onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
      >
        <Chrome className="size-4" />
        Continue with Google
        <MoveRight className="size-4" />
      </Button>

      <div className="flex items-start gap-3 rounded-3xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
        <LockKeyhole className="mt-0.5 size-4 shrink-0 text-primary" />
        <p>
          We only use Google sign-in to start your secure agency workspace. Project onboarding,
          client handoff, and certified closing happen after sign-in.
        </p>
      </div>
    </div>
  )
}
