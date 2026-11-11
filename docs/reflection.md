# Reflection

Status: preview verified on 2026-11-11 20:36 UTC+8. Filled from `docs/execution-log.md` and the cited artifacts. Waiting for human acceptance.

## What happened

Planning was committed as `a3f6ed771901c0845556be8abd2890aeba975c25`. Requirements, backend, and frontend handoffs were recorded. The approved packages were installed. QA and security ran independently.

QA-001 attempt 1 did not reach the specs because another application was listening on port 3000. The Playwright server was moved to port 3210. QA-001 attempt 2 then ran 20 Playwright tests: 19 passed and `TRACE /api/matches` expected 400 and received 500. The security review found no high, medium, or low findings. The first AC-16 evaluation failed because AC-08 failed.

The human approved D-015. TRACE left the blocking contract. The application routes were not changed. The original failure file was kept. QA-002 found port 3000 occupied again and did not start Playwright. QA-003 ran the revised suite on port 3210: Vitest 19 passed and Playwright 19 passed. AC-16 then passed.

G4 login completed in 96671 ms. The account reported by `vercel whoami` was `bugzrey-3363`. The project was linked under Fred's projects. The first deploy command used `--target preview` and did not use `--prod`, and the CLI still returned target production. Its two aliases were removed. A second `vercel deploy --yes --target preview` returned target preview. Public checks and the browser passed. The verified URL is `https://jobmatch-p4vvrid11-freds-projects-6ef41a64.vercel.app`.

## What failed and how it was recovered

- Port 3000 was occupied by another Next.js app. That process was not stopped. The local test server used port 3210. QA-002 recorded the later conflict as process 40832, HTML referencing `app_compendium_strategies`.
- `TRACE /api/matches` returned HTTP 500 with `TypeError: 'TRACE' HTTP method is unsupported.` That result remains in `artifacts/failures/QA-001-attempt-2.md` and execution-log entry P-016. It is not a pass. The human removed TRACE from the blocking suite and rejected an upstream method filter for this one-day POC.
- The first Vercel deployment was labeled production and received two `vercel.app` aliases. Those aliases were removed. The verified URL is the later preview deployment.

## Gates

- G0, G0-git, G1, and G2 were completed earlier in the log.
- G3 passed under the revised criteria. QA-003 passed AC-01 through AC-15. SR-001 still has no open high finding and was not repeated. QA-003 did not edit product source.
- G4 checks passed. AC-17 is the verified preview URL. No production alias remains assigned. Nothing was pushed.

## Evidence index

- TRACE failure: `artifacts/failures/QA-001-attempt-2.md`, `artifacts/qa/report-QA-001-attempt-2.md`, P-016
- First AC-16 fail: P-017
- Port block after the contract change: `artifacts/failures/QA-002.md`, P-019
- Revised suite: `artifacts/qa/report.md`, P-020
- Revised AC-16: P-021
- Security: `artifacts/reviews/security-review.md`, P-015
- Preview: `artifacts/qa/preview-check.md`, P-022

## What to change next time

Confirm the local port immediately before the acceptance run. Do not put an unverified framework status into a blocking assertion until the installed server has returned it. On a new Vercel project, inspect the deployment target before treating the first URL as a preview. The first command here returned production even with `--target preview`.
