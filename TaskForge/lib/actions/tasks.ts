'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Task, List } from '@/lib/types'

export async function getLists(projectId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('lists')
    .select('*')
    .eq('project_id', projectId)
    .order('position', { ascending: true })

  return { data: data as List[] | null, error: error?.message }
}

export async function getTasks(listId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('list_id', listId)
    .order('position', { ascending: true })

  return { data: data as Task[] | null, error: error?.message }
}

export async function createTask(formData: {
  list_id: string
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }

  // Get the max position in the list
  const { data: tasks } = await supabase
    .from('tasks')
    .select('position')
    .eq('list_id', formData.list_id)
    .order('position', { ascending: false })
    .limit(1)

  const position = tasks && tasks.length > 0 ? tasks[0].position + 1 : 0

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      list_id: formData.list_id,
      title: formData.title,
      description: formData.description || null,
      priority: formData.priority || 'medium',
      due_date: formData.due_date || null,
      created_by: user.id,
      position,
    })
    .select()
    .single()

  revalidatePath('/project/[id]', 'page')
  return { data: data as Task | null, error: error?.message }
}

export async function updateTask(id: string, formData: {
  title?: string
  description?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  due_date?: string
  assigned_to?: string
  list_id?: string
  position?: number
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('tasks')
    .update({
      ...formData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  revalidatePath('/project/[id]', 'page')
  return { data: data as Task | null, error: error?.message }
}

export async function deleteTask(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  revalidatePath('/project/[id]', 'page')
  return { error: error?.message }
}

export async function moveTask(taskId: string, newListId: string, newPosition: number) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Update the task's list and position
  const { error } = await supabase
    .from('tasks')
    .update({
      list_id: newListId,
      position: newPosition,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId)

  revalidatePath('/project/[id]', 'page')
  return { error: error?.message }
}

export async function createList(formData: { project_id: string; name: string }) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }

  // Get the max position in the project
  const { data: lists } = await supabase
    .from('lists')
    .select('position')
    .eq('project_id', formData.project_id)
    .order('position', { ascending: false })
    .limit(1)

  const position = lists && lists.length > 0 ? lists[0].position + 1 : 0

  const { data, error } = await supabase
    .from('lists')
    .insert({
      project_id: formData.project_id,
      name: formData.name,
      position,
    })
    .select()
    .single()

  revalidatePath('/project/[id]', 'page')
  return { data: data as List | null, error: error?.message }
}
