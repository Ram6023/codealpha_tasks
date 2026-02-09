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
  ArrowLeft,
  FolderKanban,
  Calendar,
  Kanban,
  Loader2,
  Layers,
  CheckSquare
} from 'lucide-react'
import { createProject } from '@/lib/actions/projects'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Workspace, Project } from '@/lib/types'
import type { User } from '@supabase/supabase-js'

interface WorkspaceClientProps {
  workspace: Workspace
  projects: Project[]
  user: User
}

const PROJECT_COLORS = [
  { value: '#8b5cf6', label: 'Violet' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#06b6d4', label: 'Cyan' },
  { value: '#10b981', label: 'Emerald' },
  { value: '#f59e0b', label: 'Amber' },
  { value: '#ef4444', label: 'Red' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#6366f1', label: 'Indigo' },
]

export function WorkspaceClient({ workspace, projects, user }: WorkspaceClientProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#8b5cf6')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error } = await createProject({
      workspace_id: workspace.id,
      name,
      description,
      color,
    })

    if (error) {
      setError(error)
      setIsLoading(false)
      return
    }

    setName('')
    setDescription('')
    setColor('#8b5cf6')
    setIsCreateOpen(false)
    setIsLoading(false)
    router.refresh()
  }

  return (
    <div className="flex min-h-screen flex-col bg-background relative">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb orb-primary w-[500px] h-[500px] -top-48 -right-48 opacity-20" style={{ animationDelay: '0s' }} />
        <div className="orb orb-secondary w-[400px] h-[400px] bottom-0 -left-32 opacity-15" style={{ animationDelay: '3s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 glass">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="hover:bg-white/5 group">
                <ArrowLeft className="size-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Dashboard
              </Button>
            </Link>

            {/* Divider */}
            <div className="h-6 w-px bg-border/50" />

            {/* Workspace Info */}
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-violet-500/25">
                <Layers className="size-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-foreground">{workspace.name}</h1>
                {workspace.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                    {workspace.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="flex size-8 items-center justify-center rounded-lg gradient-primary shadow-md shadow-violet-500/20">
              <Kanban className="size-4 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight hidden sm:block">
              Task<span className="gradient-text">Forge</span>
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 relative z-10">
        <div className="mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="mb-8 animate-slide-down">
            <div className="flex items-center gap-2 mb-2">
              <FolderKanban className="size-5 text-primary" />
              <span className="text-sm font-medium text-primary">Projects</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Your Projects</h2>
            <p className="text-muted-foreground">
              Manage and organize your projects in this workspace
            </p>
          </div>

          {/* Projects Grid */}
          {projects.length === 0 ? (
            <Card className="border-dashed border-2 border-border/50 bg-card/30 backdrop-blur-sm animate-scale-in">
              <CardHeader className="text-center py-16">
                <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/20">
                  <FolderKanban className="size-10 text-violet-400" />
                </div>
                <CardTitle className="text-2xl font-bold mb-2">No projects yet</CardTitle>
                <CardDescription className="text-balance max-w-md mx-auto text-base">
                  Create your first project to start organizing tasks with beautiful Kanban boards.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-16">
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="btn-premium rounded-full px-8">
                      <Plus className="size-5 mr-2" />
                      Create Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass border-border/40 sm:max-w-md">
                    <form onSubmit={handleCreateProject}>
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Create New Project</DialogTitle>
                        <DialogDescription>
                          A project contains Kanban boards for organizing tasks.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                          <Input
                            id="name"
                            placeholder="My Project"
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
                            placeholder="What is this project about?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="input-premium resize-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Project Color</Label>
                          <div className="flex gap-2 flex-wrap">
                            {PROJECT_COLORS.map((c) => (
                              <button
                                key={c.value}
                                type="button"
                                className="size-10 rounded-xl border-2 transition-all hover:scale-110 hover:shadow-lg"
                                style={{
                                  backgroundColor: c.value,
                                  borderColor: color === c.value ? 'white' : 'transparent',
                                  boxShadow: color === c.value ? `0 0 20px ${c.value}50` : 'none'
                                }}
                                onClick={() => setColor(c.value)}
                                title={c.label}
                              />
                            ))}
                          </div>
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
              <div className="mb-6 flex justify-between items-center animate-slide-up">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{projects.length}</span> {projects.length === 1 ? 'project' : 'projects'}
                </p>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogTrigger asChild>
                    <Button className="btn-premium rounded-full">
                      <Plus className="size-4 mr-2" />
                      New Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass border-border/40 sm:max-w-md">
                    <form onSubmit={handleCreateProject}>
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Create New Project</DialogTitle>
                        <DialogDescription>
                          A project contains Kanban boards for organizing tasks.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                          <Input
                            id="name"
                            placeholder="My Project"
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
                            placeholder="What is this project about?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="input-premium resize-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Project Color</Label>
                          <div className="flex gap-2 flex-wrap">
                            {PROJECT_COLORS.map((c) => (
                              <button
                                key={c.value}
                                type="button"
                                className="size-10 rounded-xl border-2 transition-all hover:scale-110 hover:shadow-lg"
                                style={{
                                  backgroundColor: c.value,
                                  borderColor: color === c.value ? 'white' : 'transparent',
                                  boxShadow: color === c.value ? `0 0 20px ${c.value}50` : 'none'
                                }}
                                onClick={() => setColor(c.value)}
                                title={c.label}
                              />
                            ))}
                          </div>
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
                {projects.map((project, index) => (
                  <Link
                    key={project.id}
                    href={`/project/${project.id}`}
                    className={`animate-slide-up stagger-${Math.min(index + 1, 5)} opacity-0`}
                  >
                    <Card className="h-full card-premium hover-lift hover-shine group cursor-pointer overflow-hidden">
                      {/* Color Accent Bar */}
                      <div
                        className="h-1 w-full"
                        style={{ backgroundColor: project.color }}
                      />
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-xl line-clamp-1 group-hover:text-primary transition-colors">
                              {project.name}
                            </CardTitle>
                            {project.description && (
                              <CardDescription className="mt-2 line-clamp-2">
                                {project.description}
                              </CardDescription>
                            )}
                          </div>
                          <div
                            className="flex size-12 items-center justify-center rounded-xl shrink-0 transition-transform group-hover:scale-110"
                            style={{ backgroundColor: `${project.color}20`, border: `1px solid ${project.color}40` }}
                          >
                            <CheckSquare className="size-6" style={{ color: project.color }} />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="size-4" />
                          <span>
                            {new Date(project.created_at).toLocaleDateString('en-US', {
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
