# Scope

Cybergirls Agentic Job Match is a one-day, local proof of concept. The product is a small deterministic matcher. The assessment is the multi-agent process around it: delegated specialists, written handoffs, parallel work, independent verification, human gates, bounded recovery, and logs.

No application code is in the repo yet. This document is a planning boundary, not a claim that any screen or test exists.

## MVP

In scope after the human approves the planning pack:

- Three synthetic candidates and three synthetic jobs, stored as local JSON.
- A pure matching function with the formula in `docs/architecture.md`.
- Next.js route handlers that load the JSON and return scores.
- One results page that displays the API response.
- Vitest tests for the formula and loader rules.
- Playwright checks for the page, the page error/retry path, and a small API integration set.
- One Vercel preview after local QA and security review, then a check of that preview.
- Submission files listed in `docs/workflow-design.md`.

## Exclusions

- Production hosting, a Vercel production alias, accounts, and authentication inside the app
- Real résumés, real candidates, scraped profiles, or any personal data
- External LLM APIs, embeddings, fuzzy match, and synonym tables
- Databases, queues, file upload, email, and third-party SaaS
- Create, update, and delete of candidates or jobs
- Preferred-skill weights, location, salary, seniority titles, and free-text search
- A component library, CSS framework, or extra validation library
- Git push and any other remote Git operation
- Mobile-native apps

## Assumptions

- The work fits in one working day after planning approval. If the day runs out, stop with the log current. Do not drop QA, the security review, formula tests, or the API and retry checks. A preview URL is recorded only after G4 verification. If Vercel cannot be used, stop. Localhost is not a substitute preview URL.
- The machine can run Node. Planning confirmed that `node` ran a one-off arithmetic check. Browser availability for Playwright was not checked.
- Package versions are chosen at the approved install, then locked. They are not pinned in this planning pack because they were not installed.
- Seed names are fictional labels invented for this POC. They are not descriptions of real people.
- The human is available to answer the gates in `AGENTS.md`.

## Normative contract

`docs/architecture.md` is the source for the data shape, scoring formula, fixture table, API, and page behavior. Later requirements files must match it. If they disagree, stop at gate G1.

Acceptance is the behavior below. IDs are stable so QA can map evidence without renaming them.

| ID | Acceptance |
| --- | --- |
| AC-01 | Seed JSON contains exactly the three candidates and three jobs in the architecture fixture, with those ids, names, skills, and year values. |
| AC-02 | `GET /api/candidates` returns those candidates. `GET /api/jobs` returns those jobs. |
| AC-03 | `GET /api/matches` returns all 9 pairs in the architecture sort order. |
| AC-04 | Each pair's basis integers and two-decimal strings equal the fixture table. |
| AC-05 | Skill credit is exact equality after the documented normalization. Extra skills do not raise the score. Duplicates count once. `Node.js` does not match `nodejs`. |
| AC-06 | Experience at or above the minimum scores the full experience component. Experience above the minimum adds nothing. Experience below the minimum is proportional. A minimum of 0 scores the full experience component. |
| AC-07 | Rounding follows `divRoundHalfUp` for non-negative integers, including exact division, below-half, exact-half, and above-half cases on the helper. |
| AC-08 | GET behavior: a well-formed unknown id returns 404 `not_found`; a malformed id or unknown query key returns 400 `bad_request`. Those JSON bodies have `error` and `code`, and omit stacks and filesystem paths. With only `GET` exported, the running server returns: `HEAD` with the GET status and an empty body; `OPTIONS` 204 and `Allow: GET, HEAD, OPTIONS`; `POST`, `PUT`, `PATCH`, and `DELETE` 405 with an empty body and no `code`. A method token outside that set is recorded from the installed Next.js version. The planning target is 400. |
| AC-09 | Invalid seed data fails the loader with a structured error. The scorer does not read the clock, random values, or the network. |
| AC-10 | The page shows the fictional-data disclaimer, lists the matches returned by the API, and shows overall, skill, experience, label, and missing skills. |
| AC-11 | The page does not compute a second score. Displayed numbers are the API strings. |
| AC-12 | When `/api/matches` returns an error JSON `code`, the page shows that code and a `Try again` button. Activating `Try again` after the API succeeds shows the match table. A failure without that JSON shows `Request failed` and the same button. |
| AC-13 | Application code does not call external hosts. Dependencies are limited to the approved direct list plus what the lockfile records after the approved install. |
| AC-14 | The repo contains no secrets, credentials, or real personal data. |
| AC-15 | Vitest covers AC-04 through AC-07 and AC-09. `tests/e2e/api.spec.ts` covers AC-02, AC-03, and AC-08. `tests/e2e/matches.spec.ts` covers AC-10 for the two `100.00` pairs and the 9-row result. `tests/e2e/error-retry.spec.ts` covers AC-12, including the retry click. The log quotes the command output. No test result is claimed before that output exists. |
| AC-16 | Evaluated by the orchestrator after both reports exist. QA does not assign this id. Pass requires a QA report for AC-01 through AC-15, a security review, no product-source edits by QA, and no open high finding. An open high finding stops for a human decision. |
| AC-17 | The verified preview URL in `README.md` and `artifacts/run-summary.json` is the URL that passed the G4 page and API checks. Until those checks pass, both say the preview is not deployed. |

## Done

QA verifies AC-01 through AC-15. The orchestrator evaluates AC-16 from the QA report and the security review together. AC-17 is the preview gate. Whenever the run stops, including a failed execution or a failed preview, the orchestrator completes `docs/reflection.md` and `artifacts/run-summary.json` from observed evidence. Agents do not grade the assessment themselves.
