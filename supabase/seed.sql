-- RELDA Seed Data — Automated test data for local development
-- Run via: npx supabase db reset (applies migrations + seed)

-- ============================================================================
-- USERS — 10 WAMOCON team members (https://wamocon.com/uber-wamocon)
-- ============================================================================
-- The first 5 UUIDs (a0000000-...001..005) are reused so existing FKs in the
-- rest of this seed file remain valid. Roles are derived from each person's
-- public role on the WAMOCON website.
INSERT INTO users (id, name, email, level, roles, cv_file_url) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Nurzhan Kukeyev',  'nurzhan.kukeyev@wamocon.de',  'CONSULTANT',        '{Mentee}',          ''),
  ('a0000000-0000-0000-0000-000000000002', 'Daniel Moretz',    'daniel.moretz@wamocon.de',    'MANAGER',           '{Mentor}',          ''),
  ('a0000000-0000-0000-0000-000000000003', 'Waleri Moretz',    'waleri.moretz@wamocon.de',    'ADMIN',             '{Admin,Mentor}',    ''),
  ('a0000000-0000-0000-0000-000000000004', 'Leon Moretz',      'leon.moretz@wamocon.de',      'JUNIOR_CONSULTANT', '{Mentee}',          ''),
  ('a0000000-0000-0000-0000-000000000005', 'Olga Moretz',      'olga.moretz@wamocon.de',      'SENIOR_MANAGER',    '{Admin}',           ''),
  ('a0000000-0000-0000-0000-000000000006', 'Nikolaj Schefner', 'nikolaj.schefner@wamocon.de', 'MANAGER',           '{Mentor}',          ''),
  ('a0000000-0000-0000-0000-000000000007', 'Erwin Moretz',     'erwin.moretz@wamocon.de',     'CONSULTANT',        '{Mentee}',          ''),
  ('a0000000-0000-0000-0000-000000000008', 'Elias Felsing', 'elias.felsing@wamocon.de', 'JUNIOR_CONSULTANT', '{Mentee}',          ''),
  ('a0000000-0000-0000-0000-000000000009', 'Yash Bhesaniya',   'yash.bhesaniya@wamocon.de',   'CONSULTANT',        '{Mentee}',          ''),
  ('a0000000-0000-0000-0000-000000000010', 'Maanik Garg',      'maanik.garg@wamocon.de',      'CONSULTANT',        '{Mentee}',          '')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- MENTOR RELATIONS — Trainers (Daniel, Nikolaj, Waleri) coach the Mentees
-- ============================================================================
INSERT INTO mentor_relations (mentor_user_id, mentee_user_id, since, active) VALUES
  ('a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', now() - interval '120 days', true),  -- Daniel  -> Nurzhan
  ('a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', now() - interval '60 days',  true),  -- Waleri  -> Leon
  ('a0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000007', now() - interval '45 days',  true),  -- Nikolaj -> Erwin
  ('a0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000008', now() - interval '30 days',  true),  -- Nikolaj -> Elias
  ('a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000009', now() - interval '20 days',  true),  -- Daniel  -> Yash
  ('a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000010', now() - interval '15 days',  true);  -- Waleri  -> Maanik

-- ============================================================================
-- PROJECTS
-- ============================================================================
INSERT INTO projects (id, name, owner_user_id, description, target_date, jira_url, created_by) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Testautomatisierung Verkehr',     'a0000000-0000-0000-0000-000000000002', 'Aufbau einer Selenium-/Playwright-Suite für ein deutsches Verkehrsunternehmen.', '2026-12-31', 'https://wamocon.atlassian.net/browse/VK', 'a0000000-0000-0000-0000-000000000002'),
  ('b0000000-0000-0000-0000-000000000002', 'SAP S/4 HANA Testmanagement',     'a0000000-0000-0000-0000-000000000003', 'Testmanagement und Migrationsabsicherung für ein S/4 HANA Rollout.',           '2026-06-30', '', 'a0000000-0000-0000-0000-000000000003'),
  ('b0000000-0000-0000-0000-000000000003', 'Mobile-Banking QA',               'a0000000-0000-0000-0000-000000000001', 'End-to-End Mobile Testing einer neuen Banking-App.',                            '2026-08-15', 'https://wamocon.atlassian.net/browse/MOB', 'a0000000-0000-0000-0000-000000000001');

-- ============================================================================
-- PROJECT MEMBERS
-- ============================================================================
INSERT INTO project_members (project_id, user_id, role_label) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Projektleiter'),
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Testautomatisierer'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'Sponsor'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Tester'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Lead Tester'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'Test Manager'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', 'Junior Tester');

-- ============================================================================
-- ORGANIZATION PROJECTS
-- ============================================================================
INSERT INTO organization_projects (id, name, description, status, visibility, start_date, end_date) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Company Digital Transformation', 'Organization-wide digital transformation initiative', 'ACTIVE', 'ORGANIZATION', '2026-01-01', '2026-12-31'),
  ('c0000000-0000-0000-0000-000000000002', 'Quality Standards Implementation', 'Implement new quality standards across all projects', 'PLANNING', 'ORGANIZATION', '2026-03-01', '2026-08-31');

-- ============================================================================
-- GOALS
-- ============================================================================
INSERT INTO goals (owner_user_id, created_by, title, description, status) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'SELF',   'CTFL Zertifizierung',          'Prüfung Q4 bestehen',                    'IN_PROGRESS'),
  ('a0000000-0000-0000-0000-000000000001', 'MENTOR', 'Projektleitung übernehmen',     'Teilprojekt im ACME Projekt',            'OPEN'),
  ('a0000000-0000-0000-0000-000000000004', 'SELF',   'Selenium Grundlagen lernen',    'Kurs bis Ende Q2 abschließen',           'OPEN'),
  ('a0000000-0000-0000-0000-000000000004', 'MENTOR', 'Code-Review Praxis',            'Mindestens 5 Code-Reviews durchführen',  'IN_PROGRESS');

-- ============================================================================
-- NOTES
-- ============================================================================
INSERT INTO notes (owner_user_id, scope, ref_id, visibility, body) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'GENERAL', NULL, 'PRIVATE_SELF', 'Ideen für Testdatenstrategie notieren.'),
  ('a0000000-0000-0000-0000-000000000001', 'PROJECT', 'b0000000-0000-0000-0000-000000000001', 'PRIVATE_SELF', 'Smoke-Tests für Checkout priorisieren.'),
  ('a0000000-0000-0000-0000-000000000002', 'MENTEE_PRIVATE', 'a0000000-0000-0000-0000-000000000001', 'PRIVATE_MENTOR', 'Nurzhan: Sehr proaktiv, Fokus auf CTFL unterstützen.'),
  ('a0000000-0000-0000-0000-000000000004', 'GENERAL', NULL, 'PRIVATE_SELF', 'Notiz: nächste Woche Selenium Workshop besuchen.');

-- ============================================================================
-- CHECKLIST TEMPLATES & ITEMS
-- ============================================================================
INSERT INTO checklist_templates (id, from_level, to_level) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'CONSULTANT', 'JUNIOR_MANAGER');

INSERT INTO checklist_items (id, template_id, label, description, sort_order) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'CTFL bestanden', 'Zertifikat nachweisen', 1),
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'Projektleitungserfahrung (3 Monate)', 'Rolle und Ergebnis dokumentiert', 2),
  ('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 'Community-Beitrag', 'Mind. 1 interner Talk/Artikel', 3);

-- ============================================================================
-- CHECKLIST PROGRESS
-- ============================================================================
INSERT INTO checklist_progress (user_id, template_id, item_id, status, notes) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'PROVEN', '{Anmeldung 15.10}'),
  ('a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002', 'OPEN', '{}'),
  ('a0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000003', 'OPEN', '{}');

-- ============================================================================
-- ASSESSMENTS
-- ============================================================================
INSERT INTO assessments (mentee_user_id, target_level, status) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'JUNIOR_MANAGER', 'DRAFT');

-- ============================================================================
-- MENTOR TASKS
-- ============================================================================
INSERT INTO mentor_tasks (mentee_user_id, mentor_user_id, title, description, due_date, status, priority) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Complete CTFL certification', 'Study and pass the CTFL exam by end of Q2', '2026-06-30', 'PENDING', 'HIGH'),
  ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Lead a project retrospective', 'Facilitate a retrospective meeting for the ACME project', '2026-02-15', 'IN_PROGRESS', 'MEDIUM'),
  ('a0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000005', 'Setup Selenium environment', 'Install and configure Selenium WebDriver locally', '2026-05-01', 'PENDING', 'HIGH');

-- ============================================================================
-- REFLECTIONS
-- ============================================================================
INSERT INTO reflections (mentee_user_id, mentor_user_id, title, description, status, due_date) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Q1 Performance Review', 'Reflect on your performance and growth in Q1', 'PENDING', '2026-03-31'),
  ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'CTFL Certification Progress', 'Review progress on CTFL certification preparation', 'IN_PROGRESS', '2026-04-15');

-- ============================================================================
-- TIMESHEETS
-- ============================================================================
INSERT INTO timesheets (user_id, project_id, date, hours, description, task_type, status, submitted_at) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '2026-01-15', 8, 'QA Testing for ACME project', 'Testing', 'SUBMITTED', now() - interval '3 days'),
  ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', '2026-01-14', 6, 'SAP Test case development', 'Development', 'DRAFT', NULL),
  ('a0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003', '2026-01-16', 4, 'Mobile app manual testing', 'Testing', 'DRAFT', NULL);

-- ============================================================================
-- VACATION REQUESTS
-- ============================================================================
INSERT INTO vacation_requests (user_id, start_date, end_date, days, reason, status, reviewed_by, reviewed_at, comments) VALUES
  ('a0000000-0000-0000-0000-000000000001', '2026-03-15', '2026-03-22', 6, 'Family vacation', 'PENDING', NULL, NULL, ''),
  ('a0000000-0000-0000-0000-000000000002', '2026-04-01', '2026-04-03', 3, 'Medical appointment', 'APPROVED', 'a0000000-0000-0000-0000-000000000003', now() - interval '1 day', 'Approved for medical reasons');

-- ============================================================================
-- TRAVEL COSTS
-- ============================================================================
INSERT INTO travel_costs (user_id, date, amount, description, category, status, reviewed_by, reviewed_at, comments) VALUES
  ('a0000000-0000-0000-0000-000000000001', '2026-01-15', 45.50, 'Train ticket to client meeting', 'Transportation', 'PENDING', NULL, NULL, ''),
  ('a0000000-0000-0000-0000-000000000002', '2026-01-14', 89.00, 'Hotel accommodation for training', 'Accommodation', 'APPROVED', 'a0000000-0000-0000-0000-000000000003', now() - interval '1 day', 'Approved for training purposes');

-- ============================================================================
-- EXTERNAL LINKS
-- ============================================================================
INSERT INTO external_links (key, url, label) VALUES
  ('STARTSMART',   'https://example.com/startsmart',    'StartSmart'),
  ('DITELE',       'https://ditele.example.com',        'DiTele Platform'),
  ('FIAE',         'https://fiae.example.com',          'FIAE Platform'),
  ('TISCHKICKER',  'https://example.com/tischkicker',   'Tischkicker-App'),
  ('QUICKWIN',     'https://example.com/quickwin',      'QuickWin Buch App')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- WAMOCON WAVES
-- ============================================================================
INSERT INTO wamocon_waves (id, name, description, sort_order) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'Welle 1 — Kick-off',       'Erste Welle: MVP-Apps zum Projektstart',           1),
  ('f0000000-0000-0000-0000-000000000002', 'Welle 2 — Expansion',      'Zweite Welle: Erweiterung des App-Portfolios',     2),
  ('f0000000-0000-0000-0000-000000000003', 'Welle 3 — Optimierung',    'Dritte Welle: Performance- und UX-Verbesserungen', 3)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- WAMOCON APPS
-- ============================================================================
INSERT INTO wamocon_apps (id, name, project_owner_id, category, industry, status, app_url, landing_page_url, onedrive_url, description) VALUES
  ('fa000000-0000-0000-0000-000000000001', 'TestSuite Hub',     'a0000000-0000-0000-0000-000000000002', 'Test Tooling',   'IT / Software',     'LIVE',            '',  '',  '',  'Zentrale WAMOCON-Plattform zum Erfassen, Steuern und Auswerten von Testfällen über Projekte hinweg.'),
  ('fa000000-0000-0000-0000-000000000002', 'ISTQB Academy',     'a0000000-0000-0000-0000-000000000003', 'E-Learning',     'Aus- und Weiterbildung', 'IN_DEVELOPMENT', '', '', '', 'Lern- und Prüfungsplattform für ISTQB® Foundation Level Schulungen der WAMOCON Academy.'),
  ('fa000000-0000-0000-0000-000000000003', 'AuditFlow',         'a0000000-0000-0000-0000-000000000001', 'Compliance',     'Banken / Finanzen', 'PLANNED',         '',  '',  '',  'Automatisierte Audit-Trail-Erfassung für regulierte Branchen.'),
  ('fa000000-0000-0000-0000-000000000004', 'TalentPulse',       'a0000000-0000-0000-0000-000000000005', 'HR',             'Consulting',        'LIVE',            '',  '',  '',  'HR-Talent-Management-Plattform für die interne Mentor-/Mentee-Steuerung.'),
  ('fa000000-0000-0000-0000-000000000005', 'GreenMetrics',      'a0000000-0000-0000-0000-000000000002', 'Reporting',      'Energie',           'IN_DEVELOPMENT',  '',  '',  '',  'Nachhaltigkeits-Reporting-Tool für Energieunternehmen.'),
  ('fa000000-0000-0000-0000-000000000006', 'Mobility Insights', 'a0000000-0000-0000-0000-000000000004', 'Analytics',      'Verkehr',           'PAUSED',          '',  '',  '',  'Auswertungstool für Fahrplandaten und Verspätungsanalysen im ÖPNV.');

-- ============================================================================
-- WAMOCON APP-WAVE ASSIGNMENTS
-- ============================================================================
INSERT INTO wamocon_app_waves (app_id, wave_id) VALUES
  -- Welle 1
  ('fa000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001'),
  ('fa000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001'),
  ('fa000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000001'),
  -- Welle 2
  ('fa000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000002'),
  ('fa000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000002'),
  ('fa000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000002'),  -- QualityTracker auch in Welle 2
  -- Welle 3
  ('fa000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000003'),
  ('fa000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000003'); -- TalentPulse auch in Welle 3
