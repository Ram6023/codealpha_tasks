-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Create workspaces table
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workspace_members table
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- Enable RLS and add policies for workspaces
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- Workspaces policies (users can see workspaces they're members of)
CREATE POLICY "workspaces_select_member" ON public.workspaces FOR SELECT 
  USING (
    auth.uid() = owner_id OR 
    EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_id = workspaces.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "workspaces_insert_own" ON public.workspaces FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "workspaces_update_own" ON public.workspaces FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "workspaces_delete_own" ON public.workspaces FOR DELETE USING (auth.uid() = owner_id);

-- Enable RLS and add policies for workspace_members
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workspace_members_select_member" ON public.workspace_members FOR SELECT 
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM workspaces 
      WHERE id = workspace_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "workspace_members_insert_owner" ON public.workspace_members FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspaces 
      WHERE id = workspace_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "workspace_members_delete_owner" ON public.workspace_members FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM workspaces 
      WHERE id = workspace_id AND owner_id = auth.uid()
    )
  );

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_select_workspace_member" ON public.projects FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM workspaces w
      WHERE w.id = workspace_id AND (
        w.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = w.id AND user_id = auth.uid())
      )
    )
  );

CREATE POLICY "projects_insert_workspace_member" ON public.projects FOR INSERT 
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM workspaces w
      WHERE w.id = workspace_id AND (
        w.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = w.id AND user_id = auth.uid())
      )
    )
  );

CREATE POLICY "projects_update_workspace_member" ON public.projects FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM workspaces w
      WHERE w.id = workspace_id AND (
        w.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = w.id AND user_id = auth.uid())
      )
    )
  );

CREATE POLICY "projects_delete_workspace_owner" ON public.projects FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM workspaces w
      WHERE w.id = workspace_id AND w.owner_id = auth.uid()
    )
  );

-- Create lists table (columns in Kanban board)
CREATE TABLE IF NOT EXISTS public.lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lists_select_project_member" ON public.lists FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN workspaces w ON p.workspace_id = w.id
      WHERE p.id = project_id AND (
        w.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = w.id AND user_id = auth.uid())
      )
    )
  );

CREATE POLICY "lists_insert_project_member" ON public.lists FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN workspaces w ON p.workspace_id = w.id
      WHERE p.id = project_id AND (
        w.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = w.id AND user_id = auth.uid())
      )
    )
  );

CREATE POLICY "lists_update_project_member" ON public.lists FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN workspaces w ON p.workspace_id = w.id
      WHERE p.id = project_id AND (
        w.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = w.id AND user_id = auth.uid())
      )
    )
  );

CREATE POLICY "lists_delete_project_member" ON public.lists FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      JOIN workspaces w ON p.workspace_id = w.id
      WHERE p.id = project_id AND (
        w.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = w.id AND user_id = auth.uid())
      )
    )
  );

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID NOT NULL REFERENCES public.lists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  position INTEGER NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMPTZ,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_select_project_member" ON public.tasks FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM lists l
      JOIN projects p ON l.project_id = p.id
      JOIN workspaces w ON p.workspace_id = w.id
      WHERE l.id = list_id AND (
        w.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = w.id AND user_id = auth.uid())
      )
    )
  );

CREATE POLICY "tasks_insert_project_member" ON public.tasks FOR INSERT 
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM lists l
      JOIN projects p ON l.project_id = p.id
      JOIN workspaces w ON p.workspace_id = w.id
      WHERE l.id = list_id AND (
        w.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = w.id AND user_id = auth.uid())
      )
    )
  );

CREATE POLICY "tasks_update_project_member" ON public.tasks FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM lists l
      JOIN projects p ON l.project_id = p.id
      JOIN workspaces w ON p.workspace_id = w.id
      WHERE l.id = list_id AND (
        w.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = w.id AND user_id = auth.uid())
      )
    )
  );

CREATE POLICY "tasks_delete_project_member" ON public.tasks FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM lists l
      JOIN projects p ON l.project_id = p.id
      JOIN workspaces w ON p.workspace_id = w.id
      WHERE l.id = list_id AND (
        w.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = w.id AND user_id = auth.uid())
      )
    )
  );

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_select_task_member" ON public.comments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN lists l ON t.list_id = l.id
      JOIN projects p ON l.project_id = p.id
      JOIN workspaces w ON p.workspace_id = w.id
      WHERE t.id = task_id AND (
        w.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = w.id AND user_id = auth.uid())
      )
    )
  );

CREATE POLICY "comments_insert_own" ON public.comments FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN lists l ON t.list_id = l.id
      JOIN projects p ON l.project_id = p.id
      JOIN workspaces w ON p.workspace_id = w.id
      WHERE t.id = task_id AND (
        w.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = w.id AND user_id = auth.uid())
      )
    )
  );

CREATE POLICY "comments_update_own" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "comments_delete_own" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- Create activities table (audit log)
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activities_select_workspace_member" ON public.activities FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM workspaces w
      WHERE w.id = workspace_id AND (
        w.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = w.id AND user_id = auth.uid())
      )
    )
  );

CREATE POLICY "activities_insert_workspace_member" ON public.activities FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM workspaces w
      WHERE w.id = workspace_id AND (
        w.owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM workspace_members WHERE workspace_id = w.id AND user_id = auth.uid())
      )
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON public.workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_workspace_id ON public.projects(workspace_id);
CREATE INDEX IF NOT EXISTS idx_lists_project_id ON public.lists(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_list_id ON public.tasks(list_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_comments_task_id ON public.comments(task_id);
CREATE INDEX IF NOT EXISTS idx_activities_workspace_id ON public.activities(workspace_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);
