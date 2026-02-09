'use client'

import React from "react"

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
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
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  ArrowLeft,
  Calendar as CalendarIcon,
  Flag,
  Kanban,
  GripVertical,
  Loader2,
  ListTodo
} from 'lucide-react'
import { createTask, createList, moveTask } from '@/lib/actions/tasks'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Project, List, Task } from '@/lib/types'
import type { User } from '@supabase/supabase-js'
import { cn } from '@/lib/utils'

interface KanbanBoardProps {
  project: Project & { workspaces: { name: string, id: string } }
  lists: List[]
  tasks: Task[]
  user: User
}

const PRIORITY_COLORS = {
  low: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  urgent: 'bg-red-500/10 text-red-400 border-red-500/30',
}

const PRIORITY_BUTTON_COLORS = {
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/40 hover:bg-blue-500/30',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/40 hover:bg-amber-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/40 hover:bg-orange-500/30',
  urgent: 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/30',
}

export function KanbanBoard({ project, lists, tasks, user }: KanbanBoardProps) {
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [isCreateListOpen, setIsCreateListOpen] = useState(false)
  const [selectedList, setSelectedList] = useState<string | null>(null)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium')
  const [listName, setListName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverList, setDragOverList] = useState<string | null>(null)
  const router = useRouter()

  const tasksByList = useMemo(() => {
    const grouped: Record<string, Task[]> = {}
    lists.forEach(list => {
      grouped[list.id] = tasks.filter(task => task.list_id === list.id)
    })
    return grouped
  }, [lists, tasks])

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedList) return

    setIsLoading(true)
    setError(null)

    const { error } = await createTask({
      list_id: selectedList,
      title: taskTitle,
      description: taskDescription,
      priority: taskPriority,
    })

    if (error) {
      setError(error)
      setIsLoading(false)
      return
    }

    setTaskTitle('')
    setTaskDescription('')
    setTaskPriority('medium')
    setIsCreateTaskOpen(false)
    setIsLoading(false)
    router.refresh()
  }

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error } = await createList({
      project_id: project.id,
      name: listName,
    })

    if (error) {
      setError(error)
      setIsLoading(false)
      return
    }

    setListName('')
    setIsCreateListOpen(false)
    setIsLoading(false)
    router.refresh()
  }

  const handleDragStart = (task: Task) => {
    setDraggedTask(task)
  }

  const handleDragOver = (e: React.DragEvent, listId: string) => {
    e.preventDefault()
    setDragOverList(listId)
  }

  const handleDragLeave = () => {
    setDragOverList(null)
  }

  const handleDrop = async (listId: string) => {
    if (!draggedTask) return

    const targetList = tasksByList[listId] || []
    const newPosition = targetList.length

    await moveTask(draggedTask.id, listId, newPosition)
    setDraggedTask(null)
    setDragOverList(null)
    router.refresh()
  }

  const openCreateTaskDialog = (listId: string) => {
    setSelectedList(listId)
    setIsCreateTaskOpen(true)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background relative">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="orb w-[500px] h-[500px] -top-48 -right-48 opacity-15" style={{ backgroundColor: project.color, animationDelay: '0s' }} />
        <div className="orb orb-secondary w-[400px] h-[400px] bottom-0 -left-32 opacity-10" style={{ animationDelay: '3s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 glass">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            {/* Back Button */}
            <Link href={`/workspace/${project.workspaces.id}`}>
              <Button variant="ghost" size="sm" className="hover:bg-white/5 group">
                <ArrowLeft className="size-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back
              </Button>
            </Link>

            {/* Divider */}
            <div className="h-6 w-px bg-border/50" />

            {/* Project Info */}
            <div className="flex items-center gap-3">
              <div
                className="flex size-9 items-center justify-center rounded-xl shadow-lg"
                style={{ backgroundColor: project.color, boxShadow: `0 8px 25px ${project.color}40` }}
              >
                <ListTodo className="size-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-semibold text-foreground">{project.name}</h1>
                  <span className="text-xs text-muted-foreground px-2 py-0.5 rounded-full bg-muted/50">
                    in {project.workspaces.name}
                  </span>
                </div>
                {project.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1 max-w-sm">
                    {project.description}
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

      {/* Kanban Board */}
      <main className="flex-1 overflow-x-auto p-6 relative z-10">
        <div className="flex gap-5 min-h-full pb-4">
          {lists.map((list, listIndex) => (
            <div
              key={list.id}
              className={`flex-shrink-0 w-80 animate-slide-up stagger-${Math.min(listIndex + 1, 5)} opacity-0`}
              onDragOver={(e) => handleDragOver(e, list.id)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(list.id)}
            >
              <Card className={cn(
                "h-full flex flex-col card-premium transition-all duration-200",
                dragOverList === list.id && "border-primary/50 bg-primary/5"
              )}>
                <CardHeader className="flex-shrink-0 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-semibold">{list.name}</CardTitle>
                      <Badge
                        variant="secondary"
                        className="rounded-full bg-muted/50 text-muted-foreground text-xs font-medium"
                      >
                        {tasksByList[list.id]?.length || 0}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openCreateTaskDialog(list.id)}
                      className="hover:bg-white/5 hover:text-primary"
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-3 pt-0 min-h-[200px]">
                  {tasksByList[list.id]?.map((task) => (
                    <Card
                      key={task.id}
                      className={cn(
                        "cursor-grab active:cursor-grabbing",
                        "bg-card/50 hover:bg-card/80 border-border/50",
                        "transition-all duration-200",
                        "hover:shadow-lg hover:shadow-black/10 hover:-translate-y-0.5",
                        draggedTask?.id === task.id && "opacity-50 scale-95"
                      )}
                      draggable
                      onDragStart={() => handleDragStart(task)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Drag Handle & Title */}
                          <div className="flex items-start gap-2">
                            <GripVertical className="size-4 text-muted-foreground/50 mt-0.5 shrink-0" />
                            <p className="font-medium text-sm leading-relaxed flex-1">{task.title}</p>
                          </div>

                          {/* Description */}
                          {task.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed ml-6">
                              {task.description}
                            </p>
                          )}

                          {/* Tags */}
                          <div className="flex items-center gap-2 flex-wrap ml-6">
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-xs gap-1 capitalize font-medium',
                                PRIORITY_COLORS[task.priority]
                              )}
                            >
                              <Flag className="size-3" />
                              {task.priority}
                            </Badge>
                            {task.due_date && (
                              <Badge
                                variant="outline"
                                className="text-xs gap-1 border-border/50 text-muted-foreground"
                              >
                                <CalendarIcon className="size-3" />
                                {new Date(task.due_date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Empty State */}
                  {(!tasksByList[list.id] || tasksByList[list.id].length === 0) && (
                    <div className="py-12 text-center">
                      <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-xl bg-muted/30 border border-border/30">
                        <ListTodo className="size-5 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">No tasks yet</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-white/5 hover:text-primary"
                        onClick={() => openCreateTaskDialog(list.id)}
                      >
                        <Plus className="size-4 mr-2" />
                        Add task
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}

          {/* Add List Card */}
          <div className="flex-shrink-0 w-80 animate-slide-up stagger-5 opacity-0">
            <Dialog open={isCreateListOpen} onOpenChange={setIsCreateListOpen}>
              <DialogTrigger asChild>
                <Card className="h-48 border-dashed border-2 border-border/30 bg-card/20 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group">
                  <CardContent className="flex flex-col items-center justify-center h-full gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-muted/30 border border-border/30 group-hover:border-primary/30 group-hover:bg-primary/10 transition-colors">
                      <Plus className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Add List</p>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="glass border-border/40 sm:max-w-md">
                <form onSubmit={handleCreateList}>
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Create New List</DialogTitle>
                    <DialogDescription>
                      Add a new column to organize your tasks.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-6">
                    <div className="space-y-2">
                      <Label htmlFor="list-name" className="text-sm font-medium">Name</Label>
                      <Input
                        id="list-name"
                        placeholder="e.g., In Review"
                        value={listName}
                        onChange={(e) => setListName(e.target.value)}
                        required
                        className="input-premium h-11"
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
                      onClick={() => setIsCreateListOpen(false)}
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
        </div>
      </main>

      {/* Create Task Dialog */}
      <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
        <DialogContent className="glass border-border/40 sm:max-w-md">
          <form onSubmit={handleCreateTask}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Create New Task</DialogTitle>
              <DialogDescription>
                Add a new task to your board.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-6">
              <div className="space-y-2">
                <Label htmlFor="task-title" className="text-sm font-medium">Title</Label>
                <Input
                  id="task-title"
                  placeholder="Task title"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                  className="input-premium h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-description" className="text-sm font-medium">
                  Description <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="task-description"
                  placeholder="Add more details..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  rows={3}
                  className="input-premium resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Priority</Label>
                <div className="flex gap-2 flex-wrap">
                  {(['low', 'medium', 'high', 'urgent'] as const).map((priority) => (
                    <Button
                      key={priority}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setTaskPriority(priority)}
                      className={cn(
                        "capitalize transition-all",
                        taskPriority === priority
                          ? PRIORITY_BUTTON_COLORS[priority]
                          : "bg-transparent border-border/50 hover:bg-white/5"
                      )}
                    >
                      <Flag className="size-3 mr-1.5" />
                      {priority}
                    </Button>
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
                onClick={() => setIsCreateTaskOpen(false)}
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
  )
}
