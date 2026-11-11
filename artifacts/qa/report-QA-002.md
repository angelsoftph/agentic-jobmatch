# QA report

- status: blocked
- task id: QA-002
- snapshot: not taken
- product files changed by QA: none

`npm test` completed. `npm run test:e2e` was not started. Port 3000 was already listening for another application. The port was not changed, `reuseExistingServer` was not set, and that process was not stopped. No TRACE request was added. `tests/e2e/api.spec.ts` was not edited. The QA-001 attempt 2 TRACE failure in `artifacts/failures/QA-001-attempt-2.md` and `artifacts/qa/report-QA-001-attempt-2.md` was not edited and is not a pass.

## Commands

- `npm test`: pass
- exit code: 0
- observed summary: "Test Files  2 passed (2)" and "Tests  19 passed (19)". Start at 20:16:31. Duration 164ms. The output did not list a failing test. Vitest also printed the `configLoader: 'native'` warning for ESM syntax in `vitest.config.ts`.

```
> jobmatch@0.1.0 test
> vitest run

(!) Your Vite config uses features that are unsupported by `configLoader: 'native'`, which is planned to become the default in a future major version of Vite:
  - ESM syntax in a file loaded as CommonJS (vitest.config.ts:1:1). Use a `.mjs` extension or set `"type": "module"` in the closest package.json
Set `VITE_CONFIG_NATIVE_IGNORE_WARNING=true` to suppress this warning.

 RUN  v5.1.0 C:/Projects/cybergirls/jobmatch


 Test Files  2 passed (2)
      Tests  19 passed (19)
   Start at  20:16:31
   Duration  164ms (import 38%, transform 24%, tests 23%, worker 14%)
```

- `npm run test:e2e`: not run
- exit code: not observed
- pass count: not observed
- fail count: not observed
- observed summary: "LocalPort : 3000" "State : Listen" "OwningProcess : 40832". A local GET of `http://127.0.0.1:3000/` returned status 200 and `X-Powered-By: Next.js`. The HTML referenced `app_compendium_strategies`, which is not this jobmatch app. That GET was an identity check of the listener. It is not an acceptance result.

Port check:

```
LocalAddress  : ::
LocalPort     : 3000
State         : Listen
OwningProcess : 40832

LocalAddress  : 127.0.0.1
LocalPort     : 3000
State         : Established
OwningProcess : 40832
```

Process 40832 is `node.exe`, started 11/11/2026 7:45:08 PM. Parent chain observed: 40832 `node.exe`, parent 62924 `node.exe`, parent 56544 `cmd.exe`.

`playwright.config.ts` still has `retries: 0`, base URL `http://127.0.0.1:3000`, `reuseExistingServer: false`, and `npm run build && npx next start -p 3000`. Those settings were not changed.

## Acceptance

- AC-01: pass — `data/candidates.json` and `data/jobs.json` were compared with the seed in `docs/architecture.md`. Each file has the three fixture records and the same ids, names, skills, and year values. No extra records.
- AC-02: not run — `tests/e2e/api.spec.ts` covers this id. `npm run test:e2e` was not started because port 3000 was in use.
- AC-03: not run — same e2e spec and the same port conflict.
- AC-04: pass — `tests/unit/score.test.ts` describes `AC-04 fixture basis integers and strings`, and `npm test` passed 19 tests in 2 files, including that file.
- AC-05: pass — the same Vitest run includes `AC-05 skill normalization` (normalization, duplicates, extra skills, and `Node.js` versus `nodejs`).
- AC-06: pass — the same Vitest run includes `AC-06 experience` (at the minimum, above the minimum, below the minimum, and minimum 0).
- AC-07: pass — the same Vitest run includes `AC-07 divRoundHalfUp` for `divRoundHalfUp(4, 2)`, `divRoundHalfUp(5, 2)`, `divRoundHalfUp(1, 2)`, `divRoundHalfUp(10000, 3)`, and `divRoundHalfUp(20000, 3)`.
- AC-08: not run — `tests/e2e/api.spec.ts` covers unknown-id 404, malformed and unknown query keys 400, HEAD, OPTIONS, and POST, PUT, PATCH, and DELETE. It does not send TRACE. The spec was not executed.
- AC-09: pass — `tests/unit/load.test.ts` describes duplicate id, non-integer year, and empty required skills with `seed_invalid`. `tests/unit/score.test.ts` describes `AC-09 scorer inputs`. Both files are in the Vitest run that passed.
- AC-10: not run — `tests/e2e/matches.spec.ts` and `tests/qa/match-display.spec.ts` were not executed.
- AC-11: not run — `tests/qa/match-display.spec.ts` compares displayed overall, skill, and experience text with the API strings. It was not executed.
- AC-12: not run — `tests/e2e/error-retry.spec.ts` and `tests/qa/request-failed.spec.ts` were not executed.
- AC-13: pass — `src` has no `http://` or `https://` URL. Page fetches use `/api/candidates`, `/api/jobs`, and `/api/matches` only. Direct dependencies in `package.json` are `next`, `react`, `react-dom`, `typescript`, `@types/node`, `@types/react`, `@types/react-dom`, `vitest`, and `@playwright/test`. `package-lock.json` is present.
- AC-14: pass — no `.env` file was found. `src` and `data` have no email address and no credential-shaped secret. Seed names are the fictional fixture labels.
- AC-15: not run — Vitest output is quoted above. Playwright output does not exist for this run. `retries` in the unread-changed config are 0, and the base URL is `http://127.0.0.1:3000`.
- AC-16: unassigned — orchestrator evaluates this after both reports
- AC-17: unassigned — preview is a later gate

## Defects

- PORT-3000, blocks AC-02, AC-03, AC-08, AC-10, AC-11, AC-12, and AC-15. Port 3000 was already held by node.exe PID 40832 serving a different Next.js app (`app_compendium_strategies`). Expected a free port 3000 so Playwright could run `next start -p 3000`. The e2e command was not started. No product assertion failed in this run.
