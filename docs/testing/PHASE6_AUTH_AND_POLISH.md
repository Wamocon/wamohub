# Phase 6 — Authentifizierung & UI Polish

## Ziel

- **Vollumfängliche Authentifizierung** mit Supabase Auth (Email/Passwort,
  Reset-Flow, Admin-Invite, Soft-Delete) statt User-Selection.
- **UI Polish** (Toast-System, Skeletons, Empty States, mobile Sidebar).
- Demo-Daten bleiben dauerhaft in der DB; nur E2E-Test-Daten werden via Prefix
  + Whitelist-Guards aufgeräumt.

## Was geändert wurde

### Authentifizierung (Server-seitig)

| Datei | Zweck |
| --- | --- |
| [supabase/migrations/20260430130000_auth_integration.sql](../../supabase/migrations/20260430130000_auth_integration.sql) | `users.auth_user_id` (FK auf `auth.users`), `users.is_active`, RLS-Helper (`app_current_user_id`, `app_is_admin`, `app_is_authenticated_user`), Neuschreibung aller Policies (Lesen nur für eingeloggte User, Mutationen nur Admin/Owner) |
| [src/lib/supabase/middleware.ts](../../src/lib/supabase/middleware.ts) | `updateSession`: refresht Session, redirected unauth → `/login?next=…`, eingeloggte → `/` (außer `/auth/reset-password`) |
| [src/proxy.ts](../../src/proxy.ts) | Next.js 16 **proxy** convention (war: `middleware.ts` — von Next 16 deprecated) |
| [src/lib/auth/actions.ts](../../src/lib/auth/actions.ts) | `signInAction`, `signOutAction`, `requestPasswordResetAction`, `setNewPasswordAction`, `inviteUserAction` (Admin → `auth.admin.inviteUserByEmail` + upsert in `public.users`), `setUserActiveAction` (Soft-Delete + `ban_duration: "876000h"`) |

### Authentifizierung (Client-seitig)

| Datei | Zweck |
| --- | --- |
| [src/app/login/page.tsx](../../src/app/login/page.tsx) | `/login` Route |
| [src/components/auth/login-form.tsx](../../src/components/auth/login-form.tsx) | Email/Passwort-Form mit `useActionState`, Inline-Error, "Passwort vergessen"-Toggle, Loading-Spinner, Demo-Hinweis |
| [src/app/auth/reset-password/page.tsx](../../src/app/auth/reset-password/page.tsx) | Passwort-Reset-Seite (nach Klick auf Email-Link) |
| [src/lib/app-state.tsx](../../src/lib/app-state.tsx) | `AppProvider` nimmt `authEmail` prop entgegen (vom Server-Layout), `activeUser` wird per Email aus `users`-Tabelle gemappt — kein localStorage, kein User-Switch mehr. `logout()` ist async und ruft `signOutAction()`. |
| [src/app/layout.tsx](../../src/app/layout.tsx) | Async Server Component; ruft `supabase.auth.getUser()` und reicht `authEmail` an `AppProvider` |
| [src/components/topbar.tsx](../../src/components/topbar.tsx) | User-Switch-Dropdown entfernt, Admin-Stub-Button entfernt, `Menu`-Button für mobile Sidebar |

### Seed & Scripts

| Datei | Zweck |
| --- | --- |
| [scripts/seed-auth-users.ts](../../scripts/seed-auth-users.ts) | Idempotentes Seeding: legt für die 5 Demo-User Auth-Konten an (Passwort `Demo1234!`) und verlinkt `users.auth_user_id` |
| [package.json](../../package.json) | Neuer Script `db:seed:auth` |

### UI Polish

| Datei | Zweck |
| --- | --- |
| [src/components/ui/toast.tsx](../../src/components/ui/toast.tsx) | `ToastProvider` + `useToast()` (success/error/info, auto-dismiss 5 s, ARIA `aria-live`) |
| [src/components/ui/feedback.tsx](../../src/components/ui/feedback.tsx) | `Skeleton`, `SkeletonRows`, `EmptyState` |
| [src/components/sidebar.tsx](../../src/components/sidebar.tsx) | Mobile-Drawer (`-translate-x-full md:translate-x-0` + Backdrop), Auto-Close beim Navigieren < md |
| [src/app/page.tsx](../../src/app/page.tsx) | Loading-State mit Skeleton, Connection-Error UI, Hint wenn Auth-User keinen `users`-Eintrag hat, i18n-Module-Titles |
| [src/components/modules/admin.tsx](../../src/components/modules/admin.tsx) | Statt "Neuer Benutzer" jetzt **User einladen** (`inviteUserAction`), neue **Deaktivieren/Aktivieren**-Buttons (`setUserActiveAction`), inaktive User mit Badge, Toasts für alle Aktionen |

### E2E

| Datei | Zweck |
| --- | --- |
| [tests/e2e/fixtures.ts](../../tests/e2e/fixtures.ts) | `loginAs(role)` füllt jetzt Email + Passwort (`Demo1234!`) statt Select-Dropdown |
| [tests/e2e/helpers/db.ts](../../tests/e2e/helpers/db.ts) | Whitelist-Guards (`PROTECTED_EMAIL_DOMAINS`, `PROTECTED_UUID_PREFIXES`) — Cleanup würde bei Demo-Daten **werfen** |

## Verifikation

```
npx tsc --noEmit         → 0 Fehler
npx eslint .             → 0 Fehler
npm run build            → 0 Fehler (Routes: /, /login, /auth/reset-password, /wamocon-app/[id], + Proxy)
```

E2E (`npx playwright test`) wurde **nicht ausgeführt**, weil die lokale Supabase-Instanz aktuell nicht läuft (`No such container: supabase_db_RELDA`). Die 9 Tests sind diskoverbar (`--list`) und auf das neue Auth-Login angepasst.

## Setup & Run (lokal)

```powershell
# 1) Supabase starten + DB resetten (lädt seed.sql + migrations)
npm run db:start
npm run db:reset

# 2) Auth-User für die 5 Demo-Konten anlegen
npm run db:seed:auth

# 3) App starten
npm run dev

# 4) Login
# admin@wamocon.de  / Demo1234!
# bob@wamocon.de    / Demo1234!     (Mentor)
# alice@wamocon.de  / Demo1234!     (Mentee)
# dana@wamocon.de   / Demo1234!
# erik@wamocon.de   / Demo1234!

# 5) E2E
npm run test:e2e
```

## Sicherheits-Hinweise (OWASP-relevant)

- **A01 Broken Access Control** — RLS-Policies neu geschrieben, alle Lese-Endpunkte erfordern `app_is_authenticated_user()`, Schreib-Endpunkte erfordern Admin oder Ownership.
- **A02 Crypto Failures** — Passwörter ausschließlich über `supabase.auth` (bcrypt-managed); `SUPABASE_SERVICE_ROLE_KEY` nur server-seitig (kein `NEXT_PUBLIC_`-Präfix).
- **A05 Misconfig** — Middleware deckt alle Routen außer Static-Assets ab; Auth-Routes (`/login`, `/auth/*`) sind die einzigen public.
- **A07 Auth Failures** — Self-Signup deaktiviert (Admin-Invite-only via Service-Role), `is_active=false` blockiert Login defensiv (Server Action) **und** ban-duration setzt User auf `auth`-Ebene gesperrt.
- **Soft-Delete** — `Demo1234!` ist nur für Demo. In Produktion via Invite-Flow setzen User ihr eigenes Passwort.

## Bekannte Einschränkungen / Follow-ups

- E2E-Tests sind angepasst, aber nicht durchgelaufen (Supabase-Container nicht aktiv im Dev-Setup).
- `NEXT_PUBLIC_APP_URL` muss in `.env.local` gesetzt sein, damit Reset-Links auf die korrekte Domain zeigen (sonst leerer Redirect).
- Toast-System ist Provider-basiert; bestehende `console.error`-Aufrufe in den Modulen wurden **nicht** flächendeckend ersetzt (nur in `admin.tsx` für die neuen Auth-Actions). Bei Bedarf in Folge-Phase nachziehen.
