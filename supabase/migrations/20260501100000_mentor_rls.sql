-- ============================================================================
-- Mentor RLS extension
-- ----------------------------------------------------------------------------
-- Mentors must be able to manage their mentees' goals, mentor_tasks and
-- reflections. Without this they can read everything (already allowed by
-- *_select policies) but inserts/updates fail silently in the UI.
-- ============================================================================

CREATE OR REPLACE FUNCTION app_is_mentor_of(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
      FROM mentor_relations mr
     WHERE mr.mentor_user_id = app_current_user_id()
       AND mr.mentee_user_id = target_user_id
       AND mr.active = TRUE
  );
$$;

GRANT EXECUTE ON FUNCTION app_is_mentor_of(uuid) TO anon, authenticated;

-- GOALS: mentor of owner may also manage
DROP POLICY IF EXISTS "goals_manage" ON goals;
CREATE POLICY "goals_manage" ON goals
  FOR ALL
  USING (
    app_is_admin()
    OR owner_user_id = app_current_user_id()
    OR app_is_mentor_of(owner_user_id)
  )
  WITH CHECK (
    app_is_admin()
    OR owner_user_id = app_current_user_id()
    OR app_is_mentor_of(owner_user_id)
  );

-- MENTOR_TASKS: mentor of mentee, the mentee themselves, or admin
DROP POLICY IF EXISTS "mentor_tasks_manage" ON mentor_tasks;
DROP POLICY IF EXISTS "mentor_tasks_read_all" ON mentor_tasks;
DROP POLICY IF EXISTS "mentor_tasks_select" ON mentor_tasks;
CREATE POLICY "mentor_tasks_select" ON mentor_tasks
  FOR SELECT USING (app_is_authenticated_user());
CREATE POLICY "mentor_tasks_manage" ON mentor_tasks
  FOR ALL
  USING (
    app_is_admin()
    OR mentor_user_id = app_current_user_id()
    OR mentee_user_id = app_current_user_id()
  )
  WITH CHECK (
    app_is_admin()
    OR mentor_user_id = app_current_user_id()
    OR mentee_user_id = app_current_user_id()
  );

-- REFLECTIONS: same rules as mentor_tasks
DROP POLICY IF EXISTS "reflections_manage" ON reflections;
DROP POLICY IF EXISTS "reflections_read_all" ON reflections;
DROP POLICY IF EXISTS "reflections_select" ON reflections;
CREATE POLICY "reflections_select" ON reflections
  FOR SELECT USING (app_is_authenticated_user());
CREATE POLICY "reflections_manage" ON reflections
  FOR ALL
  USING (
    app_is_admin()
    OR mentor_user_id = app_current_user_id()
    OR mentee_user_id = app_current_user_id()
  )
  WITH CHECK (
    app_is_admin()
    OR mentor_user_id = app_current_user_id()
    OR mentee_user_id = app_current_user_id()
  );
