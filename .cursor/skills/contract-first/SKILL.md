---
name: contract-first
description: Freezes the job-match API, scoring formula, and shared types before feature code is written, and checks later code against that contract. Use when implementing the matcher, route handlers, results page, or any change that could alter scores or error codes.
---

# Contract-first development

The contract is `docs/architecture.md` plus the files the requirements architect materializes from it: `src/types/domain.ts`, `data/candidates.json`, and `data/jobs.json`. Behavior that is not in those files is out of scope.

## Before writing feature code

1. Read the formula, fixture table, loader rules, API table, and page section.
2. Confirm `SKILL_WEIGHT` is 70, `EXPERIENCE_WEIGHT` is 30, and `SCORE_SCALE` is 10000.
3. If the file you need is missing or disagrees with the architecture doc, stop and report `blocked`. Do not reconcile numbers yourself.

## While implementing

- Import domain types. Do not create a second `Match` shape.
- Implement `divRoundHalfUp` once and call it. Do not inline a different rounding rule.
- Keep score math on integers. Format with `floor(basis / 100)` and `basis % 100`.
- Return API errors as `ErrorBody` codes: `bad_request`, `not_found`, `seed_invalid`.
- Export `GET` only. Do not add handlers for `HEAD`, `OPTIONS`, or methods that should be 405.
- The page displays `overall`, `skill`, and `experience` from the response. It does not recompute them.
- A new query parameter, field, or weight is a contract change. Stop for the orchestrator.

## Fixture check

When you add or touch the scorer, the unit tests must expect these overall strings for the seed:

| Candidate | Job | Overall |
| --- | --- | --- |
| cand-ada-okonkwo | job-fullstack-engineer | 100.00 |
| cand-mina-chen | job-data-analyst | 100.00 |
| cand-ada-okonkwo | job-frontend-engineer | 76.67 |
| cand-jordan-hale | job-frontend-engineer | 56.67 |
| cand-jordan-hale | job-fullstack-engineer | 30.83 |
| cand-ada-okonkwo | job-data-analyst | 30.00 |
| cand-mina-chen | job-frontend-engineer | 30.00 |
| cand-mina-chen | job-fullstack-engineer | 22.50 |
| cand-jordan-hale | job-data-analyst | 15.00 |

Basis integers for those rows are in `docs/architecture.md`. Assert the integers.

## Done condition for an implementation handoff

The handoff names the contract sections followed and any test command actually run. It does not say the contract passed unless the command output is in the handoff.
