-- WAMOCON 50 Apps — Waves, Apps, and wave-app assignments
-- Supports multiple waves per app (many-to-many via wamocon_app_waves)

-- ============================================================================
-- WAMOCON WAVES
-- ============================================================================
CREATE TABLE IF NOT EXISTS wamocon_waves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE wamocon_waves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wamocon_waves_read_all" ON wamocon_waves FOR SELECT USING (true);
CREATE POLICY "wamocon_waves_manage" ON wamocon_waves FOR ALL USING (true);

-- ============================================================================
-- WAMOCON APPS
-- ============================================================================
CREATE TABLE IF NOT EXISTS wamocon_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  project_owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  category TEXT NOT NULL DEFAULT '',
  industry TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'PLANNED'
    CHECK (status IN ('PLANNED','IN_DEVELOPMENT','LIVE','PAUSED','CANCELLED')),
  app_url TEXT NOT NULL DEFAULT '',
  landing_page_url TEXT NOT NULL DEFAULT '',
  onedrive_url TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE wamocon_apps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wamocon_apps_read_all" ON wamocon_apps FOR SELECT USING (true);
CREATE POLICY "wamocon_apps_manage" ON wamocon_apps FOR ALL USING (true);

-- ============================================================================
-- WAMOCON APP-WAVE ASSIGNMENTS (many-to-many)
-- ============================================================================
CREATE TABLE IF NOT EXISTS wamocon_app_waves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id UUID NOT NULL REFERENCES wamocon_apps(id) ON DELETE CASCADE,
  wave_id UUID NOT NULL REFERENCES wamocon_waves(id) ON DELETE CASCADE,
  UNIQUE(app_id, wave_id)
);

ALTER TABLE wamocon_app_waves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wamocon_app_waves_read_all" ON wamocon_app_waves FOR SELECT USING (true);
CREATE POLICY "wamocon_app_waves_manage" ON wamocon_app_waves FOR ALL USING (true);
