-- =============================================================================
-- Migration: 8 Wamocon Waves + Placeholder Apps assigned to Wave 1
-- =============================================================================
-- Adds Waves 4..8 (Waves 1..3 already exist via seed.sql) so the project has
-- 8 waves in total — the long-term target shape for the Wamocon program.
--
-- Adds 12 PLACEHOLDER apps, all assigned to Wave 1 ("Welle 1 — Kick-off"),
-- because the actual Vercel project URLs (https://vercel.com/walerimoretz-langs-projects)
-- could not be fetched programmatically (auth-walled, no Vercel MCP server
-- available in the agent session).
--
-- TO REPLACE PLACEHOLDERS WITH REAL VERCEL PROJECTS:
--   1. Open https://vercel.com/walerimoretz-langs-projects
--   2. For each project, run:
--        UPDATE wamocon_apps
--           SET name = '<project name>',
--               app_url = '<https://<deployment>.vercel.app>',
--               landing_page_url = '<optional>',
--               status = 'LIVE'
--         WHERE id = '<placeholder uuid below>';
--      OR insert as new rows and assign to whichever wave applies.
--   3. Re-assign apps to other waves via wamocon_app_waves as needed.
--
-- This migration is IDEMPOTENT: re-running it will not duplicate rows.
-- =============================================================================

-- --- Waves 1..8 (idempotent — seed.sql may also insert 1..3) -------------
INSERT INTO wamocon_waves (id, name, description, sort_order) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'Welle 1 — Kick-off',       'Erste Welle: MVP-Apps zum Projektstart',                         1),
  ('f0000000-0000-0000-0000-000000000002', 'Welle 2 — Expansion',      'Zweite Welle: Erweiterung des App-Portfolios',                   2),
  ('f0000000-0000-0000-0000-000000000003', 'Welle 3 — Optimierung',    'Dritte Welle: Performance- und UX-Verbesserungen',               3),
  ('f0000000-0000-0000-0000-000000000004', 'Welle 4 — Skalierung',     'Vierte Welle: Skalierung erfolgreicher Apps in weitere Branchen', 4),
  ('f0000000-0000-0000-0000-000000000005', 'Welle 5 — Integration',    'Fünfte Welle: Tieferes Cross-App-Integrationsangebot',           5),
  ('f0000000-0000-0000-0000-000000000006', 'Welle 6 — Mobile',         'Sechste Welle: Native- und PWA-Mobil-Erlebnisse',                6),
  ('f0000000-0000-0000-0000-000000000007', 'Welle 7 — Analytics & AI', 'Siebte Welle: KI- und Analytics-Layer über Bestands-Apps',       7),
  ('f0000000-0000-0000-0000-000000000008', 'Welle 8 — Enterprise',     'Achte Welle: Enterprise-Härtung (SSO, Audit, Multi-Tenant)',     8)
ON CONFLICT (id) DO NOTHING;

-- --- Placeholder Apps for Wave 1 --------------------------------------------
-- 12 PLACEHOLDER apps representing the (currently inaccessible) Vercel
-- portfolio at https://vercel.com/walerimoretz-langs-projects.
--
-- Names are kept WAMOCON-domain themed (testing, training, QA tooling) so the
-- system shows realistic data even before real Vercel project URLs are filled
-- in. `app_url` is intentionally empty — once the Vercel URLs are available,
-- update each row's `app_url` (and optionally `name`) via the Admin UI or via
-- a follow-up migration.
--
-- All status = 'PLANNED' until URLs are filled in.

INSERT INTO wamocon_apps
  (id, name, project_owner_id, category, industry, status, app_url, landing_page_url, onedrive_url, description)
VALUES
  ('fa100000-0000-0000-0000-000000000001', 'TestData Generator',     NULL, 'Test Tooling',  'IT / Software',     'PLANNED', '', '', '', 'Generator für anonymisierte Testdaten mit Fokus auf DSGVO-Konformität.'),
  ('fa100000-0000-0000-0000-000000000002', 'Defect Tracker Plus',    NULL, 'Test Tooling',  'IT / Software',     'PLANNED', '', '', '', 'Erweiterter Defect-Tracker mit Workflow-Templates für ISTQB-konforme Prozesse.'),
  ('fa100000-0000-0000-0000-000000000003', 'Smoke Test Runner',      NULL, 'Test Tooling',  'IT / Software',     'PLANNED', '', '', '', 'CLI-/Web-Tool zur schnellen Smoke-Test-Ausführung in CI/CD-Pipelines.'),
  ('fa100000-0000-0000-0000-000000000004', 'TestCase Library',       NULL, 'Knowledge Base','Aus- und Weiterbildung', 'PLANNED', '', '', '', 'Wiki-artige Bibliothek wiederverwendbarer Testfall-Bausteine.'),
  ('fa100000-0000-0000-0000-000000000005', 'API Mock Studio',        NULL, 'Test Tooling',  'IT / Software',     'PLANNED', '', '', '', 'Mock-Server-UI für REST/GraphQL APIs für Integrationstests.'),
  ('fa100000-0000-0000-0000-000000000006', 'Performance Insights',   NULL, 'Analytics',     'IT / Software',     'PLANNED', '', '', '', 'Dashboard zur Auswertung von Last- und Performance-Tests (k6, JMeter).'),
  ('fa100000-0000-0000-0000-000000000007', 'CertCheck',              NULL, 'E-Learning',    'Aus- und Weiterbildung', 'PLANNED', '', '', '', 'Self-Assessment-App zur Vorbereitung auf ISTQB®-Zertifizierungen.'),
  ('fa100000-0000-0000-0000-000000000008', 'Reporting Hub',          NULL, 'Reporting',     'Beratung',          'PLANNED', '', '', '', 'Zentrale Reporting-Plattform für Test- und Projektkennzahlen über alle Mandate.'),
  ('fa100000-0000-0000-0000-000000000009', 'Onboarding Buddy',       NULL, 'HR',            'Beratung',          'PLANNED', '', '', '', 'Geführter Onboarding-Workflow für neue Berater inkl. Aufgaben & Mentor-Zuweisung.'),
  ('fa100000-0000-0000-0000-000000000010', 'Travel & Expense Lite',  NULL, 'Operations',    'Beratung',          'PLANNED', '', '', '', 'Schlanker Reisekosten-Workflow für Beraterprojekte.'),
  ('fa100000-0000-0000-0000-000000000011', 'Skill Matrix',           NULL, 'HR',            'Beratung',          'PLANNED', '', '', '', 'Visualisierung von Tester-Skills und Karrierepfaden gegen Kompetenzmodell.'),
  ('fa100000-0000-0000-0000-000000000012', 'Customer Voice',         NULL, 'CRM',           'Beratung',          'PLANNED', '', '', '', 'Strukturierte Erfassung von Kunden-Feedback nach Projektabschluss.')
ON CONFLICT (id) DO NOTHING;

-- --- Assign all placeholder apps to Wave 1 ----------------------------------
INSERT INTO wamocon_app_waves (app_id, wave_id) VALUES
  ('fa100000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001'),
  ('fa100000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001'),
  ('fa100000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001'),
  ('fa100000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000001'),
  ('fa100000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000001'),
  ('fa100000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000001'),
  ('fa100000-0000-0000-0000-000000000007', 'f0000000-0000-0000-0000-000000000001'),
  ('fa100000-0000-0000-0000-000000000008', 'f0000000-0000-0000-0000-000000000001'),
  ('fa100000-0000-0000-0000-000000000009', 'f0000000-0000-0000-0000-000000000001'),
  ('fa100000-0000-0000-0000-000000000010', 'f0000000-0000-0000-0000-000000000001'),
  ('fa100000-0000-0000-0000-000000000011', 'f0000000-0000-0000-0000-000000000001'),
  ('fa100000-0000-0000-0000-000000000012', 'f0000000-0000-0000-0000-000000000001')
ON CONFLICT (app_id, wave_id) DO NOTHING;
