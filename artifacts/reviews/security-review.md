# Security review

- status: no high findings
- task id: SR-001
- files read: `docs/architecture.md`, `docs/scope.md`, `.cursor/skills/acceptance-verification/SKILL.md`, `package.json`, `package-lock.json` (root dependencies, `next`, `sharp`, `vitest`, `vite`, and `fsevents`), `src/types/domain.ts`, `src/lib/match/normalize.ts`, `src/lib/match/score.ts`, `src/lib/data/load.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `src/app/api/respond.ts`, `src/app/api/candidates/route.ts`, `src/app/api/jobs/route.ts`, `src/app/api/matches/route.ts`, `data/candidates.json`, `data/jobs.json`, `next.config.ts`, `playwright.config.ts`, `.gitignore`

## Findings

none

## Empty severities

- high: none
- medium: none
- low: none

## Notes

No high finding is open. This review does not assign AC-13 or AC-14; those still need a run that produces command evidence.

Direct dependencies in `package.json` and the lockfile root match the approved set and versions. Lockfile tarball URLs point at `registry.npmjs.org`. `sharp` is an optional dependency of `next`. `vite` is an optional peer of `vitest`. The only `hasInstallScript` entry is optional, Darwin-only `fsevents` 2.3.3, pulled in by `vite`. No `.env` file is present, and `.gitignore` ignores `.env`, `.env.*`, and `.vercel`.

Application fetches in `src/app/page.tsx` use `/api/candidates`, `/api/jobs`, and `/api/matches`. `next.config.ts` is empty. Scoring arithmetic is only in `src/lib/match/score.ts`. The page checks the served `formula` object against `SKILL_WEIGHT`, `EXPERIENCE_WEIGHT`, and `SCORE_SCALE`, then renders the API score strings as text. There is no `dangerouslySetInnerHTML`.

`src/lib/data/load.ts` reads only `data/candidates.json` and `data/jobs.json` under `process.cwd()`. Query ids are filtered in memory after `^[a-z0-9-]{1,64}$`. Seed and request failures return `Seed data is invalid` / `seed_invalid` or `Bad request` / `bad_request`, without the caught exception. A 404 may include a well-formed id, which the architecture allows. The seed names are the approved fictional profiles. The app has no authentication and no database, which matches the approved local JSON design.
