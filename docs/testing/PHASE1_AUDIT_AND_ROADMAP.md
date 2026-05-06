# RELDA — DB-Anbindungs-Audit & E2E-Roadmap

> Stand nach Phase 1. Quelle: statische Analyse von `src/components/modules/**`, `src/lib/actions.ts`, `src/lib/app-state.tsx`.

## 1. Was Phase 1 geliefert hat

- **Playwright 1.59** als Dev-Dependency installiert.
- [playwright.config.ts](playwright.config.ts) — Chromium-Projekt, `webServer: npm run dev`, `baseURL: http://localhost:3000`, Trace/Screenshots/Video on-failure.
- [tests/e2e/fixtures.ts](tests/e2e/fixtures.ts) — `loginAs(page, role)`-Helper, der gegen die aktuelle User-Selection-Login funktioniert.
- [tests/e2e/smoke.spec.ts](tests/e2e/smoke.spec.ts) — 4 Smoke-Tests (Mentee/Mentor/Admin-Login + Modulnavigation, Logout-Probe).
- npm-Scripts: `test:e2e`, `test:e2e:ui`, `test:e2e:report`.
- `.gitignore` erweitert (`/playwright-report/`, `/test-results/`, `/blob-report/`, `/playwright/.cache/`).
- `npm run typecheck` und `npm run lint` sind grün; `npx playwright test --list` zeigt alle 4 Tests.

**Lokal ausführen:**
```powershell
npm run db:start          # Supabase Docker hochfahren
npm run test:e2e          # Headless
npm run test:e2e:ui       # Mit Playwright-UI
```

## 2. DB-Anbindungs-Audit

Legende: ✅ persistiert, ⚠️ teilweise, ❌ nur lokaler React-State (geht bei Reload verloren)

| Modul | Datei | Status | Problem-Funktionen |
|---|---|---|---|
| Projekte | [projects.tsx](src/components/modules/projects.tsx) | ✅ | – |
| Organisation | [organization.tsx](src/components/modules/organization.tsx) | ✅ | – |
| Notizen | [notes.tsx](src/components/modules/notes.tsx) | ✅ | – |
| Mentor | [mentor.tsx](src/components/modules/mentor.tsx) | ✅ | – |
| WAMOCON Apps | [wamocon-apps.tsx](src/components/modules/wamocon-apps.tsx) | ✅ | – |
| Consultant | [consultant.tsx](src/components/modules/consultant.tsx) | ⚠️ | Goals + Assessment ja; **Timesheet/Vacation/Travel/Checklist-Progress** vermutlich nicht → muss verifiziert werden |
| Approvals | [approvals.tsx](src/components/modules/approvals.tsx) | ❌ | `approveTimesheet`, `rejectTimesheet`, `approveVacation`, `rejectVacation`, `approveTravel`, `rejectTravel` (Z. 24–29) — alle nur `setX(...)` |
| Admin | [admin.tsx](src/components/modules/admin.tsx) | ❌ | `addUser` (Z. 50), `updateRole` (Z. 54), `updateLevel` (Z. 55), `deleteUser` (Z. 56), Mentor-Zuweisung (Z. 111), External Links CRUD (Z. 166, 170) |
| Dashboard / Academy / Misc / Notes-Filter | – | ✅ read-only | – |

**Kritische Lücke:** Genehmigungs-Workflow (Approvals) und Admin-Userverwaltung schreiben **nicht** in Supabase. Reload zeigt den alten Stand → blockiert echte E2E-Tests, weil Test-Erwartungen wie „nach Approve ist Status APPROVED in DB" nicht stabil sind.

Server-Actions in [actions.ts](src/lib/actions.ts) für genau diese Operationen sind **bereits vorhanden** (`updateUser`, `updateTimesheet`, `updateVacationRequest`, `updateTravelCost`, `createMentorRelation`, `updateMentorRelation`, `createExternalLink`, `updateExternalLink`, `deleteExternalLink`). Es fehlt nur das Verdrahten in den Komponenten.

## 3. Vorschlag für Phasen 2–5

### Phase 2 — DB-Anbindung schließen (Voraussetzung für ehrliche E2E-Tests)
1. `admin.tsx`: User-CRUD, Mentor-Zuweisung, Links auf Server-Actions umstellen + optimistisches UI mit Refresh-Fallback.
2. `approvals.tsx`: alle Approve/Reject auf `updateTimesheet/updateVacationRequest/updateTravelCost` umstellen.
3. `consultant.tsx`: Timesheet-/Vacation-/Travel-/Checklist-Progress-Erstellung verifizieren und ggf. anbinden.
4. Aktion: ein Test in `smoke.spec.ts` schreibt → reloadet → assertet, dass Wert noch da ist.

### Phase 3 — 8 Wellen + Apps aus Vercel
1. Du lieferst die 8 Vercel-Projekte (Name, URL, optional Beschreibung/Wellen-Zuordnung).
2. Neue Migration `supabase/migrations/2026MMDDHHmmss_wamocon_waves_seed.sql` mit 8 Wellen + N Apps + Wave-Assignments.
3. Idempotent (`ON CONFLICT DO NOTHING`), nutzt `wamocon_waves`/`wamocon_apps`/`wamocon_app_waves` aus `20260415100000_wamocon_apps.sql`.
4. E2E-Test: Wellen sichtbar in `wamocon-apps.tsx`, Klick auf App öffnet `/wamocon-app/[id]`, Detail rendert.

### Phase 4 — UI-Polish auf bestehender Struktur
1. Konsolidierte Tailwind-Tokens (Spacing/Schriftgrößen/Farben) als Utility-Set in `globals.css`.
2. Loading-/Empty-/Error-States für jedes Modul (aktuell teils nur `dataLoading`-Spinner).
3. Mobile Layout (Sidebar als Drawer, Topbar-Aktionen).
4. Visuelle Konsistenz: Buttons, Karten, Tabellen, Form-Controls auf 2–3 Klassen-Bündel reduzieren.
5. Accessibility-Sweep (Fokus-States, ARIA-Labels für Icon-only-Buttons → erleichtert auch E2E-Selektoren).

### Phase 5 — E2E-Vollabdeckung + Production-Härtung
1. Pro Modul ein Spec-File (`projects.spec.ts`, `notes.spec.ts`, `mentor.spec.ts`, `approvals.spec.ts`, `admin.spec.ts`, `wamocon-apps.spec.ts`, `consultant.spec.ts`) — jeweils Create/Edit/Delete + Cross-User-Sichtbarkeits-Asserts.
2. Test-Isolation: Jeder Test legt sein eigenes Test-Datum mit eindeutigem Prefix an, räumt im `afterEach` auf (oder eigenes Test-Schema, das vor jedem Run resettet wird).
3. CI-Workflow `.github/workflows/e2e.yml` (Supabase im Container, `npm run db:start`, `npm run test:e2e`).
4. Production-Härtung:
   - RLS-Policies von „permissive" auf rollenbasiert verschärfen.
   - Server-Actions: Berechtigungs-Checks (z. B. nur Admin darf User löschen).
   - Error-Boundaries pro Modul.
   - `next build` mit eingeschaltetem `productionBrowserSourceMaps: false`, `eslint`/`typescript` build-blocker.
   - Vercel-Env-Variablen-Checkliste.

## 4. Offene Fragen / Bestätigung benötigt

1. **Vercel-Projekte:** Wann liefst du die 8 Einträge (Name + URL + ggf. Wellen-Zuordnung)? Nötig für Phase 3.
2. **Approvals-RBAC:** Aktuell `reviewedBy: "admin"` als String — soll auf `activeUserId` umgestellt werden (richtig)?
3. **Test-Datenstrategie:** „eindeutiges Prefix + afterEach-cleanup" oder „dediziertes Test-Schema mit `db:reset` vor Run"?
4. **Browser-Matrix:** Reicht Chromium oder auch Firefox + WebKit ins Playwright-Setup?
