-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "workspaces_select_member" ON public.workspaces;
DROP POLICY IF EXISTS "workspace_members_select_member" ON public.workspace_members;
DROP POLICY IF EXISTS "workspace_members_insert_owner" ON public.workspace_members;

-- Create a security definer function to check workspace membership without recursion
CREATE OR REPLACE FUNCTION public.is_workspace_member(workspace_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = workspace_uuid AND user_id = user_uuid
  );
$$;

-- Create a security definer function to check workspace ownership without recursion
CREATE OR REPLACE FUNCTION public.is_workspace_owner(workspace_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspaces
    WHERE id = workspace_uuid AND owner_id = user_uuid
  );
$$;

-- Recreate workspaces SELECT policy using the function
CREATE POLICY "workspaces_select_member" ON public.workspaces FOR SELECT 
  USING (
    auth.uid() = owner_id OR 
    public.is_workspace_member(id, auth.uid())
  );

-- Recreate workspace_members policies using simpler checks
-- Users can see their own memberships or memberships in workspaces they own
CREATE POLICY "workspace_members_select_member" ON public.workspace_members FOR SELECT 
  USING (
    user_id = auth.uid() OR 
    public.is_workspace_owner(workspace_id, auth.uid())
  );

-- Only workspace owners can add members
CREATE POLICY "workspace_members_insert_owner" ON public.workspace_members FOR INSERT 
  WITH CHECK (
    public.is_workspace_owner(workspace_id, auth.uid())
  );
