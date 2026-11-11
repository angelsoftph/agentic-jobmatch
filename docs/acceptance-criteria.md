# Acceptance criteria

Ids AC-01 through AC-17 match `docs/scope.md`. Behavior matches `docs/requirements.md` and `docs/architecture.md`. QA verifies AC-01 through AC-15. The orchestrator evaluates AC-16. AC-17 is the preview gate.

No id is passed in the table below. No test was run while writing this file. `not run` means the satisfying evidence had not been observed when the table was written. `unassigned` means this id is not QA's to pass.

A later pass needs evidence from the current run. The fixture numbers in `docs/architecture.md` are expected values, not test output. Code inspection can support a failure. It does not by itself pass a behavior id.

Executed results are recorded elsewhere and do not change this table. QA-003 is in `artifacts/qa/report.md`. The preview checks are in `artifacts/qa/preview-check.md`. The original TRACE failure remains in `artifacts/failures/QA-001-attempt-2.md` and is not a pass.

| ID | Behavior | Evidence that would satisfy it | Result |
| --- | --- | --- | --- |
| AC-01 | Seed JSON contains exactly the three candidates and three jobs in the architecture fixture, with those ids, names, skills, and year values. | File comparison of `data/candidates.json` and `data/jobs.json` to the seed in `docs/architecture.md`. | not run |
| AC-02 | `GET /api/candidates` returns those candidates. `GET /api/jobs` returns those jobs. | API response from `tests/e2e/api.spec.ts` against the running server: 200 and the three seed records on each route. | not run |
| AC-03 | `GET /api/matches` returns all 9 pairs in the architecture sort order. | API response from `tests/e2e/api.spec.ts`: 200, nine pairs in fixture order, and formula weights 70 and 30. | not run |
| AC-04 | Each pair's basis integers and two-decimal strings equal the fixture table. | Unit test in `tests/unit/score.test.ts` asserting `skillBasis`, `experienceBasis`, `overallBasis`, and the formatted strings for every fixture row. | not run |
| AC-05 | Skill credit is exact equality after the documented normalization. Extra skills do not raise the score. Duplicates count once. `Node.js` does not match `nodejs`. | Unit test in `tests/unit/score.test.ts` for normalization, duplicates, extra skills, and `Node.js` versus `nodejs`. | not run |
| AC-06 | Experience at or above the minimum scores the full experience component. Experience above the minimum adds nothing. Experience below the minimum is proportional. A minimum of 0 scores the full experience component. | Unit test in `tests/unit/score.test.ts` for experience above the minimum and for minimum years of 0, using `divRoundHalfUp` as specified. | not run |
| AC-07 | Rounding follows `divRoundHalfUp` for non-negative integers, including exact division, below-half, exact-half, and above-half cases on the helper. | Unit test of the helper results named in `docs/architecture.md`: `divRoundHalfUp(5, 2)` is 3, `divRoundHalfUp(1, 2)` is 1, and `divRoundHalfUp(4, 2)` is 2. Below-half `3333` and above-half `6667` are the same helper on the fixture inputs `divRoundHalfUp(10000, 3)` and `divRoundHalfUp(20000, 3)`. | not run |
| AC-08 | A well-formed unknown id returns 404 `not_found`. A malformed id or unknown query key returns 400 `bad_request`. Those bodies have `error` and `code` and omit stacks and filesystem paths. With only `GET` exported, the running server returns `HEAD` with the GET status and an empty body, `OPTIONS` 204 and `Allow: GET, HEAD, OPTIONS`, and `POST`, `PUT`, `PATCH`, and `DELETE` 405 with an empty body and no `code`. `TRACE` is not part of this id. | API response from `tests/e2e/api.spec.ts` against the running server. See the method note below. Calling `GET` from a unit test does not satisfy this id. | not run |
| AC-09 | Invalid seed data fails the loader with a structured error. The scorer does not read the clock, random values, or the network. | Unit test in `tests/unit/load.test.ts` for a duplicate id, a non-integer year, and an empty required-skill list, expecting code `seed_invalid`. Scorer unit tests supply the inputs and do not use a clock, random source, or network. | not run |
| AC-10 | The page shows the fictional-data disclaimer, lists the matches returned by the API, and shows overall, skill, experience, label, and missing skills. | Browser check in `tests/e2e/matches.spec.ts`: open `/`, see the disclaimer, see 9 match rows, and see `100.00` for Ada Okonkwo / Full Stack Engineer and for Mina Chen / Data Analyst. The page also shows skill, experience, label, and missing skills from that API response. | not run |
| AC-11 | The page does not compute a second score. Displayed numbers are the API strings. | Browser check that the visible overall, skill, and experience text equals the `overall`, `skill`, and `experience` strings from `GET /api/matches`. | not run |
| AC-12 | When `/api/matches` returns an error JSON `code`, the page shows that code and a `Try again` button. Activating `Try again` after the API succeeds shows the match table. A failure without that JSON shows `Request failed` and the same button. | Browser check in `tests/e2e/error-retry.spec.ts`, including the retry click. See the error-path note below. | not run |
| AC-13 | Application code does not call external hosts. Dependencies are limited to the approved direct list plus what the lockfile records after the approved install. | Review of application source for outbound hosts, and the direct dependency list: `next`, `react`, `react-dom`, `typescript`, `@types/node`, `@types/react`, `@types/react-dom`, `vitest`, and `@playwright/test`, plus the lockfile after the approved install. | not run |
| AC-14 | The repo contains no secrets, credentials, or real personal data. | Repo review for secrets, credentials, and real personal data. The security review may relate to this id. QA still owns the acceptance map. | not run |
| AC-15 | Vitest covers AC-04 through AC-07 and AC-09. `tests/e2e/api.spec.ts` covers AC-02, AC-03, and AC-08. `tests/e2e/matches.spec.ts` covers AC-10 for the two `100.00` pairs and the 9-row result. `tests/e2e/error-retry.spec.ts` covers AC-12, including the retry click. The log quotes the command output. | QA report quoting the Vitest and Playwright commands that were actually run, including pass or fail. Playwright uses `retries: 0`, base URL `http://127.0.0.1:3000`, and `next start` after a build. No result counts before that output exists. | not run |
| AC-16 | Evaluated by the orchestrator after both reports exist. QA does not assign this id. Pass requires a QA report for AC-01 through AC-15, a security review, no product-source edits by QA, and no open high finding. An open high finding stops for a human decision. | Orchestrator evaluation after `artifacts/qa/report.md` and `artifacts/reviews/security-review.md` exist. QA leaves this id unassigned. | unassigned |
| AC-17 | The verified preview URL in `README.md` and `artifacts/run-summary.json` is the URL that passed the G4 page and API checks. Until those checks pass, both say the preview is not deployed. | Preview check recorded in `artifacts/qa/preview-check.md` after the human approves G4. See the preview note below. | unassigned |

## AC-08 method note

Evidence is the running server, with only `GET` exported:

- `GET /api/matches?extra=1` returns 400 `bad_request`.
- `GET /api/matches?candidateId=not-a-real-id` returns 404 `not_found`.
- An empty query value, a value that fails `^[a-z0-9-]{1,64}$`, or any unknown query key returns 400 `bad_request`.
- 400 and 404 bodies have `error` and `code` and omit stacks and filesystem paths.
- `HEAD /api/candidates` returns 200 with an empty body.
- `OPTIONS /api/matches` returns 204 and `Allow: GET, HEAD, OPTIONS`.
- `POST`, `PUT`, `PATCH`, and `DELETE` on `/api/matches` return 405 with an empty body and no `code`. The named spec lists `POST` and `DELETE`. The contract also requires `PUT` and `PATCH`.
- `TRACE` is outside this acceptance id. The original failing result remains in `artifacts/failures/QA-001-attempt-2.md`. That result is not a pass. See the TRACE note in `docs/architecture.md`.

## AC-12 error-path note

The named browser spec intercepts `/api/matches`, returns 500 with `code: "seed_invalid"`, shows that code and a button labeled `Try again`, removes the intercept, activates `Try again`, and shows the 9 match rows.

AC-12 also requires a failure that has no such JSON `code` to show the text `Request failed` and the same button. That check is a browser check of the page. This file does not add a second spec path.

## AC-17 preview note

Until the G4 checks pass, `README.md` and `artifacts/run-summary.json` say the preview is not deployed. Localhost is not a preview URL.

The satisfying preview evidence is `artifacts/qa/preview-check.md` quoting commands that show every check passed, and that same URL written in `README.md` and `artifacts/run-summary.json`. The checks are:

- `GET /` returns 200 and the disclaimer text
- `GET /api/matches` returns 200 and 9 matches
- `GET /api/matches?extra=1` returns 400
- `POST /api/matches` returns 405
- `OPTIONS /api/matches` returns 204
- `HEAD /api/candidates` returns 200 and an empty body
