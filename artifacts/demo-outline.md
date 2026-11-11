# 25-minute demonstration outline

The subject is the multi-agent workflow. The live app is about 3 minutes, in the last section. Times are a speaking plan, not measured durations.

Repository: https://github.com/angelsoftph/agentic-jobmatch

Planning commit: `a3f6ed771901c0845556be8abd2890aeba975c25`

Implementation commit: `d0e72a34fcc21c4bba4948fb0a8c1ef43daeaf7b`

Preview, for the short app segment only: https://jobmatch-p4vvrid11-freds-projects-6ef41a64.vercel.app

1. Minutes 0–4. Orchestration. Open `AGENTS.md` and `docs/workflow-diagram.md`. Say the parent session orders work, checks path ownership, and stops at human gates. Specialists do not install, commit, push, or deploy. The orchestrator does not write feature code.
2. Minutes 4–8. Specialist agents and reusable skills. Show `.cursor/agents/` for requirements, backend, frontend, QA, and the read-only security reviewer. Show `.cursor/skills/contract-first`, `acceptance-verification`, and `failure-recovery`. Say each specialist is told to read the skill, and the platform does not prove that it did.
3. Minutes 8–12. Parallel delegation and written handoffs. Show `prompts/delegations/` for the exact prompts. Say backend and frontend ran together after G2, then QA and security ran together. Open one handoff in `artifacts/handoffs/` and the matching native result in `artifacts/native/`.
4. Minutes 12–16. Independent verification. Open `artifacts/qa/report.md`: QA-003 recorded Vitest 19 passed and Playwright 19 passed for AC-01 through AC-15. Open `artifacts/reviews/security-review.md`: no high findings. Say the orchestrator evaluated AC-16 only after both reports existed. The first AC-16 evaluation failed.
5. Minutes 16–20. Recovery. Open `artifacts/failures/QA-001-attempt-1.md` and `artifacts/failures/QA-002.md` for the port 3000 conflicts. The other process was not stopped, and the suite later used port 3210. Open `artifacts/failures/QA-001-attempt-2.md`: TRACE expected 400 and Next.js returned 500. That result stays a failure. A task has three attempts. Exhaustion stops for a human.
6. Minutes 20–22. Human approvals. Walk G0, G0-git, G1, G2, the D-015 TRACE clarification, G3, and G4 in `docs/decisions.md` and `docs/execution-log.md`. Say no push occurred during G4. Publication came afterward, at the two commits above. Token usage and cost were unavailable.
7. Minutes 22–25. Live app, about 3 minutes. Open the preview. Read the disclaimer, show nine rows, and point to Ada Okonkwo / Full Stack Engineer and Mina Chen / Data Analyst at `100.00`. Change one filter. Stop. Do not claim a production domain. The formula and the longer API checks stay in `docs/architecture.md` and `artifacts/qa/preview-check.md` for questions.
