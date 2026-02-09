'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Workspace } from '@/lib/types'

export async function getWorkspaces() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .order('created_at', { ascending: false })

  return { data: data as Workspace[] | null, error: error?.message }
}

export async function createWorkspace(formData: { name: string; description?: string }) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('workspaces')
    .insert({
      name: formData.name,
      description: formData.description || null,
      owner_id: user.id,
    })
    .select()
    .single()

  if (!error && data) {
    // Create activity log
    await supabase.from('activities').insert({
      workspace_id: data.id,
      user_id: user.id,
      action: 'created',
      entity_type: 'workspace',
      entity_id: data.id,
      metadata: { name: formData.name },
    })
  }

  revalidatePath('/dashboard')
  return { data: data as Workspace | null, error: error?.message }
}

export async function updateWorkspace(id: string, formData: { name?: string; description?: string }) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { data: null, error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('workspaces')
    .update({
      name: formData.name,
      description: formData.description,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  revalidatePath('/dashboard')
  return { data: data as Workspace | null, error: error?.message }
}

export async function deleteWorkspace(id: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('workspaces')
    .delete()
    .eq('id', id)

  revalidatePath('/dashboard')
  return { error: error?.message }
}
