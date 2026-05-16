-- =============================================================================
-- Migration: 10 Wamocon Waves (KW11–KW20)
-- =============================================================================
-- Creates 10 waves for the WAMOCON 50 Apps program.
-- Actual app data is managed via seed.sql for local development.
-- This migration is IDEMPOTENT: re-running it will not duplicate rows.
-- =============================================================================

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
