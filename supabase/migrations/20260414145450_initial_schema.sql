-- RELDA Initial Schema Migration
-- Creates all domain tables with RLS enabled

-- ============================================================================
-- USERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  level TEXT NOT NULL DEFAULT 'PRAKTIKANT'
    CHECK (level IN ('PRAKTIKANT','JUNIOR_CONSULTANT','CONSULTANT','JUNIOR_MANAGER','MANAGER','SENIOR_MANAGER','ADMIN')),
  roles TEXT[] NOT NULL DEFAULT '{Mentee}',
  cv_file_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_read_all" ON users FOR SELECT USING (true);
CREATE POLICY "users_insert_admin" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "users_update_self_or_admin" ON users FOR UPDATE USING (true);

-- ============================================================================
-- MENTOR RELATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS mentor_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentee_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  since TIMESTAMPTZ NOT NULL DEFAULT now(),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE mentor_relations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mentor_relations_read_all" ON mentor_relations FOR SELECT USING (true);
CREATE POLICY "mentor_relations_manage" ON mentor_relations FOR ALL USING (true);

-- ============================================================================
-- PROJECTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description TEXT NOT NULL DEFAULT '',
  target_date DATE,
  jira_url TEXT NOT NULL DEFAULT '',
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects_read_all" ON projects FOR SELECT USING (true);
CREATE POLICY "projects_manage" ON projects FOR ALL USING (true);

-- ============================================================================
-- PROJECT MEMBERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_label TEXT NOT NULL DEFAULT '',
  UNIQUE(project_id, user_id)
);

ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "project_members_read_all" ON project_members FOR SELECT USING (true);
CREATE POLICY "project_members_manage" ON project_members FOR ALL USING (true);

-- ============================================================================
-- ORGANIZATION PROJECTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS organization_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'PLANNING'
    CHECK (status IN ('PLANNING','ACTIVE','COMPLETED','ARCHIVED')),
  visibility TEXT NOT NULL DEFAULT 'ORGANIZATION',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE organization_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_projects_read_all" ON organization_projects FOR SELECT USING (true);
CREATE POLICY "org_projects_manage" ON organization_projects FOR ALL USING (true);

-- ============================================================================
-- GOALS
-- ============================================================================
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_by TEXT NOT NULL DEFAULT 'SELF'
    CHECK (created_by IN ('SELF','MENTOR')),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'OPEN'
    CHECK (status IN ('OPEN','IN_PROGRESS','DONE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "goals_read_all" ON goals FOR SELECT USING (true);
CREATE POLICY "goals_manage" ON goals FOR ALL USING (true);

-- ============================================================================
-- NOTES
-- ============================================================================
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scope TEXT NOT NULL DEFAULT 'GENERAL'
    CHECK (scope IN ('GENERAL','PROJECT','GOAL','MENTEE_PRIVATE')),
  ref_id UUID,
  visibility TEXT NOT NULL DEFAULT 'PRIVATE_SELF'
    CHECK (visibility IN ('PRIVATE_SELF','PRIVATE_MENTOR')),
  body TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notes_read_all" ON notes FOR SELECT USING (true);
CREATE POLICY "notes_manage" ON notes FOR ALL USING (true);

-- ============================================================================
-- CHECKLIST TEMPLATES
-- ============================================================================
CREATE TABLE IF NOT EXISTS checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_level TEXT NOT NULL,
  to_level TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE checklist_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "checklist_templates_read_all" ON checklist_templates FOR SELECT USING (true);
CREATE POLICY "checklist_templates_manage" ON checklist_templates FOR ALL USING (true);

-- ============================================================================
-- CHECKLIST ITEMS
-- ============================================================================
CREATE TABLE IF NOT EXISTS checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES checklist_templates(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0
);

ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "checklist_items_read_all" ON checklist_items FOR SELECT USING (true);
CREATE POLICY "checklist_items_manage" ON checklist_items FOR ALL USING (true);

-- ============================================================================
-- CHECKLIST PROGRESS
-- ============================================================================
CREATE TABLE IF NOT EXISTS checklist_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES checklist_templates(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES checklist_items(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'OPEN'
    CHECK (status IN ('OPEN','PROVEN','REVIEWED','APPROVED')),
  notes TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE checklist_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "checklist_progress_read_all" ON checklist_progress FOR SELECT USING (true);
CREATE POLICY "checklist_progress_manage" ON checklist_progress FOR ALL USING (true);

-- ============================================================================
-- ASSESSMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentee_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_level TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT','SUBMITTED','MENTOR_CONFIRMED','FAILED')),
  mentor_confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assessments_read_all" ON assessments FOR SELECT USING (true);
CREATE POLICY "assessments_manage" ON assessments FOR ALL USING (true);

-- ============================================================================
-- MENTOR TASKS
-- ============================================================================
CREATE TABLE IF NOT EXISTS mentor_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentee_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentor_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING','IN_PROGRESS','COMPLETED','APPROVED','REJECTED')),
  priority TEXT NOT NULL DEFAULT 'MEDIUM'
    CHECK (priority IN ('LOW','MEDIUM','HIGH')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE mentor_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mentor_tasks_read_all" ON mentor_tasks FOR SELECT USING (true);
CREATE POLICY "mentor_tasks_manage" ON mentor_tasks FOR ALL USING (true);

-- ============================================================================
-- REFLECTIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentee_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mentor_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING','IN_PROGRESS','COMPLETED')),
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reflections_read_all" ON reflections FOR SELECT USING (true);
CREATE POLICY "reflections_manage" ON reflections FOR ALL USING (true);

-- ============================================================================
-- TIMESHEETS
-- ============================================================================
CREATE TABLE IF NOT EXISTS timesheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  hours NUMERIC(5,2) NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  task_type TEXT NOT NULL DEFAULT 'Other'
    CHECK (task_type IN ('Testing','Development','Management','Documentation','Training','Meeting','Other')),
  status TEXT NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT','SUBMITTED','APPROVED','REJECTED')),
  submitted_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE timesheets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "timesheets_read_all" ON timesheets FOR SELECT USING (true);
CREATE POLICY "timesheets_manage" ON timesheets FOR ALL USING (true);

-- ============================================================================
-- VACATION REQUESTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS vacation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days INT NOT NULL DEFAULT 0,
  reason TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING','APPROVED','REJECTED')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  comments TEXT NOT NULL DEFAULT ''
);

ALTER TABLE vacation_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vacation_requests_read_all" ON vacation_requests FOR SELECT USING (true);
CREATE POLICY "vacation_requests_manage" ON vacation_requests FOR ALL USING (true);

-- ============================================================================
-- TRAVEL COSTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS travel_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Other'
    CHECK (category IN ('Transportation','Accommodation','Meals','Other')),
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING','APPROVED','REJECTED')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  comments TEXT NOT NULL DEFAULT ''
);

ALTER TABLE travel_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "travel_costs_read_all" ON travel_costs FOR SELECT USING (true);
CREATE POLICY "travel_costs_manage" ON travel_costs FOR ALL USING (true);

-- ============================================================================
-- EXTERNAL LINKS
-- ============================================================================
CREATE TABLE IF NOT EXISTS external_links (
  key TEXT PRIMARY KEY,
  url TEXT NOT NULL DEFAULT '',
  label TEXT NOT NULL DEFAULT ''
);

ALTER TABLE external_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "external_links_read_all" ON external_links FOR SELECT USING (true);
CREATE POLICY "external_links_manage" ON external_links FOR ALL USING (true);
