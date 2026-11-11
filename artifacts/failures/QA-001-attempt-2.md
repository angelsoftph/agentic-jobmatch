# Failure QA-001 attempt 2

- class: framework_mismatch
- time: 2026-11-11. Vitest start quoted as 19:20:35 +08:00. Playwright ran after that build. The Task tool did not print an end timestamp.
- actor: qa-engineer
- evidence: `npm run test:e2e` exit 1. 19 of 20 Playwright tests passed. `tests/e2e/api.spec.ts:188` `TRACE /api/matches` expected 400 and received 500. The server logged `TypeError: 'TRACE' HTTP method is unsupported.` `npm test` exit 0, 19 tests passed.
- recovery: Do not add a route handler to force 400. Do not change the assertion. The architecture says to stop and report when the installed Next.js status differs from the planning target.
- next: stop_for_human
