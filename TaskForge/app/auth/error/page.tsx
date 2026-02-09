import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { XCircle, Kanban, ArrowLeft, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-[400px] h-[400px] -top-32 -right-32 bg-red-500" style={{ animationDelay: '0s' }} />
        <div className="orb orb-secondary w-[350px] h-[350px] -bottom-32 -left-32" style={{ animationDelay: '2s' }} />
      </div>

      {/* Gradient Glow */}
      <div className="absolute inset-x-0 top-0 h-96 gradient-glow pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col gap-8">
          {/* Back Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit group"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
            Back to home
          </Link>

          {/* Logo */}
          <div className="flex items-center justify-center gap-3 animate-slide-down">
            <div className="flex size-12 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-violet-500/25">
              <Kanban className="size-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground tracking-tight">
              Task<span className="gradient-text">Forge</span>
            </span>
          </div>

          {/* Card */}
          <Card className="animate-slide-up glass border-border/40">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500/20 to-rose-500/10 border border-red-500/30">
                <XCircle className="size-10 text-red-400" />
              </div>
              <CardTitle className="text-2xl font-bold">Authentication Error</CardTitle>
              <CardDescription className="text-balance text-base">
                There was a problem authenticating your account. Please try again.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Error Details */}
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="size-4 text-red-400 mt-0.5 shrink-0" />
                    <div className="text-red-300/80">
                      <p className="font-medium text-red-300 mb-1">What might have happened:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>The confirmation link has expired</li>
                        <li>The link was already used</li>
                        <li>There was a network issue</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <Button asChild className="w-full btn-premium h-11 rounded-lg">
                  <Link href="/auth/login">
                    Back to sign in
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full bg-transparent border-border/50 hover:bg-white/5 h-11 rounded-lg">
                  <Link href="/auth/sign-up">
                    Create a new account
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
