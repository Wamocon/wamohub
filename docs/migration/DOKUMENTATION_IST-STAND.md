# WAMOHUB - Vollstaendige Ist-Dokumentation

Stand: 2026-04-07

## 1. Geltungsbereich und Methode

Diese Dokumentation beschreibt den **aktuellen Implementierungsstand** der Anwendung im Repository `D:\Testprojekt\WAMOHUB`.

Ausgewertet wurden alle anwendungsrelevanten Dateien (15 Dateien ohne `node_modules`) sowie der Laufzeit-/Lint-Status.

- Gesamtdateien im Repository (inkl. `node_modules`): 13067
- Anwendungsdateien (ohne `node_modules`): 15
- Anwendungstyp: Frontend-Only Single Page App (React + Vite + Tailwind), ohne Backend

Hinweis zur Vollstaendigkeit:
- `node_modules` ist Drittanbieter-Code und wird fachlich nicht detailliert dokumentiert.
- Binardateien werden als Assets klassifiziert und nicht inhaltlich dekompiliert.

## 2. Technischer Ueberblick

## 2.1 Tech Stack

- Runtime/Build: Vite 4
- UI: React 18
- Styling: TailwindCSS + Custom Utility-Klassen
- Animation: Framer Motion
- Icons: lucide-react
- Package Manager: npm (via `package-lock.json`)

Konfigurationen:
- `vite.config.js`: React-Plugin aktiv
- `tailwind.config.js`: Scan fuer `index.html`, `src/**/*`, Root-`*.jsx`; Custom-Farbe `wamocon-red`
- `postcss.config.js`: Tailwind + Autoprefixer

## 2.2 Entry Points und Struktur

- HTML Entry: `index.html`
- React Bootstrap: `src/main.jsx`
- App Root: `src/App.jsx`
- Fehlerabfang: `src/ErrorBoundary.jsx`
- Hauptlogik/UI: `wamohub_interactive_preview_react (1).jsx`
- Zusatzmodule:
  - `src/Login.jsx`
  - `src/Timesheet.jsx`

## 2.3 Status Build und Qualitaet

Gepruefter aktueller Status:

- `npm run dev`: **laeuft erfolgreich** (Vite startet, Local URL wird bereitgestellt)
- `npm run lint`: **fehlschlaegt** wegen fehlender ESLint-Konfiguration
  - Script vorhanden in `package.json`
  - `.eslintrc*` / `eslint.config.*` fehlt

Bewertung:
- Build-/Startfaehigkeit: vorhanden
- Statische Codequalitaetspruefung: nicht produktiv nutzbar konfiguriert

## 3. Fachliches Zielbild (aus Code ableitbar)

Die Anwendung ist eine interaktive Vorschau fuer ein internes "Quality & Testing Command Center" mit Fokus auf:

- Rollenbasiertes Arbeiten (Mentee, Mentor, Admin)
- Projektverwaltung
- Ziele/Entwicklung/Assessment
- Mentor-Mentee-Kollaboration
- Timesheets
- Urlaubs- und Reisekosten-Approval (Admin-Dashboard)
- Schnellzugriffe auf externe Plattformen

Wichtig: Das System ist derzeit eine **In-Memory-Demo** ohne persistente Speicherung.

## 4. Datenmodell und Persistenz

## 4.1 Datenhaltung

Alle Domainedaten liegen als lokale States im Frontend (`useState`) und initiale Arrays/Objekte in `wamohub_interactive_preview_react (1).jsx` bzw. `src/Timesheet.jsx`.

Es gibt:
- keine API-Calls zu realen Services
- keine Datenbank
- keine Auth-Integration
- keine Session-/Token-Verwaltung

Folge:
- Alle Aenderungen gehen nach Reload verloren.

## 4.2 Entitaeten (Ist)

- User
- Rollen/Permissions (RBAC-Matrix)
- MentorRelation
- Project (+ Members)
- Goal
- Note (GENERAL, PROJECT, GOAL, MENTEE_PRIVATE)
- ChecklistTemplate + ChecklistProgress
- Assessment
- MentorTask
- Reflection
- UrlaubRequest
- TravelCost
- Externe Links (konfigurierbar im Admin-Modul)
- Timesheet (separate Komponente mit eigener In-Memory-Liste)

## 5. Modul-Dokumentation: Anforderungen vs. Ist-Stand

Statuslegende:
- Implementiert = funktional im Frontend bedienbar
- Teilweise = sichtbar, aber fachlich/technisch lueckenhaft
- Mock = Demo-/Dummy-Daten oder simulierte Verarbeitung
- Platzhalter = visuell vorhanden, ohne End-to-End-Funktion

## 5.1 Login

Anforderung (implizit):
- Benutzer waehlen und anmelden

Ist:
- User-Auswahl per Dropdown
- Simulierter Login-Delay (`setTimeout`)
- Kein Passwort, kein echter Auth-Provider

Status:
- **Teilweise + Mock**

## 5.2 Home/Dashboard

Anforderung:
- Rollenabhaengige Uebersicht, KPIs, Navigation

Ist:
- Rollenbadges und Quick Stats
- Kachel-Navigation in Module
- Activity Feed (statisch erzeugte Aktivitaeten)

Status:
- **Implementiert (UI) + Mock (Inhalte)**

## 5.3 Consultant

Anforderung:
- Profil, eigene Projekte, eigene Ziele, Mentor-Ziele, Checkliste, Assessment

Ist:
- Profil inkl. CV-Link
- Projekte + private Projektnotizen
- Eigene Ziele CRUD (einfach)
- Mentor-Ziele read-only fuer Mentee
- Checklistenanzeige und Notiz je Kriterium
- Assessment-Einreichung moeglich

Status:
- **Implementiert (Frontend) + Mock (Daten/Flows)**

## 5.4 Organisation

Anforderung:
- Organisatorische Teilbereiche (Timesheet, Reisekosten, Urlaub, Kalender)

Ist:
- Einstieg in Timesheet moeglich
- Reisekosten/Kalender als Platzhalter-Kacheln
- Urlaubsantraege als vereinfachte Liste mit Demo-Neuantrag

Status:
- **Teilweise**, mit **Platzhaltern**

## 5.5 Timesheet (`src/Timesheet.jsx`)

Anforderung:
- Zeiterfassung, Filtern, Einreichen, Pruefen/Freigeben

Ist:
- Tabelle, Filter, Summen, Modal fuer Add/Edit
- Statusaktionen fuer DRAFT/SUBMITTED/APPROVED/REJECTED
- Admin-nahe Review-Aktionen in der Tabelle

Wichtige Luecke/Inkonsistenz:
- Neu angelegte Eintraege erhalten Status `PENDING`,
- Edit/Delete/Submit sind aber nur fuer `DRAFT` freigeschaltet
- Dadurch sind neue Eintraege direkt eingeschraenkt bedienbar

Status:
- **Teilweise + Mock**, mit fachlicher Status-Inkonsistenz

## 5.6 Projekte

Anforderung:
- Projekte verwalten, Mitglieder zuweisen, Jira verlinken

Ist:
- Suche, Anlegen, Bearbeiten, Loeschen
- Mitgliederzuweisung inkl. Rollenlabel
- Jira-Link pro Projekt
- Zusatzkacheln fuer StartSmart/DiTele/FIAE mit externen URLs

Status:
- **Implementiert (Frontend) + Mock (Daten/Integrationen)**

## 5.7 Mentor

Anforderung:
- Mentees einsehen, Mentor-Ziele verwalten, private Notizen, Assessment bestaetigen, Tasks/Reflections ausloesen

Ist:
- Mentee-Auswahl und Detailansicht vorhanden
- Mentor-Ziele + Mentor-Notizen + Assessment bestaetigen vorhanden
- Mentor-Powers-Buttons fuer Task/Reflection vorhanden

Kritische Luecke:
- In `MenteeDetail` werden Variablen verwendet, die dort nicht im Scope sind (`active`, `mentor`, `users`, `setMentorTasks`, `setReflections`)
- Das fuehrt bei Klick auf Mentor-Powers zu Laufzeitfehlern

Status:
- **Teilweise**, mit **kritischem Runtime-Risiko**

## 5.8 Academy

Anforderung:
- Schulungen/Kurse/Zertifikate verwalten

Ist:
- Kursliste, Zertifikate, Training Requests als statische Demo-Inhalte
- Keine Persistenz/keine echten Workflows

Status:
- **Mock / Demo-Modul**

## 5.9 Notizen

Anforderung:
- Eigene Notizen pflegen und durchsuchen

Ist:
- CRUD fuer eigene GENERAL-Notizen
- Suchfilter lokal

Status:
- **Implementiert (Frontend) + Mock-Persistenz**

## 5.10 Sonstiges

Anforderung:
- Sonstige Tools/Links/Dokumente/Kalender

Ist:
- Quick Links (Tischkicker, QuickWin)
- Dokumentliste statisch
- Vacation Requests in diesem Modul separat als statische Liste
- Kalenderintegration nur als UI-Stub

Status:
- **Teilweise + Mock/Platzhalter**

## 5.11 RBAC

Anforderung:
- Rollen- und Sichtbarkeitsregeln transparent machen

Ist:
- Rollenanzeige und Beispiele fuer Sichtbarkeiten
- Reale Rechtepruefung fuer Module ueber `canAccessModule` und `ROLE_PERMISSIONS`

Status:
- **Implementiert (Frontend-Regeln)**

## 5.12 Admin

Anforderung:
- User-/Mentor-Verwaltung, Links, Checklisten, Uebersicht

Ist:
- Mentor-Zuweisungen aktivier-/deaktivierbar
- Externe Links editierbar
- Checklist-Template bearbeitbar
- User Management (hinzufuegen, Mentor-Rolle toggeln, loeschen)
- Statistik-Kacheln

Status:
- **Implementiert (Frontend) + Mock (ohne Backend/Persistenz)**

## 5.13 Approvals

Anforderung:
- Timesheets, Urlaub, Reisekosten zentral freigeben/ablehnen

Ist:
- Drei Approval-Bloecke vorhanden
- Urlaub/Reisekosten basieren auf passenden Collections
- "Timesheet Approvals" arbeitet aber auf `mentorTasks` statt Timesheet-Daten

Folge:
- Semantische Fehlzuordnung (fachlich inkonsistent)

Status:
- **Teilweise + fachliche Inkonsistenz**

## 6. Mocking- und Platzhalter-Inventar (explizit)

Folgende Bereiche sind klar gemockt oder simuliert:

- Mock-Datenblock fuer nahezu alle Entitaeten in `wamohub_interactive_preview_react (1).jsx`
- Mock-Timesheet-Daten in `src/Timesheet.jsx`
- Simulierter Login/API-Delay (setTimeout / Promise delay)
- Externe URLs oft auf `example.com`/Demo-Ziele
- Alerts als Demo-Feedback anstelle echter Persistenz
- Platzhalter-Module/Kacheln (z. B. Reisekosten/Kalender in Organisation)
- Academy-Inhalte statisch
- Documents-Liste statisch

## 7. Rechte- und Rollenmodell (Ist)

Rollen:
- Mentee
- Mentor
- Admin

Implementierung:
- Rechte werden aus Rollen zusammengefuehrt (`getUserPermissions`)
- Modulzugriffe:
  - Mentor-Modul: nur mit `canViewMentor`
  - Admin/RBAC: nur mit `canViewAdmin`

Bewertung:
- UI-seitige Zugriffsbeschraenkung vorhanden
- Kein Server-seitiges Enforcement (da kein Backend)

## 8. Nicht-funktionale Eigenschaften

## 8.1 Positiv

- Moderne UI mit Animationen und responsivem Grid
- Error Boundary auf App-Ebene vorhanden
- Keyboard-Shortcuts fuer Navigation

## 8.2 Luecken/Risiken

- Keine Persistenz
- Keine Tests
- Kein funktionierender Lint-Prozess (fehlende Config)
- Teilweise inkonsistente Daten-/Statusmodelle
- Kein echtes Security-Modell (nur Client-seitige Gates)

## 9. Bekannte technische/fachliche Defekte (Ist-Aufnahme)

1. Mentor-Powers Runtime-Risiko in `MenteeDetail`
- Nutzung nicht definierter Variablen beim Klick auf Actions
- Effekt: potenzieller Laufzeitfehler in Mentor-Funktionen

2. Timesheet-Statusmodell uneinheitlich
- Neue Eintraege starten als `PENDING`
- Bearbeiten/Loeschen/Submit aber an `DRAFT` gekoppelt

3. Approval-Dashboard verwendet falsche Quelle fuer Timesheet-Freigaben
- `pendingTimesheets` aus `mentorTasks` statt Timesheet-Daten

4. Linting nicht einsatzfaehig
- `npm run lint` scheitert mangels ESLint-Konfiguration

5. Asset-Mismatch
- `index.html` referenziert `/src/logo.svg` als SVG-Favicon
- Datei `src/logo.svg` ist inhaltlich ein PNG-Binary

## 10. Offene Anforderungen bis produktionsreif (abgeleitet)

Um von "Interactive Preview" auf produktionsnah zu kommen, fehlen mindestens:

- Backend/API fuer Auth, User, Projekte, Goals, Notes, Timesheets, Approvals
- Persistente Datenspeicherung
- Serverseitige Autorisierung
- Vollstaendige fachliche Workflow-Haertung (Statusmodelle vereinheitlichen)
- Konsolidierung mehrfacher Datenquellen (z. B. Vacation in mehreren Modulen)
- Teststrategie (Unit + Integration + E2E)
- Lint/Format/CI-Konfiguration
- Observability (Logging, Monitoring, Error Reporting)

## 11. Dateiinventar (Anwendungsdateien)

- `index.html`
- `package.json`
- `package-lock.json`
- `postcss.config.js`
- `tailwind.config.js`
- `vite.config.js`
- `wamohub_interactive_preview_react (1).jsx`
- `src/App.jsx`
- `src/ErrorBoundary.jsx`
- `src/Login.jsx`
- `src/Timesheet.jsx`
- `src/main.jsx`
- `src/index.css`
- `src/logo.svg` (Binary-Asset, PNG-Inhalt)
- `public/logo.png`

---

Kurzfazit:
Die Anwendung ist eine umfangreiche, visuell starke Frontend-Vorschau mit klar erkennbarem fachlichen Zielbild und vielen bereits abgebildeten Domainen. Der aktuelle Stand ist jedoch in grossen Teilen **demo-/mock-getrieben** und fuer produktiven Einsatz noch nicht ausreichend (Persistenz, Auth, Server-Checks, Tests, konsistente Workflows fehlen).

## 12. Ziel-Repository-Abgleich (Wamocon/wamohub)

## 12.1 Verbindungsnachweis und Quellen

Die Verbindung zum Ziel-Repository wurde ueber GitHub API + Raw-Dateien hergestellt und verifiziert:

- Repo-Metadaten: `https://api.github.com/repos/Wamocon/wamohub`
- Root-Inhalte: `https://api.github.com/repos/Wamocon/wamohub/contents`
- README: `https://raw.githubusercontent.com/Wamocon/wamohub/main/README.md`
- HOWTO: `https://raw.githubusercontent.com/Wamocon/wamohub/main/HOWTO.md`
- Package/Konfigurationen: `package.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`
- CI/CD-Workflows: `.github/workflows/deploy.yml`, `.github/workflows/pr-pipeline.yml`
- App-Ordner: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

## 12.2 Ziel-Technologieanforderungen (aus Ziel-Repo)

Im Ziel-Repository ist als Standard gesetzt:

- Framework: Next.js 16 (App Router, `src/app`)
- Sprache: TypeScript 5, strict mode
- React: 19
- Styling: Tailwind CSS v4 (PostCSS via `@tailwindcss/postcss`)
- Backend/DB/Auth: Supabase (PostgreSQL, Auth, RLS)
- CI/CD: GitHub Actions (PR-Pipeline + Deploy), Vercel als Zielplattform
- Quality Gates: `npm run lint` + `npm run typecheck`
- Environment-Konventionen: `.env.local` basierend auf `.env.example`

## 13. SIT-zu-Ziel-Mapping (Technologie und System)

## 13.1 Mapping-Matrix

1. Rendering/Framework
- SIT: React SPA auf Vite (`index.html` + `src/main.jsx`)
- Ziel: Next.js 16 App Router (`src/app/*`)
- Gap: Architekturwechsel von Client-SPA zu Next App Router

2. Sprache/Typisierung
- SIT: JavaScript/JSX
- Ziel: TypeScript strict
- Gap: Vollstaendige TS-Migration aller Komponenten/Modelle erforderlich

3. Styling
- SIT: Tailwind v3 + `@tailwind base/components/utilities`
- Ziel: Tailwind v4 + `@import "tailwindcss"`
- Gap: Tailwind-Migrationsschritt inkl. Config-/PostCSS-Anpassung

4. Datenhaltung
- SIT: In-Memory `useState` + Mock-Arrays
- Ziel: Supabase PostgreSQL + persistente Daten
- Gap: Komplette Backend-/Datenpersistenz-Einfuehrung erforderlich

5. Auth/RBAC
- SIT: Simulierter Login, clientseitige Rollenpruefung
- Ziel: Supabase Auth + DB-nahe Autorisierung (RLS)
- Gap: Auth-Flows, Session-Handling, Policies und serverseitiges Enforcement fehlen

6. API/Serverlogik
- SIT: Keine API
- Ziel: Next Server Components/Route Handlers + Supabase-Client
- Gap: Service-Schicht + Fehler-/Validierungslogik aufbauen

7. CI/CD
- SIT: Kein laufender Lint-Gate, keine Workflows im Repo
- Ziel: Zentrale Wamocon Workflows (PR Auto-Fix, Typecheck/Lint, Vercel Deploy)
- Gap: Workflow-Dateien und Secrets/Projektanbindung notwendig

8. Non-Functional
- SIT: Keine Tests, keine observability
- Ziel: mindestens Lint/Typecheck im PR-Flow, deployment-faehige Struktur
- Gap: Qualitaetssicherung und Betriebsfaehigkeit ausbauen

## 13.2 Fachliches Mapping

Die fachlichen Module aus SIT (Consultant, Mentor, Projekte, Timesheet, Approvals, Notizen etc.) sind als UI- und Domain-Blueprint nutzbar, muessen aber technisch in Zielbausteine ueberfuehrt werden:

- UI-Module -> Next.js Routen/Segmente und Komponenten
- In-Memory Stores -> Supabase Tabellen + Views + Policies
- Client-only Aktionen -> serverseitig abgesicherte Mutationen
- Demo-/Alert-Interaktionen -> persistente Workflows mit Fehlerbehandlung

## 14. Lueckenliste gegen Zielanforderungen

Kritische Luecken (Muss):

1. Kein Next.js App Router vorhanden
2. Kein TypeScript strict Setup
3. Keine Supabase-Integration (URL/Key/Client/Queries)
4. Keine persistente DB-Struktur fuer Kernobjekte
5. Kein echtes Auth/RLS-Modell
6. Keine CI/CD-Anbindung an Wamocon-Workflow-Standard
7. Kein funktionierender Lint/Typecheck-Gate im aktuellen Projektzustand

Mittlere Luecken (Soll):

1. Fachliche Statusmodelle nicht konsistent (Timesheet/Approvals)
2. Laufzeitrisiko im Mentor-Modul (Scope-Fehler)
3. Doppelte/inkonsistente Domainrepraesentationen in Teilmodulen

Niedrige Luecken (Kann):

1. Asset-Konsistenz/Favicon-Bereinigung
2. UX-Feinschliff und Internationalisierungskonsistenz

## 15. Umbauziel (Sollbild in Ziel-Repo)

Die Anwendung soll als produktionsnahe Next.js-16-Applikation im Ziel-Repository laufen, mit:

- TypeScript strict und sauberer Build-/PR-Pipeline
- Supabase als Single Source of Truth fuer Daten und Auth
- serverseitig erzwungenen Berechtigungen via RLS
- ueberfuehrten fachlichen Kernprozessen aus der SIT-Vorschau
- Vercel-deploymentfaehiger CI/CD-Einbindung gemaess Wamocon-Template

## 16. Migrationsstatus (Phase 1 abgeschlossen)

Stand: 2026-04-07

### 16.1 Zielrepository lokal eingebunden

- Geklont nach: `D:\Testprojekt\wamohub-target`
- Feature-Branch: `feature/wamohub-migration`
- Commit: `6b7d91b` — Phase 1 komplett

### 16.2 Erstellte Dateien (22 geaendert, 3127 Zeilen hinzugefuegt)

| Datei | Zweck |
|---|---|
| `src/types/domain.ts` | Alle Domain-Typen (User, Project, Goal, Note, Timesheet, etc.) — TypeScript strict |
| `src/lib/data.ts` | Mock-Daten, RBAC-Permissions, Hilfsfunktionen (formatLevel, shortId, cn, hasPermission, canAccessModule) |
| `src/lib/app-state.tsx` | React 19 Context fuer globalen App-State mit allen Settern und abgeleiteten Daten |
| `src/components/ui.tsx` | Shared UI-Primitiven: Badge, Button, Input, Textarea, SectionCard, Modal, Tile |
| `src/components/sidebar.tsx` | Einklappbare Sidebar-Navigation mit RBAC-gesteuerter Sichtbarkeit |
| `src/components/topbar.tsx` | Top-Bar mit Suche, Benachrichtigungen, User-Wechsler |
| `src/components/login.tsx` | Login-Screen mit Demo-User-Auswahl (Mock-Auth) |
| `src/components/modules/dashboard.tsx` | Dashboard-Startseite mit Statistiken, Navigations-Tiles, Activity-Feed |
| `src/components/modules/consultant.tsx` | Berater-Bereich: Profil, Ziele (eigene + Mentor), Assessment, Mentor Tasks, Reflections |
| `src/components/modules/projects.tsx` | Projekte: Suche, CRUD, Mitgliederverwaltung, Jira-Links |
| `src/components/modules/mentor.tsx` | Mentor-Bereich: Mentee-Auswahl, Ziele setzen, Tasks, Reflections, Assessment bestaetigen |
| `src/components/modules/organization.tsx` | Organisation: Zeiterfassung, Urlaubsantraege, Reisekostenabrechnungen |
| `src/components/modules/admin.tsx` | Admin: Benutzerverwaltung, Mentor-Zuweisungen, Link-Konfiguration, Checklist-Vorlage |
| `src/components/modules/approvals.tsx` | Genehmigungen: Timesheet/Urlaub/Reisekosten freigeben |
| `src/components/modules/notes.tsx` | Persoenliche Notizen: CRUD mit Suche |
| `src/components/modules/academy.tsx` | Academy: Kurse, Zertifikate, Schulungsantraege (statisch/Mock) |
| `src/components/modules/misc.tsx` | Sonstiges: Quick Links, Dokumente, Urlaubskonto, Kalender-Platzhalter |
| `src/app/page.tsx` | App-Shell: Login-Gate, Sidebar + Topbar + Modul-Router |
| `src/app/layout.tsx` | Root-Layout mit AppProvider, WAMOHUB-Metadaten, Dark-Theme |
| `src/app/globals.css` | Dark-Theme CSS mit wamocon-red Variable, Scrollbar-Styling |

### 16.3 Qualitaetssicherung

| Pruefung | Ergebnis |
|---|---|
| `npm run typecheck` (tsc --noEmit) | 0 Fehler |
| `npm run lint` (eslint .) | 0 Fehler, 0 Warnungen |
| `npm run dev` (next dev --turbopack) | HTTP 200, ~3s Seitenladezeit |
| Tailwind v4 Syntax | bg-linear-to-r statt bg-gradient-to-r korrekt angewendet |
| React 19 Context API | `<Context value={}>` statt `.Provider` korrekt |

### 16.4 Funktionaler Abdeckungsgrad

| SIT-Modul | Migrationsstatus | Anmerkung |
|---|---|---|
| Dashboard | ✅ Komplett | Statistiken, Tiles, Activity-Feed |
| Consultant/Profil | ✅ Komplett | Profil, Ziele, Assessment, Mentor Tasks |
| Projekte | ✅ Komplett | CRUD, Mitglieder, Jira-Links |
| Mentor | ✅ Komplett | Multi-Mentee, Goals, Tasks, Reflections, Assessment-Bestaetigung |
| Organisation | ✅ Komplett | Timesheet, Urlaub, Reisekosten mit Submit-Workflow |
| Admin | ✅ Komplett | User-CRUD, Mentor-Zuweisung, Links, Checklist-Template |
| Approvals | ✅ Komplett | 3-Tab Genehmigungsdashboard |
| Notizen | ✅ Komplett | CRUD mit Suche |
| Academy | ✅ Komplett | Kurse, Zertifikate, Schulungsantraege (statisch) |
| Sonstiges | ✅ Komplett | Links, Dokumente, Urlaubskonto, Kalender-Platzhalter |
| RBAC | ✅ Komplett | Rollenbasierte Berechtigung ueber ROLE_PERMISSIONS + Context |
| Login/Auth | ⚠️ Mock | Demo-User-Auswahl — Supabase-Auth in Phase 2 |
| Datenpersistenz | ⚠️ In-Memory | Mock-Daten — Supabase-Anbindung in Phase 3 |

### 16.5 Offene Punkte fuer Phase 2+

1. **Supabase Auth** — Login ersetzen durch echte Authentifizierung
2. **Supabase Datenbankanbindung** — Mock-Daten durch echte Queries ersetzen
3. **Row Level Security (RLS)** — Serverseitige Berechtigungspruefung
4. **Server Components** — Datenladung serverseitig fuer bessere Performance
5. **framer-motion** — Optional: Animationen wieder einfuehren
6. **Vercel Deployment** — CI/CD Pipeline aktivieren
7. **Internationalisierung** — Konsistente de/en Sprachfuehrung