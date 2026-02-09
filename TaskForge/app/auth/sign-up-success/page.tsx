import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Kanban, Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 relative overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb orb-primary w-[400px] h-[400px] -top-32 -right-32" style={{ animationDelay: '0s' }} />
        <div className="orb orb-accent w-[350px] h-[350px] -bottom-32 -left-32" style={{ animationDelay: '2s' }} />
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
              <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 animate-pulse-glow" style={{ '--tw-shadow-color': 'rgb(16 185 129 / 0.3)' } as React.CSSProperties}>
                <CheckCircle2 className="size-10 text-emerald-400" />
              </div>
              <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
              <CardDescription className="text-balance text-base">
                We sent you a confirmation email. Please click the link in the email to verify your account and get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                <div className="rounded-xl bg-muted/50 border border-border/50 p-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="size-4 text-primary" />
                    <p className="font-semibold text-foreground">{"Didn't receive the email?"}</p>
                  </div>
                  <ul className="list-disc list-inside space-y-1.5 ml-1">
                    <li>Check your spam or junk folder</li>
                    <li>Make sure you entered the correct email</li>
                    <li>Wait a few minutes and try again</li>
                  </ul>
                </div>
                <Button asChild variant="outline" className="w-full bg-transparent border-border/50 hover:bg-white/5 h-11 rounded-lg">
                  <Link href="/auth/login">
                    Back to sign in
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
