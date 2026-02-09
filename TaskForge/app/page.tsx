import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import {
  Layers,
  CheckCircle2,
  Users,
  Zap,
  ArrowRight,
  Sparkles,
  Shield,
  BarChart3,
  Kanban
} from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect to dashboard if already logged in
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col bg-background relative overflow-hidden">
      {/* Ambient Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb orb-primary w-[500px] h-[500px] -top-48 -left-48" style={{ animationDelay: '0s' }} />
        <div className="orb orb-secondary w-[400px] h-[400px] top-1/3 -right-32" style={{ animationDelay: '2s' }} />
        <div className="orb orb-accent w-[300px] h-[300px] bottom-0 left-1/4" style={{ animationDelay: '4s' }} />
      </div>

      {/* Gradient Glow at Top */}
      <div className="absolute inset-x-0 top-0 h-96 gradient-glow pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 glass">
        <div className="container flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex size-9 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow duration-300">
              <Kanban className="size-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">
              Task<span className="gradient-text">Forge</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" className="font-medium hover:bg-white/5">
                Sign in
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="btn-premium rounded-full px-5">
                Get Started
                <ArrowRight className="ml-1.5 size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 relative">
        <section className="container py-20 md:py-32 px-6">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="animate-slide-down mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm backdrop-blur-sm">
              <Sparkles className="size-4 text-primary animate-pulse" />
              <span className="text-foreground/80 font-medium">Premium Project Management</span>
            </div>

            {/* Headline */}
            <h1 className="animate-slide-up mb-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl text-balance leading-[1.1]">
              Build faster with{' '}
              <span className="gradient-text">TaskForge</span>
              <br className="hidden sm:block" />
              Kanban boards
            </h1>

            {/* Subheadline */}
            <p className="animate-slide-up stagger-1 opacity-0 mx-auto mb-10 max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed text-balance">
              Elevate your workflow with premium project management. Create workspaces,
              manage projects, and visualize tasks with beautifully crafted Kanban boards.
            </p>

            {/* CTA Buttons */}
            <div className="animate-slide-up stagger-2 opacity-0 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link href="/auth/sign-up">
                <Button size="lg" className="btn-premium rounded-full px-8 py-6 text-base">
                  Start for Free
                  <ArrowRight className="ml-2 size-5" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 py-6 text-base bg-transparent border-border/50 hover:bg-white/5 hover:border-primary/30"
                >
                  Sign in to your account
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="animate-fade-in stagger-3 opacity-0 mt-14 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center gap-2 hidden sm:flex">
                <CheckCircle2 className="size-4 text-emerald-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t border-border/40 py-24 relative">
          <div className="absolute inset-0 gradient-mesh opacity-50" />
          <div className="container px-6 relative">
            <div className="mx-auto max-w-5xl">
              {/* Section Header */}
              <div className="text-center mb-16">
                <span className="badge-premium mb-4">Features</span>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Everything you need to{' '}
                  <span className="gradient-text">stay organized</span>
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Powerful features designed to help teams ship faster and collaborate better.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid gap-6 md:grid-cols-3">
                {/* Feature 1 */}
                <div className="card-premium p-6 hover-lift group">
                  <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/20 group-hover:border-violet-500/40 transition-colors">
                    <Layers className="size-7 text-violet-400" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">Workspaces</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Organize projects by team, department, or purpose with dedicated workspaces that keep everything structured.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="card-premium p-6 hover-lift group">
                  <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
                    <Kanban className="size-7 text-emerald-400" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">Kanban Boards</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Visualize workflow with intuitive drag-and-drop cards across customizable columns that adapt to your process.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="card-premium p-6 hover-lift group">
                  <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-500/20 group-hover:border-blue-500/40 transition-colors">
                    <Users className="size-7 text-blue-400" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">Team Collaboration</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Assign tasks, set priorities, and collaborate with your team in real-time with seamless syncing.
                  </p>
                </div>
              </div>

              {/* Additional Features Row */}
              <div className="grid gap-6 md:grid-cols-3 mt-6">
                {/* Feature 4 */}
                <div className="card-premium p-6 hover-lift group">
                  <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/20 group-hover:border-amber-500/40 transition-colors">
                    <Zap className="size-7 text-amber-400" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">Blazing Fast</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Built for speed with instant updates and optimistic UI that keeps you in the flow.
                  </p>
                </div>

                {/* Feature 5 */}
                <div className="card-premium p-6 hover-lift group">
                  <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/20 to-pink-500/10 border border-rose-500/20 group-hover:border-rose-500/40 transition-colors">
                    <Shield className="size-7 text-rose-400" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">Secure by Design</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Enterprise-grade security with end-to-end encryption and granular access controls.
                  </p>
                </div>

                {/* Feature 6 */}
                <div className="card-premium p-6 hover-lift group">
                  <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500/20 to-sky-500/10 border border-cyan-500/20 group-hover:border-cyan-500/40 transition-colors">
                    <BarChart3 className="size-7 text-cyan-400" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-foreground">Rich Analytics</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Track progress with beautiful dashboards and insights that help you make better decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative">
          <div className="container px-6">
            <div className="mx-auto max-w-4xl">
              <div className="relative rounded-3xl border border-border/40 bg-card/50 backdrop-blur-xl p-12 md:p-16 text-center overflow-hidden">
                {/* Background Gradient */}
                <div className="absolute inset-0 gradient-primary opacity-5" />
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />

                <div className="relative">
                  <span className="badge-premium mb-6">Ready to start?</span>
                  <h2 className="mb-4 text-3xl md:text-4xl font-bold text-foreground text-balance">
                    Transform how your team{' '}
                    <span className="gradient-text">works together</span>
                  </h2>
                  <p className="mb-8 text-lg text-muted-foreground text-balance max-w-xl mx-auto">
                    Join thousands of teams using TaskForge to manage projects more effectively and ship faster.
                  </p>
                  <Link href="/auth/sign-up">
                    <Button size="lg" className="btn-premium rounded-full px-8 py-6 text-base">
                      Get Started for Free
                      <ArrowRight className="ml-2 size-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 glass">
        <div className="container px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-lg gradient-primary">
                <Kanban className="size-4 text-white" />
              </div>
              <span className="font-semibold text-foreground">
                Task<span className="gradient-text">Forge</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 TaskForge. Built with Next.js & Supabase.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
