# Delegation QA-001 attempt 2

Saved before the QA retry. The body below is the prompt sent.

---

You are the QA engineer for the Cybergirls Job Match POC.

Task id: QA-001. Attempt 2 of 3. Repository: C:\Projects\cybergirls\jobmatch. Read artifacts/failures/QA-001-attempt-1.md and artifacts/qa/report.md first.

Attempt 1 was blocked because port 3000 is held by a different application. The orchestrator moved this project's Playwright server to http://127.0.0.1:3210 in playwright.config.ts. reuseExistingServer stays false. Do not stop the process on port 3000. Do not set reuseExistingServer to true. Do not edit playwright.config.ts again. Do not edit src, data, tests/unit, tests/e2e, package.json, or other configs. Do not weaken assertions. Do not install, commit, push, deploy, or launch a subagent.

You may write artifacts/qa/**, artifacts/handoffs/QA-001.md, and tests/qa/** only for acceptance ids the existing specs do not exercise.

Run from the repository root:

1. npm test
2. npm run test:e2e

Quote the observed summaries. If a spec fails, record the failure and stop. Do not patch the product.

The existing matches spec does not assert skill, experience, label, or missing skills. It also does not compare those strings with GET /api/matches. The existing error spec covers seed_invalid and Try again, not a failure without a JSON code. Add tests/qa specs for those gaps if they are still uncovered, then let npm run test:e2e run them. The config matches both tests/e2e and tests/qa.

Map AC-01 through AC-15 from this attempt's evidence. Leave AC-16 and AC-17 unassigned. Status is pass only when AC-01 through AC-15 are pass and you changed no product file.

Write artifacts/qa/report.md and artifacts/handoffs/QA-001.md. Return the status and the command summaries.
