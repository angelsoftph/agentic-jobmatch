# QA report

- status: pass
- task id: QA-003
- snapshot: not taken
- product files changed by QA: none

`npm test` and `npm run test:e2e` both completed with exit code 0. No TRACE request was sent. `tests/e2e/api.spec.ts` was not edited. `playwright.config.ts` was not edited. The process on port 3000 was not stopped. The QA-001 attempt 2 TRACE failure in `artifacts/failures/QA-001-attempt-2.md` was not edited and is not a pass.

## Commands

- `npm test`: pass
- exit code: 0
- pass count: Test Files 2 passed (2); Tests 19 passed (19)
- fail count: no failed test was printed
- observed summary: "Test Files  2 passed (2)" and "Tests  19 passed (19)". Start at 20:19:27. Duration 165ms. Vitest also printed the `configLoader: 'native'` warning for ESM syntax in `vitest.config.ts`.

```
> jobmatch@0.1.0 test
> vitest run

(!) Your Vite config uses features that are unsupported by `configLoader: 'native'`, which is planned to become the default in a future major version of Vite:
  - ESM syntax in a file loaded as CommonJS (vitest.config.ts:1:1). Use a `.mjs` extension or set `"type": "module"` in the closest package.json
Set `VITE_CONFIG_NATIVE_IGNORE_WARNING=true` to suppress this warning.

 RUN  v5.1.0 C:/Projects/cybergirls/jobmatch


 Test Files  2 passed (2)
      Tests  19 passed (19)
   Start at  20:19:27
   Duration  165ms (import 39%, transform 24%, tests 24%, worker 13%)
```

- `npm run test:e2e`: pass
- exit code: 0
- pass count: 19 passed
- fail count: no failed test was printed. Playwright wrote `test-results/.last-run.json` with `"status": "passed"` and `"failedTests": []`.
- observed summary: "Running 19 tests using 5 workers" and "19 passed (6.2s)". The shell reported the whole command completed in 11269 ms. The captured stdout did not print the Next.js build log. The config read before the run, and left unchanged, is `retries: 0`, base URL `http://127.0.0.1:3210`, `reuseExistingServer: false`, and `npm run build && npx next start -p 3210`.

```
> jobmatch@0.1.0 test:e2e
> playwright test


Running 19 tests using 5 workers

(node:28324) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:59888) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:58964) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:56032) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:62644) Warning: The 'NO_COLOR' env is ignored due to the 'FORCE_COLOR' env being set.
(Use `node --trace-warnings ...` to show where the warning was created)
  ok  5 tests\e2e\api.spec.ts:79:3 › AC-02 candidates and jobs › GET /api/candidates returns the three seed records (55ms)
  ok  6 tests\e2e\api.spec.ts:85:3 › AC-02 candidates and jobs › GET /api/jobs returns the three seed records (24ms)
  ok  7 tests\e2e\api.spec.ts:93:3 › AC-03 matches › GET /api/matches returns nine pairs in fixture order (25ms)
  ok  8 tests\e2e\api.spec.ts:117:3 › AC-08 query errors and methods › an unknown query key returns 400 bad_request (21ms)
  ok  9 tests\e2e\api.spec.ts:122:3 › AC-08 query errors and methods › an empty query value returns 400 bad_request (25ms)
  ok 10 tests\e2e\api.spec.ts:127:3 › AC-08 query errors and methods › a malformed id returns 400 bad_request without echoing the value (21ms)
  ok 11 tests\e2e\api.spec.ts:137:3 › AC-08 query errors and methods › a well-formed unknown candidate id returns 404 not_found (24ms)
  ok 12 tests\e2e\api.spec.ts:148:3 › AC-08 query errors and methods › a well-formed unknown job id returns 404 not_found (11ms)
  ok 13 tests\e2e\api.spec.ts:154:3 › AC-08 query errors and methods › unknown candidate and job ids return 404 naming both (17ms)
  ok 14 tests\e2e\api.spec.ts:165:3 › AC-08 query errors and methods › HEAD /api/candidates returns 200 with an empty body (10ms)
  ok  2 tests\qa\request-failed.spec.ts:3:1 › shows Request failed when the matches response has no JSON code (283ms)
  ok 15 tests\e2e\api.spec.ts:171:3 › AC-08 query errors and methods › OPTIONS /api/matches returns 204 and Allow (8ms)
  ok  3 tests\e2e\matches.spec.ts:6:1 › shows the disclaimer and nine match rows (287ms)
  ok 16 tests\e2e\api.spec.ts:179:5 › AC-08 query errors and methods › POST /api/matches returns 405 with an empty body (8ms)
  ok 17 tests\e2e\api.spec.ts:179:5 › AC-08 query errors and methods › PUT /api/matches returns 405 with an empty body (8ms)
  ok  4 tests\e2e\error-retry.spec.ts:3:1 › shows seed_invalid and loads nine rows after Try again (328ms)
  ok 18 tests\e2e\api.spec.ts:179:5 › AC-08 query errors and methods › PATCH /api/matches returns 405 with an empty body (8ms)
  ok 19 tests\e2e\api.spec.ts:179:5 › AC-08 query errors and methods › DELETE /api/matches returns 405 with an empty body (7ms)
  ok  1 tests\qa\match-display.spec.ts:13:1 › shows API skill, experience, label, and missing skills on each row (441ms)

  19 passed (6.2s)
```

## Acceptance

- AC-01: pass — `data/candidates.json` and `data/jobs.json` were compared with the seed in `docs/architecture.md`. Each file has the three fixture records and the same ids, names, skills, and year values. No extra records.
- AC-02: pass — `tests/e2e/api.spec.ts` GET `/api/candidates` and GET `/api/jobs` both printed `ok` in the Playwright run above.
- AC-03: pass — `GET /api/matches returns nine pairs in fixture order` printed `ok`.
- AC-04: pass — `tests/unit/score.test.ts` describes `AC-04 fixture basis integers and strings`, and `npm test` passed 19 tests in 2 files, including that file.
- AC-05: pass — the same Vitest run includes `AC-05 skill normalization` (normalization, duplicates, extra skills, and `Node.js` versus `nodejs`).
- AC-06: pass — the same Vitest run includes `AC-06 experience` (at the minimum, above the minimum, below the minimum, and minimum 0).
- AC-07: pass — the same Vitest run includes `AC-07 divRoundHalfUp` for `divRoundHalfUp(4, 2)`, `divRoundHalfUp(5, 2)`, `divRoundHalfUp(1, 2)`, `divRoundHalfUp(10000, 3)`, and `divRoundHalfUp(20000, 3)`.
- AC-08: pass — the Playwright run printed `ok` for unknown-id 404 `not_found`, empty and malformed ids and an unknown query key 400 `bad_request`, HEAD 200 with an empty body, OPTIONS 204 and Allow, and POST, PUT, PATCH, and DELETE 405 with an empty body. The spec does not send TRACE. TRACE was not added and was not requested.
- AC-09: pass — `tests/unit/load.test.ts` describes duplicate id, non-integer year, and empty required skills with `seed_invalid`. `tests/unit/score.test.ts` describes `AC-09 scorer inputs`. Both files are in the Vitest run that passed.
- AC-10: pass — `tests/e2e/matches.spec.ts` printed `ok` for the disclaimer, nine rows, and `100.00` for Ada Okonkwo / Full Stack Engineer and Mina Chen / Data Analyst. `tests/qa/match-display.spec.ts` printed `ok` for skill, experience, label, and missing skills on each API row.
- AC-11: pass — `tests/qa/match-display.spec.ts` compares the visible overall, skill, and experience cells with the strings from `GET /api/matches`, and that test printed `ok`. The page renders `match.overall`, `match.skill`, and `match.experience` from that response.
- AC-12: pass — `tests/e2e/error-retry.spec.ts` printed `ok` for `seed_invalid`, the `Try again` click, and nine rows. `tests/qa/request-failed.spec.ts` printed `ok` for `Request failed` and the same button when the response has no JSON code.
- AC-13: pass — `src` has no `http://` or `https://` URL. Page fetches use `/api/candidates`, `/api/jobs`, and `/api/matches` only. Direct dependencies in `package.json` and the lockfile root are `next` 16.4.6, `react` 19.3.1, `react-dom` 19.3.1, `typescript` 5.9.3, `@types/node` 22.20.5, `@types/react` 19.3.0, `@types/react-dom` 19.3.0, `vitest` 5.1.0, and `@playwright/test` 1.65.0.
- AC-14: pass — no `.env` file was found. `src` and `data` have no email address and no credential-shaped secret. Seed names are the fictional fixture labels.
- AC-15: pass — the Vitest and Playwright commands above were run and are quoted, with the observed pass counts. Vitest covers AC-04 through AC-07 and AC-09. `tests/e2e/api.spec.ts` covers AC-02, AC-03, and AC-08. `tests/e2e/matches.spec.ts` covers the two `100.00` pairs and the 9-row result. `tests/e2e/error-retry.spec.ts` covers the retry click. The unchanged Playwright config uses `retries: 0`, base URL `http://127.0.0.1:3210`, `reuseExistingServer: false`, and `next start` after a build. The planning text names port 3000. This run used the configured port 3210. That port difference is not a failure.
- AC-16: unassigned — orchestrator evaluates this after both reports
- AC-17: unassigned — preview is a later gate

## Defects

- none for AC-01 through AC-15 in this run
- TRACE was not sent. The failure in `artifacts/failures/QA-001-attempt-2.md` remains a failure and is outside AC-08 under D-015. It was not described as a pass.
