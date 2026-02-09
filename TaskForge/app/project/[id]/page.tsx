import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { KanbanBoard } from './kanban-board'
import type { Project, List, Task } from '@/lib/types'

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Get project
  const { data: project } = await supabase
    .from('projects')
    .select('*, workspaces(*)')
    .eq('id', id)
    .single()

  if (!project) {
    redirect('/dashboard')
  }

  // Get lists
  const { data: lists } = await supabase
    .from('lists')
    .select('*')
    .eq('project_id', id)
    .order('position', { ascending: true })

  // Get all tasks for all lists
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*, profiles(*)')
    .in('list_id', lists?.map(l => l.id) || [])
    .order('position', { ascending: true })

  return (
    <KanbanBoard 
      project={project as Project & { workspaces: { name: string, id: string } }}
      lists={lists as List[] || []}
      tasks={tasks as Task[] || []}
      user={user}
    />
  )
}
