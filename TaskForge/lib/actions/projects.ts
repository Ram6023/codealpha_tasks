'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Project } from '@/lib/types'

export async function getProjects(workspaceId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  return { data: data as Project[] | null, error: error?.message }
}

export async function createProject(formData: { 
  workspace_id: string
  name: string
  description?: string
  color?: string
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('projects')
    .insert({
      workspace_id: formData.workspace_id,
      name: formData.name,
      description: formData.description || null,
      color: formData.color || '#3b82f6',
      created_by: user.id,
    })
    .select()
    .single()

  if (!error && data) {
    // Create default lists
    await supabase.from('lists').insert([
      { project_id: data.id, name: 'To Do', position: 0 },
      { project_id: data.id, name: 'In Progress', position: 1 },
      { project_id: data.id, name: 'Done', position: 2 },
    ])

    // Create activity log
    await supabase.from('activities').insert({
      workspace_id: formData.workspace_id,
      user_id: user.id,
      action: 'created',
      entity_type: 'project',
      entity_id: data.id,
      metadata: { name: formData.name },
    })
  }

  revalidatePath('/dashboard')
  revalidatePath(`/workspace/${formData.workspace_id}`)
  return { data: data as Project | null, error: error?.message }
}

export async function updateProject(id: string, formData: { 
  name?: string
  description?: string
  color?: string
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('projects')
    .update({
      name: formData.name,
      description: formData.description,
      color: formData.color,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  revalidatePath('/dashboard')
  return { data: data as Project | null, error: error?.message }
}

export async function deleteProject(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  revalidatePath('/dashboard')
  return { error: error?.message }
}
