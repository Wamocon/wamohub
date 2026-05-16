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
  ('a0000000-0000-0000-0000-000000000008', 'Jonathan Boschin', 'jonathan.boschin@wamocon.de', 'JUNIOR_CONSULTANT', '{Mentee}',          ''),
  ('a0000000-0000-0000-0000-000000000009', 'Yash Bhesaniya',   'yash.bhesaniya@wamocon.de',   'CONSULTANT',        '{Mentee}',          ''),
  ('a0000000-0000-0000-0000-000000000010', 'Maanik Garg',      'maanik.garg@wamocon.de',      'CONSULTANT',        '{Mentee}',          ''),
  ('a0000000-0000-0000-0000-000000000011', 'Elias Felsing',    'elias.felsing@wamocon.de',    'JUNIOR_CONSULTANT', '{Mentee}',          '')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- MENTOR RELATIONS — Trainers (Daniel, Nikolaj, Waleri) coach the Mentees
-- ============================================================================
INSERT INTO mentor_relations (mentor_user_id, mentee_user_id, since, active) VALUES
  ('a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', now() - interval '120 days', true),  -- Daniel  -> Nurzhan
  ('a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004', now() - interval '60 days',  true),  -- Waleri  -> Leon
  ('a0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000007', now() - interval '45 days',  true),  -- Nikolaj -> Erwin
  ('a0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000008', now() - interval '30 days',  true),  -- Nikolaj -> Jonathan
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
-- WAMOCON WAVES — 10 Wellen (KW11–KW20)
-- ============================================================================
INSERT INTO wamocon_waves (id, name, description, sort_order) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'Welle 1 (KW11)',  'Erste Welle: Kick-off-Apps zum Projektstart',                             1),
  ('f0000000-0000-0000-0000-000000000002', 'Welle 2 (KW12)',  'Zweite Welle: Team-Tools',                                                2),
  ('f0000000-0000-0000-0000-000000000003', 'Welle 3 (KW13)',  'Dritte Welle: Skill-Building und Alltagshelfer',                           3),
  ('f0000000-0000-0000-0000-000000000004', 'Welle 4 (KW14)',  'Vierte Welle: Event- und Lifestyle-Apps',                                  4),
  ('f0000000-0000-0000-0000-000000000005', 'Welle 5 (KW15)',  'Fünfte Welle: Fahrzeug- und Mobilität',                                    5),
  ('f0000000-0000-0000-0000-000000000006', 'Welle 6 (KW16)',  'Sechste Welle: Verträge, Laden, Backoffice',                               6),
  ('f0000000-0000-0000-0000-000000000007', 'Welle 7 (KW17)',  'Siebte Welle: Bedarf, KI-Prüfung, lokale Dienste',                         7),
  ('f0000000-0000-0000-0000-000000000008', 'Welle 8 (KW18)',  'Achte Welle: Wartezeit und Wohnen',                                        8),
  ('f0000000-0000-0000-0000-000000000009', 'Welle 9 (KW19)',  'Neunte Welle: Vereine, Finanzen, Ziel-Apps',                               9),
  ('f0000000-0000-0000-0000-000000000010', 'Welle 10 (KW20)', 'Zehnte Welle: Aktuelle Entwicklungsrunde mit 12 Apps',                    10)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- WAMOCON APPS — 39 Apps aus dem WAMOCON 50 Programm
-- ============================================================================
-- Verantwortliche (project_owner_id):
--   Daniel  = a0..002, Waleri = a0..003, Leon = a0..004, Niko = a0..006,
--   Erwin   = a0..007, Yash   = a0..009, Maanik = a0..010, Elias = a0..011
-- app_url       = GitHub-Repository
-- landing_page_url = Landingpage
-- onedrive_url  = OneDrive-Ablage-Bezeichnung
INSERT INTO wamocon_apps (id, name, project_owner_id, category, industry, status, app_url, landing_page_url, onedrive_url, description) VALUES
  -- ── Welle 1 (KW11) ────────────────────────────────────────────────────────
  ('fa000000-0000-0000-0000-000000000001', 'Marketing Planer',
   'a0000000-0000-0000-0000-000000000002', 'Marketing', 'Digital Marketing', 'LIVE',
   'https://github.com/wamocon/marketing_power',
   'https://wamocon.github.io/momentum_marketing_landingpage/',
   '', 'Planungstool für Marketing-Kampagnen und Content-Strategien.'),

  ('fa000000-0000-0000-0000-000000000002', 'Architekten Planer',
   'a0000000-0000-0000-0000-000000000006', 'Planung', 'Architektur', 'LIVE',
   'https://github.com/wamocon/plan-it',
   'https://wamocon.github.io/plan-it_landing_',
   'plan-IT', 'Projektplanungs-App für Architektur- und Bauprojekte.'),

  ('fa000000-0000-0000-0000-000000000003', 'Backup Planer',
   'a0000000-0000-0000-0000-000000000007', 'IT', 'Datensicherung', 'LIVE',
   'https://github.com/wamocon/urbackup',
   'http://info.backuppilot.app/',
   'BackupPilot', 'Backup-Strategie-Planer für kleine und mittelständische Unternehmen.'),

  ('fa000000-0000-0000-0000-000000000004', 'Ustafix',
   'a0000000-0000-0000-0000-000000000010', 'Handwerk', 'Dienstleistung', 'LIVE',
   'https://github.com/wamocon/ustafix.app',
   'https://ustafix-landing-page.vercel.app',
   '', 'Vermittlungsplattform für Handwerker-Dienstleistungen. Co-Verantwortlich: Waleri Moretz.'),

  -- ── Welle 2 (KW12) ────────────────────────────────────────────────────────
  ('fa000000-0000-0000-0000-000000000005', 'Team Radar',
   'a0000000-0000-0000-0000-000000000006', 'HR', 'Teammanagement', 'LIVE',
   'https://github.com/wamocon/TeamRadar',
   'https://curly-couscous-zg4j298.pages.github.io/',
   'TeamRadar', 'Team-Stimmungsbarometer und Collaboration-Insights.'),

  -- ── Welle 3 (KW13) ────────────────────────────────────────────────────────
  ('fa000000-0000-0000-0000-000000000006', 'Skillmapper',
   'a0000000-0000-0000-0000-000000000002', 'HR', 'Kompetenzmanagement', 'LIVE',
   'https://github.com/wamocon/skillmapper',
   'https://wamocon.github.io/kompetenzkompass_lp/',
   'Kompetenzkompass', 'Kompetenz-Mapping und Skill-Gap-Analyse für Teams.'),

  ('fa000000-0000-0000-0000-000000000007', 'Daily Echo',
   'a0000000-0000-0000-0000-000000000007', 'Produktivität', 'Journaling', 'LIVE',
   'https://github.com/wamocon/daily_echo',
   'https://wamocon.github.io/dailyecho_lp/',
   '', 'Tägliches Journaling- und Reflexions-Tool.'),

  ('fa000000-0000-0000-0000-000000000008', 'AWAY',
   'a0000000-0000-0000-0000-000000000006', 'Reisen', 'Planung', 'LIVE',
   'https://github.com/wamocon/away',
   'https://fantastic-adventure-g4qyq8k.pages.github.io/',
   'AWAY_v1', 'Reise- und Abwesenheitsplanungs-App.'),

  ('fa000000-0000-0000-0000-000000000009', 'Trace',
   'a0000000-0000-0000-0000-000000000006', 'Logistik', 'Tracking', 'LIVE',
   'https://github.com/wamocon/trace',
   'https://redesigned-guide-v3ypon5.pages.github.io/',
   'TRACE_v1', 'Tracking- und Nachverfolgungstool für Lieferungen und Aufgaben.'),

  ('fa000000-0000-0000-0000-000000000010', 'Meine Wohnung App',
   'a0000000-0000-0000-0000-000000000009', 'Immobilien', 'Wohnungsmanagement', 'LIVE',
   'https://github.com/wamocon/meine_wohnung',
   'https://wamocon.github.io/meine_wohnung',
   'meine_wohnung', 'Wohnungsverwaltungs-App für Mieter und Eigentümer.'),

  ('fa000000-0000-0000-0000-000000000011', 'Anforderungsmanager',
   'a0000000-0000-0000-0000-000000000010', 'Projektmanagement', 'Requirements', 'IN_DEVELOPMENT',
   'https://github.com/wamocon/WMC-Anforderungsmanager',
   '',
   '', 'Requirements-Management-Tool. Hinweis: Landingpage und OneDrive-Ablage noch ausstehend.'),

  -- ── Welle 4 (KW14) ────────────────────────────────────────────────────────
  ('fa000000-0000-0000-0000-000000000012', 'WedBudget',
   'a0000000-0000-0000-0000-000000000002', 'Finanzen', 'Hochzeitsplanung', 'LIVE',
   'https://github.com/wamocon/wedbudget',
   'https://wamocon.github.io/hochzeitsrechner_lp/',
   'Hochzeitsrechner(ARBEITSTITEL)', 'Budgetplanung und Kostenübersicht für Hochzeiten.'),

  -- ── Welle 5 (KW15) ────────────────────────────────────────────────────────
  ('fa000000-0000-0000-0000-000000000013', 'CarMan',
   'a0000000-0000-0000-0000-000000000002', 'Automotive', 'Fahrzeugverwaltung', 'LIVE',
   'https://github.com/wamocon/carman',
   'https://wamocon.github.io/carman_lp/',
   '01_Freigabe erteilt_CarMan', 'Fahrzeugverwaltungs- und Wartungsplanungs-App.'),

  -- ── Welle 6 (KW16) ────────────────────────────────────────────────────────
  ('fa000000-0000-0000-0000-000000000014', 'Vertragsmanager',
   'a0000000-0000-0000-0000-000000000002', 'Recht', 'Vertragsverwaltung', 'LIVE',
   'https://github.com/wamocon/vertragsmanager',
   'https://wamocon.github.io/vertragsmanager_lp/',
   '02_Freigabe erteilt_02_Vertragsmanager', 'Digitale Vertragsverwaltung mit Fristen-Tracking.'),

  ('fa000000-0000-0000-0000-000000000015', 'ladeKompass',
   'a0000000-0000-0000-0000-000000000006', 'E-Mobilität', 'Infrastruktur', 'LIVE',
   'https://github.com/wamocon/ladeKompass',
   'https://wamocon.github.io/ladeKompass_lp/',
   '01_Freigabe erteilt_LadesäulenChaos', 'Ladesäulen-Finder und Routenplaner für E-Mobilität.'),

  ('fa000000-0000-0000-0000-000000000016', 'Backoffice-Assistent',
   'a0000000-0000-0000-0000-000000000009', 'Verwaltung', 'Büromanagement', 'LIVE',
   'https://github.com/wamocon/backofficeassistent',
   'https://wamocon.github.io/backofficeassistent_lp/',
   '03_Freigabe erteilt_Bürokratie-Copilot', 'KI-gestützter Backoffice-Assistent für Verwaltungsaufgaben.'),

  -- ── Welle 7 (KW17) ────────────────────────────────────────────────────────
  ('fa000000-0000-0000-0000-000000000017', 'Bedarfspilot',
   'a0000000-0000-0000-0000-000000000002', 'Beschaffung', 'Bedarfsplanung', 'LIVE',
   'https://github.com/wamocon/bedarfspilot',
   'https://wamocon.github.io/bedarfspilot_lp/',
   '01_Freigabe erteilt_BedarfsPilot', 'Bedarfsplanung und Beschaffungsoptimierung.'),

  ('fa000000-0000-0000-0000-000000000018', 'KI-Prüfungstrainer',
   'a0000000-0000-0000-0000-000000000009', 'Bildung', 'KI', 'LIVE',
   'https://github.com/wamocon/ki-prufungstrainer',
   'https://wamocon.github.io/KI-Prufungstrainer_lp/',
   '05_Freigabe erteilt_KI-Prüfungstrainer', 'KI-basierter Prüfungstrainer für Zertifizierungen.'),

  ('fa000000-0000-0000-0000-000000000019', 'LocalForge',
   'a0000000-0000-0000-0000-000000000004', 'Handwerk', 'Lokale Dienste', 'LIVE',
   'https://github.com/wamocon/localforge',
   'https://wamocon.github.io/LocalForge_lp/',
   '06_Freigabe erteilt_LocalForge', 'Plattform zur Vernetzung lokaler Handwerker und Dienstleister.'),

  -- ── Welle 8 (KW18) ────────────────────────────────────────────────────────
  ('fa000000-0000-0000-0000-000000000020', 'Wartezeit-Wächter',
   'a0000000-0000-0000-0000-000000000011', 'Gesundheit', 'Wartezeitmanagement', 'LIVE',
   'https://github.com/wamocon/wartezeit-waechter',
   'https://wamocon.github.io/wartezeit-waechter_lp/',
   '07_Freigabe erteilt_Wartezeit-Wächter', 'Echtzeit-Wartezeiten-Tracker für Arztpraxen und Behörden.'),

  ('fa000000-0000-0000-0000-000000000021', 'WG-Planer',
   'a0000000-0000-0000-0000-000000000009', 'Wohnen', 'WG-Verwaltung', 'LIVE',
   'https://github.com/wamocon/wg-planer',
   'https://wamocon.github.io/wg-planer_lp/',
   '04_Freigabe erteilt_WG-Planer', 'Organisationstool für Wohngemeinschaften (Putzplan, Kosten, Einkauf).'),

  -- ── Welle 9 (KW19) ────────────────────────────────────────────────────────
  ('fa000000-0000-0000-0000-000000000022', 'Vereinsping',
   'a0000000-0000-0000-0000-000000000004', 'Vereine', 'Kommunikation', 'LIVE',
   'https://github.com/wamocon/vereinsping',
   'https://wamocon.github.io/vereinsping_lp/',
   'freigegeben_02_VereinsPing', 'Kommunikations- und Mitglieder-App für Vereine.'),

  ('fa000000-0000-0000-0000-000000000023', 'GhostAccounts',
   'a0000000-0000-0000-0000-000000000011', 'Sicherheit', 'Accountmanagement', 'LIVE',
   'https://github.com/wamocon/ghostaccounts',
   'https://wamocon.github.io/ghostaccounts_lp/',
   'freigegeben_03_GhostAccounts', 'Tool zum Aufspüren und Bereinigen ungenutzter Online-Accounts.'),

  ('fa000000-0000-0000-0000-000000000024', 'KitaRadar',
   'a0000000-0000-0000-0000-000000000006', 'Kinderbetreuung', 'Suche', 'LIVE',
   'https://github.com/wamocon/kitaradar',
   'https://wamocon.github.io/kitaradar_lp/',
   'freigegeben_KitaRadar', 'Kita-Suchmaschine mit Filterfunktionen und Wartelisten-Tracking.'),

  ('fa000000-0000-0000-0000-000000000025', 'SchufaCleaner',
   'a0000000-0000-0000-0000-000000000006', 'Finanzen', 'Bonitätsmanagement', 'LIVE',
   'https://github.com/wamocon/schufacleaner',
   'https://wamocon.github.io/schufacleaner_lp/',
   'freigegeben_SchufaCleaner', 'Schufa-Eintrags-Analyse und Optimierungs-Ratgeber.'),

  ('fa000000-0000-0000-0000-000000000026', 'MeineZielcollage',
   'a0000000-0000-0000-0000-000000000002', 'Persönliche Entwicklung', 'Zielsetzung', 'LIVE',
   'https://github.com/wamocon/meinezielcollage',
   'https://wamocon.github.io/meinezielcollage_lp/',
   'freigegeben_09_MeineZielcollage', 'Vision-Board und Zielcollage-App für persönliche Entwicklung.'),

  ('fa000000-0000-0000-0000-000000000027', 'Sirin',
   'a0000000-0000-0000-0000-000000000002', 'KI', 'Assistent', 'LIVE',
   'https://github.com/wamocon/Sirin',
   'https://wamocon.github.io/Sirin_lp/',
   '01_Freigegeben_Sirin', 'KI-basierter persönlicher Assistent.'),

  -- ── Welle 10 (KW20) ───────────────────────────────────────────────────────
  ('fa000000-0000-0000-0000-000000000028', 'Stammfeuer',
   'a0000000-0000-0000-0000-000000000007', 'Gastronomie', 'Kundenbindung', 'IN_DEVELOPMENT',
   'https://github.com/wamocon/stammfeuer',
   '',
   '01_Stammfeuer', 'Stammkunden-Bindungs-App für Gastronomie. Hinweis: Landingpage noch ausstehend.'),

  ('fa000000-0000-0000-0000-000000000029', 'GrundsteuerPrüfer',
   'a0000000-0000-0000-0000-000000000007', 'Finanzen', 'Steuern', 'IN_DEVELOPMENT',
   'https://github.com/wamocon/grundsteuerPruefer',
   '',
   '02_Grundsteuerprüfer', 'Grundsteuer-Prüfungs- und Berechnungstool. Hinweis: Landingpage noch ausstehend.'),

  ('fa000000-0000-0000-0000-000000000030', 'Rideproof',
   'a0000000-0000-0000-0000-000000000004', 'Mobilität', 'Fahrtennachweis', 'IN_DEVELOPMENT',
   'https://github.com/wamocon/rideproof',
   '',
   '07_RideProof', 'Fahrtennachweis-App für Pendler und Dienstfahrten. Hinweis: Landingpage noch ausstehend.'),

  ('fa000000-0000-0000-0000-000000000031', 'Make Art Alanya',
   'a0000000-0000-0000-0000-000000000003', 'Kunst', 'Kreativwerkstatt', 'IN_DEVELOPMENT',
   'https://github.com/wamocon/makeartalanya-app',
   '',
   '04_Make Art Studio', 'Kreativ-Plattform und Kunst-Studio-App. Hinweis: Landingpage noch ausstehend.'),

  ('fa000000-0000-0000-0000-000000000032', 'Parzella',
   'a0000000-0000-0000-0000-000000000006', 'Immobilien', 'Schrebergarten', 'IN_DEVELOPMENT',
   'https://github.com/wamocon/parzella',
   'https://wamocon.github.io/parzella_lp/',
   '10_SchreberKlar', 'Schrebergarten-Verwaltungs- und Community-App.'),

  ('fa000000-0000-0000-0000-000000000033', 'BelegBox',
   'a0000000-0000-0000-0000-000000000002', 'Finanzen', 'Belegverwaltung', 'IN_DEVELOPMENT',
   'https://github.com/wamocon/belegbox',
   '',
   'freigegeben_07_BelegBox', 'Digitale Belegerfassung und -verwaltung. Hinweis: Landingpage noch ausstehend.'),

  ('fa000000-0000-0000-0000-000000000034', 'BuyRight AI',
   'a0000000-0000-0000-0000-000000000011', 'E-Commerce', 'Kaufberatung', 'IN_DEVELOPMENT',
   'https://github.com/wamocon/BuyRight-AI',
   '',
   '08_BuyRight AI', 'KI-gestützte Kaufberatungs-App. Hinweis: Landingpage noch ausstehend.'),

  ('fa000000-0000-0000-0000-000000000035', 'Auktivo',
   'a0000000-0000-0000-0000-000000000006', 'Auktionen', 'Versteigerungen', 'LIVE',
   'https://github.com/wamocon/auktivo',
   'https://wamocon.github.io/auktivo_lp/',
   '09_ZwangsVersteigerungsKlar', 'Auktions- und Versteigerungsplattform.'),

  ('fa000000-0000-0000-0000-000000000036', 'CardScan',
   'a0000000-0000-0000-0000-000000000009', 'Visitenkarten', 'Digitalisierung', 'LIVE',
   'https://github.com/wamocon/cardscan',
   'https://wamocon.github.io/cardscan_lp/',
   '06_CardScan', 'Visitenkarten-Scanner mit KI-Texterkennung und Kontaktverwaltung.'),

  ('fa000000-0000-0000-0000-000000000037', 'UAIT',
   'a0000000-0000-0000-0000-000000000010', 'Testing', 'KI', 'PLANNED',
   'https://github.com/wamocon/Universal-AI-Test',
   '',
   '', 'Universal AI Testing Framework. Hinweis: Landingpage und OneDrive-Ablage noch ausstehend.'),

  ('fa000000-0000-0000-0000-000000000038', 'Treffpunkt',
   'a0000000-0000-0000-0000-000000000002', 'Soziales', 'Veranstaltungsplanung', 'LIVE',
   'https://github.com/wamocon/treffpunkt',
   'https://wamocon.github.io/treffpunkt_lp/',
   'freigegeben_06_TreffPunkt', 'Veranstaltungs- und Treffpunkt-Finder für lokale Events.'),

  ('fa000000-0000-0000-0000-000000000039', 'KinderPartyPlaner',
   'a0000000-0000-0000-0000-000000000002', 'Events', 'Kinderpartys', 'IN_DEVELOPMENT',
   'https://github.com/wamocon/kinderpartyplaner',
   '',
   'freigegeben_08_KinderPartyPlaner', 'Planungs-App für Kindergeburtstage und Kinderevents. Hinweis: Landingpage noch ausstehend.');

-- ============================================================================
-- WAMOCON APP-WAVE ASSIGNMENTS
-- ============================================================================
INSERT INTO wamocon_app_waves (app_id, wave_id) VALUES
  -- Welle 1 (KW11): Marketing Planer, Architekten Planer, Backup Planer, Ustafix
  ('fa000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001'),
  ('fa000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001'),
  ('fa000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001'),
  ('fa000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000001'),
  -- Welle 2 (KW12): Team Radar
  ('fa000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000002'),
  -- Welle 3 (KW13): Skillmapper, Daily Echo, AWAY, Trace, Meine Wohnung App, Anforderungsmanager
  ('fa000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000003'),
  ('fa000000-0000-0000-0000-000000000007', 'f0000000-0000-0000-0000-000000000003'),
  ('fa000000-0000-0000-0000-000000000008', 'f0000000-0000-0000-0000-000000000003'),
  ('fa000000-0000-0000-0000-000000000009', 'f0000000-0000-0000-0000-000000000003'),
  ('fa000000-0000-0000-0000-000000000010', 'f0000000-0000-0000-0000-000000000003'),
  ('fa000000-0000-0000-0000-000000000011', 'f0000000-0000-0000-0000-000000000003'),
  -- Welle 4 (KW14): WedBudget
  ('fa000000-0000-0000-0000-000000000012', 'f0000000-0000-0000-0000-000000000004'),
  -- Welle 5 (KW15): CarMan
  ('fa000000-0000-0000-0000-000000000013', 'f0000000-0000-0000-0000-000000000005'),
  -- Welle 6 (KW16): Vertragsmanager, ladeKompass, Backoffice-Assistent
  ('fa000000-0000-0000-0000-000000000014', 'f0000000-0000-0000-0000-000000000006'),
  ('fa000000-0000-0000-0000-000000000015', 'f0000000-0000-0000-0000-000000000006'),
  ('fa000000-0000-0000-0000-000000000016', 'f0000000-0000-0000-0000-000000000006'),
  -- Welle 7 (KW17): Bedarfspilot, KI-Prüfungstrainer, LocalForge
  ('fa000000-0000-0000-0000-000000000017', 'f0000000-0000-0000-0000-000000000007'),
  ('fa000000-0000-0000-0000-000000000018', 'f0000000-0000-0000-0000-000000000007'),
  ('fa000000-0000-0000-0000-000000000019', 'f0000000-0000-0000-0000-000000000007'),
  -- Welle 8 (KW18): Wartezeit-Wächter, WG-Planer
  ('fa000000-0000-0000-0000-000000000020', 'f0000000-0000-0000-0000-000000000008'),
  ('fa000000-0000-0000-0000-000000000021', 'f0000000-0000-0000-0000-000000000008'),
  -- Welle 9 (KW19): Vereinsping, GhostAccounts, KitaRadar, SchufaCleaner, MeineZielcollage, Sirin
  ('fa000000-0000-0000-0000-000000000022', 'f0000000-0000-0000-0000-000000000009'),
  ('fa000000-0000-0000-0000-000000000023', 'f0000000-0000-0000-0000-000000000009'),
  ('fa000000-0000-0000-0000-000000000024', 'f0000000-0000-0000-0000-000000000009'),
  ('fa000000-0000-0000-0000-000000000025', 'f0000000-0000-0000-0000-000000000009'),
  ('fa000000-0000-0000-0000-000000000026', 'f0000000-0000-0000-0000-000000000009'),
  ('fa000000-0000-0000-0000-000000000027', 'f0000000-0000-0000-0000-000000000009'),
  -- Welle 10 (KW20): Stammfeuer, GrundsteuerPrüfer, Rideproof, Make Art Alanya, Parzella, BelegBox,
  --                   BuyRight AI, Auktivo, CardScan, UAIT, Treffpunkt, KinderPartyPlaner
  ('fa000000-0000-0000-0000-000000000028', 'f0000000-0000-0000-0000-000000000010'),
  ('fa000000-0000-0000-0000-000000000029', 'f0000000-0000-0000-0000-000000000010'),
  ('fa000000-0000-0000-0000-000000000030', 'f0000000-0000-0000-0000-000000000010'),
  ('fa000000-0000-0000-0000-000000000031', 'f0000000-0000-0000-0000-000000000010'),
  ('fa000000-0000-0000-0000-000000000032', 'f0000000-0000-0000-0000-000000000010'),
  ('fa000000-0000-0000-0000-000000000033', 'f0000000-0000-0000-0000-000000000010'),
  ('fa000000-0000-0000-0000-000000000034', 'f0000000-0000-0000-0000-000000000010'),
  ('fa000000-0000-0000-0000-000000000035', 'f0000000-0000-0000-0000-000000000010'),
  ('fa000000-0000-0000-0000-000000000036', 'f0000000-0000-0000-0000-000000000010'),
  ('fa000000-0000-0000-0000-000000000037', 'f0000000-0000-0000-0000-000000000010'),
  ('fa000000-0000-0000-0000-000000000038', 'f0000000-0000-0000-0000-000000000010'),
  ('fa000000-0000-0000-0000-000000000039', 'f0000000-0000-0000-0000-000000000010');
