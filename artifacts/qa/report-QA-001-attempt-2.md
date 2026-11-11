# QA report

- status: fail
- task id: QA-001
- snapshot: not taken
- product files changed by QA: none

## Commands

- `npm test`: pass
- observed summary: "Exit code 0. Vitest v5.1.0: Test Files 2 passed (2). Tests 19 passed (19). Start at 19:20:35. Duration 201ms. Vite printed a configLoader warning that vitest.config.ts is ESM loaded as CommonJS. The tests still passed."
- `npm run test:e2e`: fail
- observed summary: "Exit code 1. playwright test ran 20 tests using 5 workers. 19 passed (8.6s). 1 failed: tests/e2e/api.spec.ts:188:3 TRACE /api/matches returns the installed status for an unknown method. Expected status 400. Received status 500. The web server logged TypeError: 'TRACE' HTTP method is unsupported. The empty-body assertion on that response did not run."

`playwright.config.ts` was left as the orchestrator set it for this attempt: `retries` 0, base URL `http://127.0.0.1:3210`, `reuseExistingServer: false`, web server command `npm run build && npx next start -p 3210`. The suite reached the specs, so that server accepted connections. No process on port 3000 was stopped. The command was not rerun: the TRACE status is the installed server result, and the same assertion would fail again.

## Acceptance

- AC-01: pass — Compared `data/candidates.json` and `data/jobs.json` in this run with the seed in `docs/architecture.md`. Each file has exactly the three fixture records, with the same ids, names, skills, and year values.
- AC-02: pass — `npm run test:e2e` passed `GET /api/candidates returns the three seed records` and `GET /api/jobs returns the three seed records` in `tests/e2e/api.spec.ts`.
- AC-03: pass — The same run passed `GET /api/matches returns nine pairs in fixture order`, which requires 200, nine pairs, and formula weights 70 and 30.
- AC-04: pass — `npm test` passed 19 tests. `tests/unit/score.test.ts` describe "AC-04 fixture basis integers and strings" asserts `skillBasis`, `experienceBasis`, `overallBasis`, and the formatted strings for every fixture row. That file is in the suite that passed.
- AC-05: pass — The same passing Vitest run includes "AC-05 skill normalization": trim and ASCII case folding, duplicates counted once, extra skills not raising the score, and `Node.js` not matching `nodejs` or `node`.
- AC-06: pass — The same passing Vitest run includes "AC-06 experience": full experience at and above the minimum, proportional experience below the minimum, and a minimum of 0 scoring the full experience component.
- AC-07: pass — The same passing Vitest run includes "AC-07 divRoundHalfUp": `divRoundHalfUp(4, 2)` is 2, `divRoundHalfUp(5, 2)` is 3, `divRoundHalfUp(1, 2)` is 1, `divRoundHalfUp(10000, 3)` is 3333, and `divRoundHalfUp(20000, 3)` is 6667.
- AC-08: fail — The API spec ran against this app on `http://127.0.0.1:3210`. These checks passed: unknown query key 400 `bad_request`; empty query value 400; malformed id 400 without echoing the value; unknown candidate id 404 `not_found`; unknown job id 404; both unknown ids 404 naming both; `HEAD /api/candidates` 200 with an empty body; `OPTIONS /api/matches` 204 and `Allow: GET, HEAD, OPTIONS`; `POST`, `PUT`, `PATCH`, and `DELETE` 405 with an empty body. `TRACE /api/matches` returned 500. The spec expected 400. The server logged `TypeError: 'TRACE' HTTP method is unsupported.`
- AC-09: pass — The same passing Vitest run includes `tests/unit/load.test.ts` rejecting a duplicate id, a non-integer year, and an empty required-skill list with code `seed_invalid`, and `tests/unit/score.test.ts` asserting `score.ts` and `normalize.ts` do not reference `Date`, `Math.random`, `fetch`, or Node network modules.
- AC-10: pass — `tests/e2e/matches.spec.ts` passed: disclaimer, 9 match rows, and `100.00` for Ada Okonkwo / Full Stack Engineer and Mina Chen / Data Analyst. `tests/qa/match-display.spec.ts` passed: each row's skill, experience, label, and missing-skills text equals those fields from `GET /api/matches`, including at least one row whose missing-skills list is non-empty.
- AC-11: pass — `tests/qa/match-display.spec.ts` passed. It reads `GET /api/matches` and checks that each visible overall, skill, and experience cell equals that response's `overall`, `skill`, and `experience` strings. The spec does not recompute a score.
- AC-12: pass — `tests/e2e/error-retry.spec.ts` passed: `seed_invalid`, `Try again`, then 9 match rows. `tests/qa/request-failed.spec.ts` passed: a 500 text body with no JSON `code` shows `Request failed` and the `Try again` button.
- AC-13: pass — Application fetches in `src/app/page.tsx` are only `/api/candidates`, `/api/jobs`, and `/api/matches`. No `https://` URL or `process.env` use appears under `src/`. `src/lib/data/load.ts` reads only `data/candidates.json` and `data/jobs.json` from the process working directory. `next.config.ts` is empty. `globals.css` uses system fonts and no remote URL. Direct dependencies in `package.json` and the lockfile root are `next` 16.4.6, `react` 19.3.1, `react-dom` 19.3.1, `typescript` 5.9.3, `@types/node` 22.20.5, `@types/react` 19.3.0, `@types/react-dom` 19.3.0, `vitest` 5.1.0, and `@playwright/test` 1.65.0. The lockfile also records the transitive packages from that install.
- AC-14: pass — No `.env` file is present. Project TypeScript, JSON, CSS, and markdown have no email addresses and no credential-shaped secrets. The only people named in the seed are the fictional fixture labels. Documentation mentions of "token usage" are log fields, not credentials.
- AC-15: pass — Both commands ran in this attempt and the summaries above quote their output. Vitest covers the unit ids. Playwright ran `tests/e2e/api.spec.ts`, `tests/e2e/matches.spec.ts`, `tests/e2e/error-retry.spec.ts`, and the two `tests/qa` specs with `retries: 0` against `next start` on `http://127.0.0.1:3210`. The acceptance text still names port 3000. This attempt used 3210 because that is the server URL in the current Playwright config.
- AC-16: unassigned — orchestrator evaluates this after both reports
- AC-17: unassigned — preview is a later gate

## Defects

- QA-001-trace, AC-08: `TRACE /api/matches` returned 500. The web server logged `TypeError: 'TRACE' HTTP method is unsupported.` The spec expected 400 and an empty body. The contract says to stop and report a status other than 400 for a method token outside `GET`, `HEAD`, `OPTIONS`, `POST`, `PUT`, `DELETE`, and `PATCH`. No route handler was added and the assertion was not changed.
