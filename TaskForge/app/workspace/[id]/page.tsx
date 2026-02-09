import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WorkspaceClient } from './workspace-client'
import type { Workspace, Project } from '@/lib/types'

export default async function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Get workspace
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', id)
    .single()

  if (!workspace) {
    redirect('/dashboard')
  }

  // Get projects in workspace
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('workspace_id', id)
    .order('created_at', { ascending: false })

  return (
    <WorkspaceClient 
      workspace={workspace as Workspace}
      projects={projects as Project[] || []}
      user={user}
    />
  )
}
