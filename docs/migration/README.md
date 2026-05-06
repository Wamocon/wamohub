# RELDA Migration Docs

Stand: 2026-04-07

Dieses Verzeichnis fuehrt den fachlichen und technischen Migrationskontext der RELDA-Ueberfuehrung in das Ziel-Repository `Wamocon/relda` zusammen.

Enthalten:

- `DOKUMENTATION_IST-STAND.md`
  Vollstaendige Analyse des urspruenglichen SIT-Frontends in `D:\Testprojekt\RELDA`.
- `UMBAUPLAN_L99_SOFTWAREARCHITEKT_RELDA.md`
  Architektur- und Phasenplan fuer die Migration auf Next.js 16, TypeScript, Tailwind v4, Supabase und Vercel.

Status im Ziel-Repository:

- Phase 1 (UI-/State-Migration) ist im Branch `feature/relda-migration` umgesetzt.
- Typecheck und Lint laufen erfolgreich.
- Der Dev-Server startet erfolgreich mit Next.js 16.

Naechste sinnvolle Schritte:

1. Supabase Auth integrieren.
2. Domainedaten von In-Memory auf persistente Tabellen umstellen.
3. RLS-Policies und serverseitige Zugriffskontrolle einfuehren.
4. Danach per Pull Request in `main` ueberfuehren.
