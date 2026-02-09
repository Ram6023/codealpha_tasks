'use client'

import React from "react"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Plus,
  LogOut,
  FolderKanban,
  Users,
  Kanban,
  Sparkles,
  Loader2,
  LayoutGrid,
  TrendingUp
} from 'lucide-react'
import { createWorkspace } from '@/lib/actions/workspaces'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Workspace, Profile } from '@/lib/types'
import type { User } from '@supabase/supabase-js'

interface DashboardClientProps {
  workspaces: Workspace[]
  user: User
  profile: Profile | null
}

export function DashboardClient({ workspaces, user, profile }: DashboardClientProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error } = await createWorkspace({ name, description })

    if (error) {
      setError(error)
      setIsLoading(false)
      return
    }

    setName('')
    setDescription('')
    setIsCreateOpen(false)
    setIsLoading(false)
    router.refresh()
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  // Get initials for avatar
  const getInitials = (name: string | null | undefined) => {
    if (!name) return user.email?.charAt(0).toUpperCase() || 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background relative">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb orb-primary w-[600px] h-[600px] -top-64 -left-64 opacity-20" style={{ animationDelay: '0s' }} />
        <div className="orb orb-secondary w-[400px] h-[400px] top-1/2 -right-32 opacity-15" style={{ animationDelay: '3s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 glass">
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex size-9 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow duration-300">
              <Kanban className="size-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">
              Task<span className="gradient-text">Forge</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-full gradient-primary text-white font-semibold text-sm">
                {getInitials(profile?.full_name)}
              </div>
            </div>
            {/* Sign Out Button */}
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="bg-transparent border-border/50 hover:bg-white/5 hover:border-red-500/30 hover:text-red-400 transition-colors"
            >
              <LogOut className="size-4 mr-2" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 relative z-10">
        <div className="mx-auto max-w-7xl">
          {/* Stats Section */}
          <div className="grid gap-4 md:grid-cols-3 mb-8 animate-slide-down">
            <Card className="card-premium">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Workspaces</p>
                    <p className="text-3xl font-bold text-foreground">{workspaces.length}</p>
                  </div>
                  <div className="flex size-12 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20">
                    <LayoutGrid className="size-6 text-violet-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="card-premium">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Active Projects</p>
                    <p className="text-3xl font-bold text-foreground">0</p>
                  </div>
                  <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <FolderKanban className="size-6 text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="card-premium">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Team Members</p>
                    <p className="text-3xl font-bold text-foreground">1</p>
                  </div>
                  <div className="flex size-12 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <Users className="size-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Page Header */}
          <div className="mb-8 animate-slide-up">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="size-5 text-primary" />
              <span className="text-sm font-medium text-primary">Dashboard</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Your Workspaces</h1>
            <p className="text-muted-foreground">
              Manage your projects and collaborate with your team
            </p>
          </div>

          {/* Workspaces Grid */}
          {workspaces.length === 0 ? (
            <Card className="border-dashed border-2 border-border/50 bg-card/30 backdrop-blur-sm animate-scale-in">
              <CardHeader className="text-center py-16">
                <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/20">
                  <FolderKanban className="size-10 text-violet-400" />
                </div>
                <CardTitle className="text-2xl font-bold mb-2">No workspaces yet</CardTitle>
                <CardDescription className="text-balance max-w-md mx-auto text-base">
                  Create your first workspace to start organizing projects and collaborating with your team.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-16">
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="btn-premium rounded-full px-8">
                      <Plus className="size-5 mr-2" />
                      Create Workspace
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass border-border/40 sm:max-w-md">
                    <form onSubmit={handleCreateWorkspace}>
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Create New Workspace</DialogTitle>
                        <DialogDescription>
                          A workspace helps you organize projects for a specific team or purpose.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                          <Input
                            id="name"
                            placeholder="My Workspace"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="input-premium h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-sm font-medium">
                            Description <span className="text-muted-foreground">(optional)</span>
                          </Label>
                          <Textarea
                            id="description"
                            placeholder="What is this workspace for?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="input-premium resize-none"
                          />
                        </div>
                        {error && (
                          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                            {error}
                          </div>
                        )}
                      </div>
                      <DialogFooter className="gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateOpen(false)}
                          className="bg-transparent border-border/50"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="btn-premium">
                          {isLoading ? (
                            <>
                              <Loader2 className="size-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            'Create'
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="mb-6 flex justify-between items-center animate-slide-up stagger-1 opacity-0">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{workspaces.length}</span> {workspaces.length === 1 ? 'workspace' : 'workspaces'}
                </p>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogTrigger asChild>
                    <Button className="btn-premium rounded-full">
                      <Plus className="size-4 mr-2" />
                      New Workspace
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass border-border/40 sm:max-w-md">
                    <form onSubmit={handleCreateWorkspace}>
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Create New Workspace</DialogTitle>
                        <DialogDescription>
                          A workspace helps you organize projects for a specific team or purpose.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                          <Input
                            id="name"
                            placeholder="My Workspace"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="input-premium h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description" className="text-sm font-medium">
                            Description <span className="text-muted-foreground">(optional)</span>
                          </Label>
                          <Textarea
                            id="description"
                            placeholder="What is this workspace for?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="input-premium resize-none"
                          />
                        </div>
                        {error && (
                          <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                            {error}
                          </div>
                        )}
                      </div>
                      <DialogFooter className="gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateOpen(false)}
                          className="bg-transparent border-border/50"
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="btn-premium">
                          {isLoading ? (
                            <>
                              <Loader2 className="size-4 mr-2 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            'Create'
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {workspaces.map((workspace, index) => (
                  <Link
                    key={workspace.id}
                    href={`/workspace/${workspace.id}`}
                    className={`animate-slide-up stagger-${Math.min(index + 2, 5)} opacity-0`}
                  >
                    <Card className="h-full card-premium hover-lift hover-shine group cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-xl line-clamp-1 group-hover:text-primary transition-colors">
                              {workspace.name}
                            </CardTitle>
                            {workspace.description && (
                              <CardDescription className="mt-2 line-clamp-2">
                                {workspace.description}
                              </CardDescription>
                            )}
                          </div>
                          <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/20 group-hover:border-violet-500/40 transition-colors ml-4 shrink-0">
                            <FolderKanban className="size-6 text-violet-400" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Users className="size-4" />
                            <span>Team</span>
                          </div>
                          <span className="text-border">•</span>
                          <span>
                            {new Date(workspace.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
