# QA remediation report

- status: pass
- task id: QA-004
- snapshot: not taken
- product files changed by QA: none
- files written: `artifacts/qa/report-remediation.md`, `artifacts/handoffs/QA-004.md`
- `artifacts/qa/report.md` was not edited

This run executed the current suite. Counts below are the summaries printed by these commands. Playwright used `playwright.config.ts` as it stands: `retries: 0`, base URL `http://127.0.0.1:3210`, webServer `npm run build && npx next start -p 3210`, `reuseExistingServer: false`. The port was not changed and no other process was stopped.

## Commands

- `npm test`: pass
- exit code: 0
- observed summary: "Test Files  2 passed (2)" and "Tests  19 passed (19)". Start at 22:15:30. Duration 157ms. Vitest v5.1.0. The shell completed in 4714 ms. No failing test was printed. A Vite config-loader warning for `vitest.config.ts` was printed and the command still exited 0.

- `npx tsc --noEmit`: pass
- exit code: 0
- observed summary: tsc printed no diagnostics. `LASTEXITCODE` was 0. The shell completed in 5753 ms.

- `npm run build`: pass
- exit code: 0
- observed summary: "✓ Compiled successfully in 164ms". "Finished TypeScript in 1367ms". "✓ Generating static pages using 7 workers (6/6) in 538ms". Routes: `/`, `/_not-found`, `/api/candidates`, `/api/jobs`, `/api/matches`. Next.js 16.4.6 (Turbopack). The log also printed "Environments: .env.local". The shell completed in 7998 ms.

- `npm run test:e2e`: pass
- exit code: 0
- observed summary: "Running 24 tests using 5 workers" and "24 passed (6.4s)". No failed test was printed. The shell completed in 11157 ms. `test-results/.last-run.json` says `"status": "passed"` and `"failedTests": []`. The captured stdout did not include the Next.js build log from the Playwright webServer command. Workers printed `NO_COLOR` / `FORCE_COLOR` warnings. Those warnings did not fail the run.

Playwright tests that printed `ok` in this run, 24 passed and 0 failed:

- `tests/e2e/api.spec.ts` GET `/api/candidates` returns the three seed records
- `tests/e2e/api.spec.ts` GET `/api/jobs` returns the three seed records
- `tests/e2e/api.spec.ts` GET `/api/matches` returns nine pairs in fixture order
- `tests/e2e/api.spec.ts` GET `/api/matches?candidateId=cand-ada-okonkwo` returns Ada's three matches
- `tests/e2e/api.spec.ts` GET `/api/matches?jobId=job-data-analyst` returns that job's three matches
- `tests/e2e/api.spec.ts` GET `/api/matches` with both ids returns the single pair
- `tests/e2e/api.spec.ts` unknown query key returns 400 `bad_request`
- `tests/e2e/api.spec.ts` empty query value returns 400 `bad_request`
- `tests/e2e/api.spec.ts` malformed id returns 400 `bad_request` without echoing the value
- `tests/e2e/api.spec.ts` well-formed unknown candidate id returns 404 `not_found`
- `tests/e2e/api.spec.ts` well-formed unknown job id returns 404 `not_found`
- `tests/e2e/api.spec.ts` unknown candidate and job ids return 404 naming both
- `tests/e2e/api.spec.ts` HEAD `/api/candidates` returns 200 with an empty body
- `tests/e2e/api.spec.ts` OPTIONS `/api/matches` returns 204 and Allow
- `tests/e2e/api.spec.ts` POST, PUT, PATCH, and DELETE `/api/matches` return 405 with an empty body
- `tests/e2e/api.spec.ts` PROPFIND `/api/matches` returns 400
- `tests/e2e/matches.spec.ts` shows the disclaimer and nine match rows
- `tests/e2e/matches.spec.ts` filters matches from the candidate and job selects
- `tests/e2e/error-retry.spec.ts` shows `seed_invalid` and loads nine rows after Try again
- `tests/qa/request-failed.spec.ts` shows Request failed when the matches response has no JSON code
- `tests/qa/match-display.spec.ts` shows API skill, experience, label, and missing skills on each row

## TRACE

This run did not send TRACE. `tests/e2e/api.spec.ts` has no TRACE request. The Playwright list above has no TRACE line.

`artifacts/failures/QA-001-attempt-2.md` stays a failed attempt. That file records `npm run test:e2e` exit 1, 19 of 20 Playwright tests passed, and `TRACE /api/matches` expected 400 and received 500, with the server log `TypeError: 'TRACE' HTTP method is unsupported.` This report does not treat that file as a pass. `docs/architecture.md` section "Known framework limitation: TRACE" and D-015 say that result is outside the acceptance suite. The passing PROPFIND test in this run asserts HTTP 400 and an empty body. That pass leaves the TRACE failure record unchanged.

## Acceptance

- AC-01: pass — `npm test` exit 0 includes `tests/unit/load.test.ts` "loads the approved seed files", which expects the three candidate ids, the three job ids, candidate years 6, and job minimum years 4. Playwright `GET /api/candidates` and `GET /api/jobs` passed and expect the full seed records, including names, skills, and years.
- AC-02: pass — Playwright `GET /api/candidates` and `GET /api/jobs` both `ok`.
- AC-03: pass — Playwright `GET /api/matches` returns nine pairs in fixture order `ok`. The three filter tests also passed: Ada's three matches, the Data Analyst three matches, and the single Ada / Data Analyst pair at `30.00`.
- AC-04: pass — `npm test` exit 0, 19 passed, includes the `AC-04 fixture basis integers and strings` tests in `tests/unit/score.test.ts`.
- AC-05: pass — the same Vitest run includes the `AC-05 skill normalization` tests.
- AC-06: pass — the same Vitest run includes the `AC-06 experience` tests.
- AC-07: pass — the same Vitest run includes the `AC-07 divRoundHalfUp` tests.
- AC-08: pass — Playwright passed unknown query key, empty value, and malformed id as 400 `bad_request`; unknown candidate, unknown job, and both unknown as 404 `not_found`; HEAD 200 with an empty body; OPTIONS 204 and Allow; POST, PUT, PATCH, and DELETE 405 with an empty body. TRACE is outside this acceptance id and was not sent.
- AC-09: pass — the Vitest run includes the `AC-09 loader` and `AC-09 scorer inputs` tests.
- AC-10: pass — `shows the disclaimer and nine match rows` passed, including the two `100.00` pairs. `shows API skill, experience, label, and missing skills on each row` passed. The select filter test also passed.
- AC-11: pass — `tests/qa/match-display.spec.ts` passed and compares each displayed cell with the `/api/matches` JSON strings. `src/app/page.tsx` renders `match.overall`, `match.skill`, `match.experience`, `match.label`, and `match.missingSkills`. Score arithmetic is in `src/lib/match/score.ts`.
- AC-12: pass — `tests/e2e/error-retry.spec.ts` passed: `seed_invalid`, the Try again button, and nine rows after the click. `tests/qa/request-failed.spec.ts` passed: the text `Request failed` and the same button when the response has no JSON code.
- AC-13: pass — `package.json` and the lockfile root package list the direct dependencies `next` 16.4.6, `react` 19.3.1, `react-dom` 19.3.1, `typescript` 5.9.3, `@types/node` 22.20.5, `@types/react` 19.3.0, `@types/react-dom` 19.3.0, `vitest` 5.1.0, and `@playwright/test` 1.65.0. `src/app/page.tsx` fetches `/api/candidates`, `/api/jobs`, and the matches path on the same origin.
- AC-14: pass — a search of tracked project text for credential-shaped tokens hit policy wording in docs and prompts, not a stored credential. Seed names exercised by the passing API tests are the fictional fixture. `npm run build` printed `Environments: .env.local`. `.gitignore` ignores `.env*`. `git status --short` after the four commands did not list that file. Its contents were not read.
- AC-15: pass — this report quotes `npm test` and `npm run test:e2e` from this run. Vitest covers AC-04 through AC-07 and AC-09. `tests/e2e/api.spec.ts` covers AC-02, AC-03, and AC-08. `tests/e2e/matches.spec.ts` covers the disclaimer, nine rows, and the two `100.00` pairs. `tests/e2e/error-retry.spec.ts` covers the retry click.
- AC-16: unassigned — orchestrator evaluates this after both reports
- AC-17: unassigned — preview is a later gate

## Defects

- none in this run

## Files outside the write list changed by this run

- none

`git status --short` after the four commands and before these two writes listed dirty paths this run did not edit: `README.md`, `docs/architecture.md`, `tests/e2e/api.spec.ts`, `tests/e2e/matches.spec.ts`, plus untracked `artifacts/handoffs/BE-002.md`, `artifacts/handoffs/FE-002.md`, `prompts/delegations/BE-002.md`, `prompts/delegations/FE-002.md`, `prompts/delegations/QA-004.md`, `prompts/delegations/SR-002.md`, `prompts/g4-approval.md`, and `prompts/publication-approval.md`.

Command side effects under gitignored paths: `npm run build` refreshed `.next/**`. Playwright wrote `test-results/.last-run.json`.
