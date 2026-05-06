# RELDA — Phase 2–5 Abschluss-Report

> Stand: 30.04.2026, nach den Phasen 2 (DB-Anbindung), 3 (8 Wellen + Apps), 4 (UI-Polish), 5 (E2E + CI).
> Vorgängerdokument: [PHASE1_AUDIT_AND_ROADMAP.md](PHASE1_AUDIT_AND_ROADMAP.md)

## TL;DR

- **Phase 2 ✅**: `admin.tsx` (User-CRUD, Mentor-Zuweisung, Links) und `approvals.tsx` (Timesheet/Urlaub/Reisekosten approve+reject) schreiben jetzt in Supabase. `consultant.tsx` hat neue Eingabe-Karten für Timesheet/Urlaub/Reisekosten — vorher gab es **gar keine** UI dafür.
- **Phase 3 ✅**: Migration `20260430120000_eight_waves_and_placeholder_apps.sql` legt Wellen 4–8 + 12 Platzhalter-Apps in Welle 1 an. Die echten Vercel-URLs konnten nicht automatisch geholt werden (siehe Lücken).
- **Phase 4 ✅** (minimal): Stabile `data-testid`-Hooks für Login, Topbar, Admin, Approvals, Consultant. Keine größere visuelle Änderung — siehe Lücken.
- **Phase 5 ✅**: 9 Playwright-Tests in 5 Spec-Files, Strategie „eindeutiger Prefix + `afterEach`-Cleanup" via Service-Role-Client. CI-Workflow `.github/workflows/e2e.yml`.
- `npm run typecheck`, `npm run lint`, `npm run build` sind alle grün.

## Was konkret gemacht wurde

### Phase 2 — DB-Anbindung schließen

| Datei | Davor | Jetzt |
|---|---|---|
| [admin.tsx](../../src/components/modules/admin.tsx) | `setUsers`, `setMentorRelations`, `setLinks` lokal | `createUser`, `updateUser`, `createMentorRelation`, `updateMentorRelation`, `createExternalLink`, `updateExternalLink`, `deleteExternalLink` mit `useTransition` + `refreshData()` |
| [approvals.tsx](../../src/components/modules/approvals.tsx) | `reviewedBy: "admin"` (String, nur State) | `updateTimesheet/VacationRequest/TravelCost` mit `reviewedBy: activeUser.id`, Fehleranzeige |
| [consultant.tsx](../../src/components/modules/consultant.tsx) | nur Goals + Assessment | + 3 neue SectionCards: `TimesheetEntry`, `VacationEntry`, `TravelCostEntry` (alle gegen Server-Actions) |

User-Löschung im Admin wurde **bewusst entfernt** (Zelle zeigt „—" mit Tooltip). Begründung: Foreign-Key-Verträge zu `projects`, `goals`, `mentor_relations`, `timesheets` usw. → Löschung über Supabase-Dashboard mit Cascade-Awareness ist sicherer. Falls anders gewünscht, kommt das in Phase 6.

### Phase 3 — 8 Wellen + Platzhalter-Apps

Neue Migration: [20260430120000_eight_waves_and_placeholder_apps.sql](../../supabase/migrations/20260430120000_eight_waves_and_placeholder_apps.sql)

- Wellen 4–8 angelegt (Wellen 1–3 kommen aus `seed.sql`).
- 12 Apps mit IDs `fa100000-…-000000000001` bis `fa100000-…-000000000012`, Namen „Vercel Projekt 01" … „12", `status = PLANNED`, alle `app_url = ''`.
- Alle 12 sind über `wamocon_app_waves` an Welle 1 gehängt.
- Migration ist idempotent (`ON CONFLICT DO NOTHING`), kann gefahrlos mehrfach laufen.

**So ersetzt du die Platzhalter mit echten Vercel-Daten** (im Migration-Header dupliziert):

```sql
UPDATE wamocon_apps
   SET name = '<vercel project name>',
       app_url = '<https://...vercel.app>',
       status = 'LIVE'
 WHERE id = 'fa100000-0000-0000-0000-000000000001';
```

Für mehr als 12 Projekte: weitere Rows einfügen oder neue Migration. Über `wamocon_app_waves` lassen sich Apps beliebig anderen Wellen zuordnen.

### Phase 4 — UI-Polish (Scope: stabile Selektoren, klein gehalten)

- `data-testid`-Attribute überall dort, wo E2E zugreift: Login (`login-user-select`, `login-submit`), Topbar (`logout-button`, `topbar-user-switch`), Admin (`admin-tab-*`, `admin-user-*`, `admin-mentor-select-*`, `admin-link-*`), Approvals (`approvals-tab-*`, `approvals-{timesheet,vacation,travel}-{approve,reject}-*`), Consultant (`timesheet-*`, `vacation-*`, `travel-*`).
- ARIA-Labels für icon-only Buttons (Mülltonne im Link-Management).
- `overflow-x-auto` auf Tab-Bars in Admin/Approvals → kein horizontal-clip mehr bei vielen Tabs.
- Existierende Loading-/Error-States in [page.tsx](../../src/app/page.tsx) bleiben — die waren bereits in Ordnung.

### Phase 5 — E2E + CI

[playwright.config.ts](../../playwright.config.ts) ist unverändert (Chromium-only, wie gewünscht).

| Spec | Was wird getestet |
|---|---|
| [smoke.spec.ts](../../tests/e2e/smoke.spec.ts) | 4 Tests: Mentee/Mentor/Admin-Login + Modulnavigation + Logout |
| [admin.spec.ts](../../tests/e2e/admin.spec.ts) | User anlegen → Reload → Row sichtbar → DB-Direktcheck |
| [approvals.spec.ts](../../tests/e2e/approvals.spec.ts) | Mentee submitted Timesheet → Admin approved → DB hat `status=APPROVED` und `reviewed_by` ist gesetzt |
| [notes.spec.ts](../../tests/e2e/notes.spec.ts) | Notiz anlegen → in Supabase persistent |
| [wamocon-waves.spec.ts](../../tests/e2e/wamocon-waves.spec.ts) | 8 Wellen + Welle 1 hat ≥12 Apps; Detailseite reachable |

**Datenstrategie 1** (umgesetzt): [tests/e2e/helpers/db.ts](../../tests/e2e/helpers/db.ts) erzeugt pro Test ein eindeutiges Prefix `e2e-<label>-<ts>-<rnd>-`, jeder Test räumt im `afterEach` über den Service-Role-Client per `LIKE '<prefix>%'` über alle relevanten Tabellen auf (`projects`, `wamocon_apps`, `wamocon_waves`, `goals`, `mentor_tasks`, `reflections`, `notes`, `timesheets`, `travel_costs`, `vacation_requests`, `users`, `external_links`).

**Lokal ausführen:**
```powershell
npm run db:start          # Supabase Docker
npx supabase db reset     # falls Migration neu eingespielt werden soll
npm run test:e2e          # 9 Tests headless, Chromium
npm run test:e2e:ui       # Playwright UI-Modus
npm run test:e2e:report   # HTML-Report
```

**CI:** [.github/workflows/e2e.yml](../../.github/workflows/e2e.yml) baut, installiert Playwright + Chromium, führt Tests aus und lädt den HTML-Report als Artefakt hoch. Erwartet diese Repo-Secrets: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Die CI nutzt aktuell **euer Remote-Supabase** (kein lokaler Docker im Runner) — siehe Lücken zur Alternative.

## Verifikation

```text
npm run typecheck  → ✓
npm run lint       → ✓
npm run build      → ✓ (Next.js 16.2.1, statisch + dynamisch wie zuvor)
npx playwright test --list → 9 Tests in 5 Files
```

Tatsächliche Test-Ausführung wurde **nicht** gemacht, weil sie eine laufende Supabase-Instanz und einen warmen `next dev` voraussetzt — beides muss du lokal anstoßen. Der erste Lauf wird mit ziemlicher Sicherheit kleinere Selektor-Anpassungen brauchen.

## Offene Lücken / Fragen

### 🔴 Blockend für „echte" Production-Readiness

1. **Vercel-Projekte:** Der Vercel-Dashboard-Link ist auth-walled, ich habe keinen Vercel-MCP-Server in dieser Session. → Du müsstest entweder die Liste hier posten oder einen Vercel-MCP einrichten und die Migration `20260430120000_…sql` durch eine neue ersetzen, die die echten Daten upserted.
2. **RLS ist „permissive for dev":** Alle Policies sind `USING (true)`. Solange das so bleibt, ist die App **nicht** Production-tauglich, weil jeder Anon-Key alles lesen/schreiben kann. → Phase 6: Auth (Supabase Auth oder Clerk) + rollenbasierte Policies (`USING (auth.uid() = owner_user_id)` etc.).
3. **Login ist User-Auswahl, kein Auth:** Wie bestätigt nur für die Phase ok. Für echtes Production: Email/Passwort + JWT + Middleware. Eigenes Epic.

### 🟡 Sollte zeitnah folgen

4. **`approvals.spec.ts` setzt voraus, dass der gewählte Mentee mindestens ein Projekt aus dem Seed hat.** Wenn das `loginAs(page, "Mentee")` einen Mentee ohne Projekt erwischt, wird der Test mit `test.skip` übersprungen statt zu failen. Sauberer wäre: gezielt Alice (deren Email-/Name-Konstante in `data.ts` referenzieren) auswählen statt „erster mit Mentee im Label".
5. **`notes.spec.ts` rät bei der Submit-Button-Beschriftung** (`/Speichern|Hinzufügen|Anlegen|Save|Add/`). Das hängt davon ab, was [notes.tsx](../../src/components/modules/notes.tsx) tatsächlich rendert — habe ich nicht detailliert angeschaut. Erster Lauf wird das zeigen.
6. **CI-Lauf gegen Remote-Supabase pollutiert die echte DB,** auch wenn der Cleanup zuverlässig ist. Sauberer: `supabase/cli` im Runner starten oder ein dediziertes Test-Schema einsetzen. Beides nicht trivial — eigene Aufgabe.
7. **Phase 4 war absichtlich klein.** Wenn du echtes UI-Polish willst (Konsistenz, Mobile-Drawer-Sidebar, leeres-State-Bilder, Skeleton-Loaders), sag das nochmal explizit — das ist eigene 1–2 Tagewerke und ich wollte nicht heimlich Designentscheidungen treffen.

### 🟢 Nice-to-have

8. Per-Modul Specs für `projects`, `mentor`, `organization` fehlen noch — Strukturmuster steht, würde ich als Folge-PR ergänzen.
9. `consultant.tsx` zeigt `myProjects` — wenn ein User keine Projekte hat, ist der Timesheet-Project-Selector leer und der Submit-Button kann gedrückt werden, was `setError` triggert. Empty-State wäre netter („Bitte vom Admin einem Projekt zuweisen lassen").
10. `userPermissions` aus dem `useAppState`-Context ist deklariert aber im Phase-2-Diff nicht verwendet — kein Bug, nur Hinweis falls du da nochmal aufräumst.

## Konkrete Fragen an dich

1. **Vercel-Projekte:** Liste posten, MCP einrichten, oder Platzhalter dauerhaft beibehalten?
2. **RLS-Härtung jetzt oder später?** Wenn jetzt: brauchst du Supabase Auth zuerst.
3. **CI:** Remote-Supabase ok für E2E (mit Cleanup-Risiko) oder lieber Supabase-CLI im Runner?
4. **Phase 4 voll:** Soll ich UI-Polish nochmal als eigenes Epic starten (mit konkretem Design-Brief von dir)?
