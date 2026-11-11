# Cybergirls Job Match POC

This repository is a one-day proof of concept for a disciplined multi-agent workflow. Three fictional candidates are scored against three fictional jobs. Required skills count for 70% and experience for 30%. The page shows the strings returned by the API. It does not compute a second score.

The verified preview is https://jobmatch-p4vvrid11-freds-projects-6ef41a64.vercel.app

The checks for that URL are in `artifacts/qa/preview-check.md`. It is a Vercel preview deployment, not a production alias. Nothing in this repo has been pushed.

## What the project demonstrates

An orchestrator in this session delegated work to specialist Cursor agents, kept written prompts and handoffs, and stopped at human gates. Backend and frontend were built in parallel from a frozen contract. QA and security review were independent. Failures stayed in the log. The original TRACE failure was not rewritten into a pass.

## Technology choices

| Choice | What was selected | Trade-off |
| --- | --- | --- |
| App | Next.js 16.4.6, React 19.3.1, TypeScript 5.9.3 | One local app serves the page and the route handlers. |
| Data | `data/candidates.json` and `data/jobs.json` | No database and no accounts. The serverless functions read those files from the deployment. |
| Scoring | Integer basis points, scale 10000 | Avoids binary floating point. The formula is in `docs/architecture.md`. |
| Matching | Deterministic code in `src/lib/match` | No external model and no network call inside the scorer. |
| HTTP | Route modules export `GET` only | `HEAD`, `OPTIONS`, and the 405 responses come from Next.js. |
| Tests | Vitest 5.1.0 and Playwright 1.65.0 | Unit tests cover the formula and loader. Playwright covers the API and the page. |
| Preview | Vercel CLI, one preview | `vercel` is not a package dependency. `vercel --prod` was not used. |

Direct dependencies are pinned in `package.json` and locked in `package-lock.json`.

## Agent roster

| Role | Writes |
| --- | --- |
| Orchestrator, this session, `AGENTS.md` | Logs, the security report filing, the preview check, and submission files. No feature code. |
| Requirements architect | Requirements, acceptance criteria, seed JSON, and type-only domain types. |
| Backend engineer | Matcher, loader, API routes, unit tests, and the API integration spec. |
| Frontend engineer | Results page, stylesheet, smoke spec, and error/retry spec. |
| QA engineer | `artifacts/qa/**` and `tests/qa/**`. Does not fix product code. |
| Security reviewer | Nothing. Read-only. |

Definitions are in `.cursor/agents/`. Reusable skills are in `.cursor/skills/contract-first`, `.cursor/skills/acceptance-verification`, and `.cursor/skills/failure-recovery`.

## Human gates

1. G0, planning approval.
2. G0-git, one planning-baseline commit after Git was usable. That commit is `a3f6ed771901c0845556be8abd2890aeba975c25`.
3. G1, contract check against the architecture. No formula or error-code change.
4. G2, approval of the exact dependency list, then install.
5. G3, local acceptance. QA records AC-01 through AC-15. The orchestrator evaluates AC-16 after the security review.
6. G4, one preview deployment and the checks in `artifacts/qa/preview-check.md`.

## Parallel work and retries

Backend and frontend ran together after the contract and install gates. QA and the security reviewer ran together after those handoffs. A task has three attempts: the first try and two retries. A retry is for a failed test, an incomplete handoff, a subagent error, or an edit outside the owned paths. The same error is not retried again after the evidence has already been included once. Exhaustion stops for a human decision.

## Run it locally

The recorded local toolchain was Node.js v22.22.2. From a clean checkout:

```bash
npm ci
npx playwright install chromium
npm test
npm run test:e2e
npm run dev
```

`npm test` runs Vitest. `npm run test:e2e` builds the app and starts it on `http://127.0.0.1:3210`, which is the base URL in `playwright.config.ts`. `retries` is 0 and `reuseExistingServer` is false. Port 3210 was used because another application occupied port 3000 during the acceptance runs. `npm run dev` uses Next.js's default port, 3000.

On the page, the disclaimer is shown with nine matches. Ada Okonkwo / Full Stack Engineer and Mina Chen / Data Analyst show `100.00`.

## Evidence

| What | Where |
| --- | --- |
| Execution log | `docs/execution-log.md` |
| Decisions, including the TRACE clarification D-015 | `docs/decisions.md` |
| Reflection | `docs/reflection.md` |
| Run summary | `artifacts/run-summary.json` |
| Handoffs | `artifacts/handoffs/` |
| QA reports | `artifacts/qa/` |
| Security review | `artifacts/reviews/security-review.md` |
| Failures | `artifacts/failures/` |
| Prompts | `prompts/` |
| Native tool results | `artifacts/native/` |

Token usage and cost were `unavailable` for every recorded task. No billing figure was supplied.

## Limitations

- `TRACE /api/matches` returned HTTP 500 from Next.js 16.4.6, with `TypeError: 'TRACE' HTTP method is unsupported.` The spec had expected 400. That run is preserved in `artifacts/failures/QA-001-attempt-2.md`. D-015 removed TRACE from the blocking suite. The application was not given a TRACE handler. The later QA-003 run, 19 Playwright tests passed, did not send TRACE and does not replace that failure.
- QA-001 attempt 1 and QA-002 did not start Playwright because another Next.js app was listening on port 3000. That process was not stopped.
- The first Vercel command used `--target preview` and the CLI still returned a production deployment. Its two aliases were removed. The URL above is the later preview deployment.
- There is no authentication, database, file upload, or external model. The seed is fictional. A production domain was not assigned.

A later change could add a real data store or authentication. Those were out of scope for this proof of concept.
