# Umbauplan L99 Softwarearchitekt

Stand: 2026-04-07

## 1. Ziel und Rahmen

Ziel ist die technische Ueberfuehrung der aktuellen RELDA-SIT-Applikation (React/Vite/JS/In-Memory) in das Ziel-Repository `Wamocon/RELDA` (Next.js 16/TypeScript/Tailwind v4/Supabase/Vercel CI-CD).

Ergebnisziel:
- Fachliche Kernprozesse bleiben erhalten.
- Technische Plattform wird auf den Zielstandard umgemappt.
- Dokumentierte Luecken werden in priorisierten Arbeitspaketen geschlossen.

## 2. Verifizierte Zielanforderungen aus Wamocon/RELDA

1. Next.js 16 mit App Router in `src/app`
2. TypeScript strict
3. Tailwind CSS v4
4. Supabase als DB/Auth/RLS-Basis
5. CI/CD ueber `.github/workflows/pr-pipeline.yml` und `deploy.yml` (Wamocon github_workflow)
6. Vercel als Deploymentziel
7. Pflicht-Checks: `npm run lint`, `npm run typecheck`

## 3. Zielarchitektur fuer den Umbau

## 3.1 Layer-Modell

1. Presentation Layer
- Next.js App Router Pages/Layouts
- Reusable UI Components
- Client Components nur dort, wo Interaktivitaet noetig ist

2. Application Layer
- Use-Case-nahe Services (z. B. TimesheetService, MentorService)
- Validierungslogik
- Mapping Domain <-> DTO

3. Data Layer
- Supabase Client (server/client getrennt)
- Tabellen, Views, Policies
- Migrations in `supabase/migrations/`

4. Security Layer
- Supabase Auth
- Rollenmapping ueber Claims/Profile
- RLS Policies pro Modul

## 3.2 Ziel-Module (fachlich)

1. Identity & Access
- Login, Session, Rollen, Route Protection

2. Consultant Workspace
- Profil, Ziele, Checkliste, Assessment, Mentor-Aufgaben

3. Projects & Notes
- Projekte, Mitglieder, Jira-Links, projektspezifische Notizen

4. Organization
- Timesheets, Urlaub, Reisekosten

5. Mentor Workspace
- Mentee-Uebersicht, Mentorziele, private Mentor-Notizen, Assessment-Bestaetigung

6. Admin & Approvals
- User/Mentor-Zuordnung, Freigaben, Link-Konfiguration, Audit/Statistik

## 4. Ziel-Datenmodell (Migrationskandidaten)

Tabellen (MVP):
1. profiles
2. roles
3. user_roles
4. mentor_relations
5. projects
6. project_members
7. goals
8. notes
9. checklist_templates
10. checklist_items
11. checklist_progress
12. assessments
13. mentor_tasks
14. reflections
15. timesheets
16. vacation_requests
17. travel_cost_requests
18. app_links

Grundsatz:
- Keine lokalen Fixture-Dateien als dauerhafte Datenquelle.
- Testdaten direkt in Supabase verwalten (gem. HOWTO).

## 5. Umbaustrategie (Phasen)

## Phase 0 - Projektvorbereitung

Ziele:
- Arbeitsbranch und Architekturbaseline im Ziel-Repo herstellen.
- CI/CD und Environments fuer Entwicklung vorbereiten.

Arbeitspakete:
1. Ziel-Repo lokal klonen und Branch `feature/RELDA-migration` anlegen.
2. `.env.local` aus `.env.example` erstellen.
3. Supabase Projekt verbinden (URL, ANON, SERVICE_ROLE, optional Schema).
4. Vercel-Umgebung und `VERCEL_PROJECT_ID` Secret abstimmen.
5. PR-Pipeline/Deploy-Workflow-Referenzen auf gueltige Org/Repo verifizieren.

Abnahmekriterien:
- `npm install`, `npm run dev`, `npm run lint`, `npm run typecheck` laufen.

## Phase 1 - Technische Plattformmigration

Ziele:
- Bestehende SIT-UI in Next.js-Struktur ueberfuehren, noch ohne Vollpersistenz.

Arbeitspakete:
1. Komponenten aus SIT in `src/app`-Struktur uebertragen.
2. Dateien auf `.tsx` migrieren, Typen einfuehren.
3. Gemeinsame Domain-Typen (`src/types/domain.ts`) erstellen.
4. Tailwind-v4-kompatible Styles in `src/app/globals.css` konsolidieren.
5. Routing festlegen:
   - `/`
   - `/consultant`
   - `/projects`
   - `/mentor`
   - `/organization`
   - `/admin`

Abnahmekriterien:
- Alle Hauptseiten rendern in Next.js ohne JS-Fehler.
- Keine Verwendung von Vite-Einstiegspunkten mehr.

## Phase 2 - Auth, Rollen, Zugriff

Ziele:
- Simulierten Login durch Supabase Auth ersetzen.

Arbeitspakete:
1. Auth-Flow mit Supabase (Sign-in/Sign-out, Session).
2. Rollenmodell in `profiles/user_roles` persistieren.
3. Middleware/Guards fuer Mentor/Admin-Bereiche.
4. UI-RBAC auf serverseitig abgesicherte Datenzugriffe umstellen.

Abnahmekriterien:
- Ohne gueltige Session kein Zugriff auf geschuetzte Bereiche.
- Mentor/Admin-Features nur fuer berechtigte Nutzer sichtbar und nutzbar.

## Phase 3 - Datenpersistenz und Domain-Migration

Ziele:
- Alle In-Memory-Collections auf Supabase-Tabellen migrieren.

Arbeitspakete:
1. SQL-Migrationen fuer Kernentitaeten schreiben.
2. Seedstrategie fuer minimale Startdaten definieren.
3. CRUD-Endpunkte/Server-Services fuer:
   - Projects + Members
   - Goals + Notes
   - Checklist + Assessment
   - MentorTasks + Reflections
   - Timesheets + Vacation + TravelCosts
4. Statusmodelle harmonisieren (z. B. `DRAFT/SUBMITTED/APPROVED/REJECTED`).

Abnahmekriterien:
- Daten bleiben nach Reload erhalten.
- Konsistente Statusuebergaenge in allen Freigabeprozessen.

## Phase 4 - Qualitaet, Sicherheit, Betriebsfaehigkeit

Ziele:
- Produktionsfaehigkeit und sichere Betriebsbasis.

Arbeitspakete:
1. RLS Policies je Tabelle/Rolle umsetzen.
2. Fehlerbehandlung zentralisieren (UI + Services + Logging).
3. Mindesttests einziehen:
   - Typpruefung
   - Lint
   - Smoke Tests fuer Kernrouten
4. PR-Definition of Done verankern.

Abnahmekriterien:
- PR-Pipeline gruen.
- Keine unautorisierten Datenzugriffe moeglich.

## Phase 5 - Go-Live Vorbereitung

Ziele:
- Stufenweise Umschaltung mit Risikoabsicherung.

Arbeitspakete:
1. Data migration runbook erstellen.
2. Rollout-Checkliste (Preview -> Production).
3. Fallback-Plan auf letzte stabile Version.
4. Betriebsdoku (Secrets, Domains, Monitoring, Support).

Abnahmekriterien:
- Erfolgreiches Preview-Deployment.
- Erfolgreiches Production-Deployment ohne Blocker.

## 6. Priorisierte Lueckenbehebung aus SIT

Prioritaet P0:
1. Mentor-Module Runtime-Fehler (fehlende Scopes/Props)
2. Timesheet-Statusinkonsistenz (`PENDING` vs `DRAFT`-Aktionen)
3. Falsche Datenquelle in Approvals (Timesheet aus `mentorTasks`)
4. Fehlende Lint-Konfiguration im aktuellen SIT-Repo

Prioritaet P1:
1. Konsolidierung mehrfacher, inkonsistenter Domainedaten
2. Echte Validierung statt Alert-basierter Demo-Interaktionen

Prioritaet P2:
1. Asset-/Favicon-Konsistenz
2. UX-/I18n-Haertung

## 7. Einbindungsplan in Ziel-Repository

Empfohlene Branch-/PR-Sequenz:
1. PR-01: `chore/architecture-baseline`
- Routing, TS-Grundstruktur, Lint/Typecheck laufend

2. PR-02: `feat/auth-rbac-supabase`
- Auth + Rollen + Guards + Basis-RLS

3. PR-03: `feat/domain-core-migrations`
- Projekte, Ziele, Notizen, Mentorbeziehungen

4. PR-04: `feat/operations-modules`
- Timesheet, Urlaub, Reisekosten, Approvals

5. PR-05: `hardening/quality-security`
- RLS-Haertung, Fehlerhandling, Tests, Monitoring Hooks

Merge-Kriterien pro PR:
- Build erfolgreich
- `lint` und `typecheck` erfolgreich
- Architekturreview ohne Blocker

## 8. Risikoanalyse und Gegenmassnahmen

1. Risiko: Scope Creep durch zu viele Parallelfeatures
- Massnahme: Strikte Phasen-/PR-Schnitte, MVP-first

2. Risiko: Datenmodell wird mehrfach umgebaut
- Massnahme: Fruehe Domain-Entscheidungen + Migrationskonventionen

3. Risiko: RLS-Fehlkonfiguration blockiert Produktivzugriffe
- Massnahme: Staging-Policies + Testmatrix je Rolle

4. Risiko: CI/CD Secrets unvollstaendig
- Massnahme: Checkliste fuer `VERCEL_PROJECT_ID` und Env-Sync Vercel/GitHub

## 9. Definition of Done (Gesamt)

Der Umbau gilt als abgeschlossen, wenn:
1. Die fachlichen Kernmodule im Next.js-Repo lauffaehig sind.
2. Kein Kernprozess mehr auf In-Memory-Mocks basiert.
3. Auth + Rollen + RLS serverseitig wirksam sind.
4. PR-Pipeline und Deploy-Workflow stabil laufen.
5. Die Dokumentation den Soll/Ist-Abgleich inkl. Restluecken ausweist.

## 10. Konkrete naechste Umsetzungsschritte

1. Ziel-Repo lokal in separatem Arbeitsverzeichnis klonen.
2. Architektur-PR-01 anlegen und SPA-Komponenten in Next App Router ueberfuehren.
3. Parallel SQL-Basisschema in Supabase als Migration vorbereiten.
4. Danach Auth/RBAC als erster funktionaler End-to-End-Vertikal-Slice.
