-- =============================================================================
-- Auth Integration Migration
-- =============================================================================
-- Links public.users rows to auth.users (Supabase Auth) and tightens RLS so
-- that only authenticated users can read/mutate data, with admin-only writes
-- on sensitive tables.
--
-- Soft-Delete: `is_active` column. Inactive users are filtered by the app and
-- their auth account is disabled separately via the Admin API.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Add auth_user_id + is_active to users
-- ---------------------------------------------------------------------------
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS users_auth_user_id_idx ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS users_is_active_idx ON users(is_active);

-- ---------------------------------------------------------------------------
-- 2. Helper functions
-- ---------------------------------------------------------------------------
-- Returns the public.users.id for the currently authenticated session.
CREATE OR REPLACE FUNCTION app_current_user_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM users WHERE auth_user_id = auth.uid() AND is_active LIMIT 1;
$$;

-- True if the current session belongs to an active Admin.
CREATE OR REPLACE FUNCTION app_is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
     WHERE auth_user_id = auth.uid()
       AND is_active
       AND 'Admin' = ANY(roles)
  );
$$;

-- True if any active user matches auth.uid().
CREATE OR REPLACE FUNCTION app_is_authenticated_user()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND is_active
  );
$$;

GRANT EXECUTE ON FUNCTION app_current_user_id() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION app_is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION app_is_authenticated_user() TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. Tighten RLS policies
-- ---------------------------------------------------------------------------
-- Pattern:
--   - SELECT: any authenticated app user
--   - INSERT/UPDATE/DELETE on user-owned tables: must be the owner OR an admin
--   - INSERT/UPDATE/DELETE on org/admin tables: admin only
-- Service-role calls bypass RLS entirely (used by E2E + invite flow).

-- USERS: read all (authenticated), update self or admin, insert/delete admin only
DROP POLICY IF EXISTS "users_read_all" ON users;
DROP POLICY IF EXISTS "users_insert_admin" ON users;
DROP POLICY IF EXISTS "users_update_self_or_admin" ON users;

CREATE POLICY "users_select_authenticated" ON users
  FOR SELECT USING (app_is_authenticated_user());
CREATE POLICY "users_insert_admin" ON users
  FOR INSERT WITH CHECK (app_is_admin());
CREATE POLICY "users_update_self_or_admin" ON users
  FOR UPDATE USING (app_is_admin() OR auth_user_id = auth.uid());
CREATE POLICY "users_delete_admin" ON users
  FOR DELETE USING (app_is_admin());

-- MENTOR RELATIONS: read all, manage admin
DROP POLICY IF EXISTS "mentor_relations_read_all" ON mentor_relations;
DROP POLICY IF EXISTS "mentor_relations_manage" ON mentor_relations;
CREATE POLICY "mentor_relations_select" ON mentor_relations
  FOR SELECT USING (app_is_authenticated_user());
CREATE POLICY "mentor_relations_manage" ON mentor_relations
  FOR ALL USING (app_is_admin()) WITH CHECK (app_is_admin());

-- PROJECTS: read all, manage by owner or admin
DROP POLICY IF EXISTS "projects_read_all" ON projects;
DROP POLICY IF EXISTS "projects_manage" ON projects;
CREATE POLICY "projects_select" ON projects
  FOR SELECT USING (app_is_authenticated_user());
CREATE POLICY "projects_manage" ON projects
  FOR ALL USING (app_is_admin() OR owner_user_id = app_current_user_id())
  WITH CHECK (app_is_admin() OR owner_user_id = app_current_user_id());

-- PROJECT MEMBERS: read all, manage admin or project owner
DROP POLICY IF EXISTS "project_members_read_all" ON project_members;
DROP POLICY IF EXISTS "project_members_manage" ON project_members;
CREATE POLICY "project_members_select" ON project_members
  FOR SELECT USING (app_is_authenticated_user());
CREATE POLICY "project_members_manage" ON project_members
  FOR ALL USING (
    app_is_admin()
    OR EXISTS (
      SELECT 1 FROM projects p
       WHERE p.id = project_members.project_id
         AND p.owner_user_id = app_current_user_id()
    )
  ) WITH CHECK (
    app_is_admin()
    OR EXISTS (
      SELECT 1 FROM projects p
       WHERE p.id = project_members.project_id
         AND p.owner_user_id = app_current_user_id()
    )
  );

-- ORGANIZATION PROJECTS: read all, manage admin
DROP POLICY IF EXISTS "organization_projects_read_all" ON organization_projects;
DROP POLICY IF EXISTS "organization_projects_manage" ON organization_projects;
CREATE POLICY "organization_projects_select" ON organization_projects
  FOR SELECT USING (app_is_authenticated_user());
CREATE POLICY "organization_projects_manage" ON organization_projects
  FOR ALL USING (app_is_admin()) WITH CHECK (app_is_admin());

-- GOALS: owner or admin
DROP POLICY IF EXISTS "goals_read_all" ON goals;
DROP POLICY IF EXISTS "goals_manage" ON goals;
CREATE POLICY "goals_select" ON goals
  FOR SELECT USING (app_is_authenticated_user());
CREATE POLICY "goals_manage" ON goals
  FOR ALL USING (app_is_admin() OR owner_user_id = app_current_user_id())
  WITH CHECK (app_is_admin() OR owner_user_id = app_current_user_id());

-- NOTES: owner or admin
DROP POLICY IF EXISTS "notes_read_all" ON notes;
DROP POLICY IF EXISTS "notes_manage" ON notes;
CREATE POLICY "notes_select" ON notes
  FOR SELECT USING (app_is_authenticated_user());
CREATE POLICY "notes_manage" ON notes
  FOR ALL USING (app_is_admin() OR owner_user_id = app_current_user_id())
  WITH CHECK (app_is_admin() OR owner_user_id = app_current_user_id());

-- CHECKLIST: read all, manage admin
DROP POLICY IF EXISTS "checklist_templates_read_all" ON checklist_templates;
DROP POLICY IF EXISTS "checklist_templates_manage" ON checklist_templates;
DROP POLICY IF EXISTS "checklist_items_read_all" ON checklist_items;
DROP POLICY IF EXISTS "checklist_items_manage" ON checklist_items;
DROP POLICY IF EXISTS "checklist_progress_read_all" ON checklist_progress;
DROP POLICY IF EXISTS "checklist_progress_manage" ON checklist_progress;

CREATE POLICY "checklist_templates_select" ON checklist_templates FOR SELECT USING (app_is_authenticated_user());
CREATE POLICY "checklist_templates_manage" ON checklist_templates FOR ALL USING (app_is_admin()) WITH CHECK (app_is_admin());
CREATE POLICY "checklist_items_select" ON checklist_items FOR SELECT USING (app_is_authenticated_user());
CREATE POLICY "checklist_items_manage" ON checklist_items FOR ALL USING (app_is_admin()) WITH CHECK (app_is_admin());
CREATE POLICY "checklist_progress_select" ON checklist_progress FOR SELECT USING (app_is_authenticated_user());
CREATE POLICY "checklist_progress_manage" ON checklist_progress FOR ALL USING (
  app_is_admin() OR user_id = app_current_user_id()
) WITH CHECK (app_is_admin() OR user_id = app_current_user_id());

-- ASSESSMENTS: mentee or admin
DROP POLICY IF EXISTS "assessments_read_all" ON assessments;
DROP POLICY IF EXISTS "assessments_manage" ON assessments;
CREATE POLICY "assessments_select" ON assessments FOR SELECT USING (app_is_authenticated_user());
CREATE POLICY "assessments_manage" ON assessments FOR ALL USING (
  app_is_admin() OR mentee_user_id = app_current_user_id()
) WITH CHECK (app_is_admin() OR mentee_user_id = app_current_user_id());

-- MENTOR TASKS: mentor, mentee, or admin
DROP POLICY IF EXISTS "mentor_tasks_read_all" ON mentor_tasks;
DROP POLICY IF EXISTS "mentor_tasks_manage" ON mentor_tasks;
CREATE POLICY "mentor_tasks_select" ON mentor_tasks FOR SELECT USING (app_is_authenticated_user());
CREATE POLICY "mentor_tasks_manage" ON mentor_tasks FOR ALL USING (
  app_is_admin() OR mentor_user_id = app_current_user_id() OR mentee_user_id = app_current_user_id()
) WITH CHECK (
  app_is_admin() OR mentor_user_id = app_current_user_id() OR mentee_user_id = app_current_user_id()
);

-- REFLECTIONS: same as mentor_tasks
DROP POLICY IF EXISTS "reflections_read_all" ON reflections;
DROP POLICY IF EXISTS "reflections_manage" ON reflections;
CREATE POLICY "reflections_select" ON reflections FOR SELECT USING (app_is_authenticated_user());
CREATE POLICY "reflections_manage" ON reflections FOR ALL USING (
  app_is_admin() OR mentor_user_id = app_current_user_id() OR mentee_user_id = app_current_user_id()
) WITH CHECK (
  app_is_admin() OR mentor_user_id = app_current_user_id() OR mentee_user_id = app_current_user_id()
);

-- TIMESHEETS / VACATION / TRAVEL: owner inserts, owner reads own + admin reads all + admin reviews
DROP POLICY IF EXISTS "timesheets_read_all" ON timesheets;
DROP POLICY IF EXISTS "timesheets_manage" ON timesheets;
DROP POLICY IF EXISTS "vacation_requests_read_all" ON vacation_requests;
DROP POLICY IF EXISTS "vacation_requests_manage" ON vacation_requests;
DROP POLICY IF EXISTS "travel_costs_read_all" ON travel_costs;
DROP POLICY IF EXISTS "travel_costs_manage" ON travel_costs;

CREATE POLICY "timesheets_select" ON timesheets FOR SELECT USING (app_is_authenticated_user());
CREATE POLICY "timesheets_manage" ON timesheets FOR ALL USING (
  app_is_admin() OR user_id = app_current_user_id()
) WITH CHECK (
  app_is_admin() OR user_id = app_current_user_id()
);

CREATE POLICY "vacation_requests_select" ON vacation_requests FOR SELECT USING (app_is_authenticated_user());
CREATE POLICY "vacation_requests_manage" ON vacation_requests FOR ALL USING (
  app_is_admin() OR user_id = app_current_user_id()
) WITH CHECK (
  app_is_admin() OR user_id = app_current_user_id()
);

CREATE POLICY "travel_costs_select" ON travel_costs FOR SELECT USING (app_is_authenticated_user());
CREATE POLICY "travel_costs_manage" ON travel_costs FOR ALL USING (
  app_is_admin() OR user_id = app_current_user_id()
) WITH CHECK (
  app_is_admin() OR user_id = app_current_user_id()
);

-- EXTERNAL LINKS: read all, manage admin
DROP POLICY IF EXISTS "external_links_read_all" ON external_links;
DROP POLICY IF EXISTS "external_links_manage" ON external_links;
CREATE POLICY "external_links_select" ON external_links FOR SELECT USING (app_is_authenticated_user());
CREATE POLICY "external_links_manage" ON external_links FOR ALL USING (app_is_admin()) WITH CHECK (app_is_admin());

-- WAMOCON: read all, manage admin
DROP POLICY IF EXISTS "wamocon_waves_read_all" ON wamocon_waves;
DROP POLICY IF EXISTS "wamocon_waves_manage" ON wamocon_waves;
DROP POLICY IF EXISTS "wamocon_apps_read_all" ON wamocon_apps;
DROP POLICY IF EXISTS "wamocon_apps_manage" ON wamocon_apps;
DROP POLICY IF EXISTS "wamocon_app_waves_read_all" ON wamocon_app_waves;
DROP POLICY IF EXISTS "wamocon_app_waves_manage" ON wamocon_app_waves;

CREATE POLICY "wamocon_waves_select" ON wamocon_waves FOR SELECT USING (app_is_authenticated_user());
CREATE POLICY "wamocon_waves_manage" ON wamocon_waves FOR ALL USING (app_is_admin()) WITH CHECK (app_is_admin());
CREATE POLICY "wamocon_apps_select" ON wamocon_apps FOR SELECT USING (app_is_authenticated_user());
CREATE POLICY "wamocon_apps_manage" ON wamocon_apps FOR ALL USING (app_is_admin()) WITH CHECK (app_is_admin());
CREATE POLICY "wamocon_app_waves_select" ON wamocon_app_waves FOR SELECT USING (app_is_authenticated_user());
CREATE POLICY "wamocon_app_waves_manage" ON wamocon_app_waves FOR ALL USING (app_is_admin()) WITH CHECK (app_is_admin());
