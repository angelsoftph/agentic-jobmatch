# Failure QA-001 attempt 1

- class: port_conflict_external
- time: 2026-11-11, Vitest start quoted as 19:16:25 +08:00. The Task tool did not print an end timestamp.
- actor: qa-engineer
- evidence: `npm run test:e2e` exit 1. Playwright printed `Error: http://127.0.0.1:3000 is already used`. No spec ran. The listener was node.exe PID 52060, a different Next.js app (`app_compendium_strategies`). `npm test` exit 0, 19 tests passed.
- recovery: Do not stop PID 52060. Do not set `reuseExistingServer: true`, which would test the other app. Orchestrator changes this project's Playwright server to `127.0.0.1:3210`. That is a local port move, not a weaker assertion.
- next: retry
