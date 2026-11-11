# Workflow design

How the approved build is meant to run. This is the plan, not a record of implementation. The parent chat is the orchestrator.

## Roster

| Agent | Definition | Responsibility | Not responsible for |
| --- | --- | --- | --- |
| Orchestrator | `AGENTS.md` | Order work, launch parallel tasks, check path ownership, keep the log, enforce gates, file the security report, run the preview deploy after G4 | Feature code, changing the formula, installing packages before G2, deploying before G4 |
| Requirements architect | `.cursor/agents/requirements-architect.md` | Restate the approved contract as requirements, acceptance list, seed JSON, and type-only `src/types/domain.ts` | Scoring functions, UI, package installs |
| Backend engineer | `.cursor/agents/backend-engineer.md` | Normalizer, scorer, loader, route handlers, Vitest, `tests/e2e/api.spec.ts` | Page, styles, formula changes, non-GET handlers |
| Frontend engineer | `.cursor/agents/frontend-engineer.md` | Results page, stylesheet, `tests/e2e/matches.spec.ts`, `tests/e2e/error-retry.spec.ts` | Scorer, API behavior, `tests/e2e/api.spec.ts`, new dependencies |
| QA engineer | `.cursor/agents/qa-engineer.md` | Run tests, map AC-01 through AC-15, write the QA report | AC-16, editing `src/`, seed, configs, or implementer tests |
| Security reviewer | `.cursor/agents/security-reviewer.md` | Read-only risk review | Edits, installs, "fixing" findings |

The orchestrator is not a file under `.cursor/agents/`. Cursor allows a subagent to launch children, and those children cannot launch further agents. Keeping orchestration in the parent preserves that level and keeps the human in this chat. The cost is that a fresh chat must be told to follow `AGENTS.md`. An `orchestrator.md` subagent would be easy to invoke and would make the specialists one level deeper, where they still could not delegate, but the human would be talking to a coordinator of the coordinator. That extra hop is not worth a one-day POC.

QA and security stay separate. QA judges behavior against acceptance ids. Security judges secrets, input handling, dependency surface, and unsafe rendering. Combining them would make the verifier the same agent that recommends product edits, and it would remove the second parallel window.

## Execution order

```text
G0 human approves planning
  -> human makes Git usable
  -> human authorizes the planning-baseline commit
  -> orchestrator commits that baseline
  -> requirements architect
  -> G1 orchestrator checks contract drift
  -> orchestrator writes configs and .gitignore only
  -> G2 human approves the manifest
  -> orchestrator installs approved packages
  -> parallel: backend engineer, frontend engineer
  -> orchestrator checks path ownership
  -> parallel: QA engineer, security reviewer
  -> fix loop, only if findings fit the retry budget and the same contract
  -> G3 QA pass for AC-01 through AC-15, then orchestrator evaluates AC-16
  -> G4 human approves one Vercel preview
  -> verify the preview page and API
  -> record the URL only if verification passes
  -> always write reflection and run summary, including on failure
  -> stop for human acceptance or human escalation
```

Backend and frontend are independent once the seed, types, and configs exist. QA and security are independent once both implementations have returned. Those are the two parallel windows. Requirements work stays sequential because later tasks consume it. Fixes stay sequential per file so two agents do not edit the same path.

Launch a parallel pair with two delegations in the same turn. Do not set `is_background: true` on the agent files. Background mode would detach every future run of that agent, including runs that must return before a gate.

## Path ownership

Shared checkout. Cursor can isolate subagents in worktrees, and that is held in reserve. The default is one tree and exclusive paths, because merging worktrees would spend the day on integration.

| Path | Writer during the parallel build |
| --- | --- |
| `data/*.json`, `src/types/domain.ts`, `docs/requirements.md`, `docs/acceptance-criteria.md` | Requirements architect, before the parallel window |
| `package.json`, lockfile, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `.gitignore` | Orchestrator only |
| `src/lib/**`, `src/app/api/**`, `tests/unit/**`, `tests/e2e/api.spec.ts` | Backend engineer |
| `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `tests/e2e/matches.spec.ts`, `tests/e2e/error-retry.spec.ts` | Frontend engineer |
| `tests/qa/**`, `artifacts/qa/**` | QA engineer |
| `artifacts/reviews/**`, `artifacts/qa/preview-check.md`, `artifacts/run-summary.json`, `README.md`, `docs/reflection.md` | Orchestrator |
| `docs/execution-log.md`, `artifacts/handoffs/**`, `artifacts/failures/**` | The agent named in the workflow for that file |

If a specialist needs a file it does not own, it stops and reports `blocked`. It does not edit the file.

## Written handoffs

Each specialist ends by writing `artifacts/handoffs/<task-id>.md` in the format from `.cursor/skills/failure-recovery/SKILL.md`. The security reviewer cannot write files (`readonly: true`). Its handoff is the final message. The orchestrator copies that message into `artifacts/reviews/security-review.md` without rewriting findings.

The next agent receives:

- task id
- paths to read
- paths it may write
- the acceptance ids it must satisfy
- any previous failure record path

It does not receive the parent transcript.

## Review gates

| Gate | Who decides | Pass condition |
| --- | --- | --- |
| G0 | Human | Explicit approval of the planning pack |
| G0-git | Human, then orchestrator | `git status` works because the human fixed trust. The human authorizes the commit. The planning baseline commit exists. |
| G1 | Orchestrator, human if drift | Requirements, seed, and types match `docs/architecture.md` |
| G2 | Human | Direct dependencies are only the approved names |
| G3 | QA, then orchestrator | QA passes AC-01 through AC-15 from observed commands. After the security review arrives, the orchestrator evaluates AC-16. No preview URL is claimed. |
| G4 | Human, then orchestrator | Human approves one Vercel preview and completes authentication. Verification of the page and API passes. The URL is written only then. |

QA and security run in parallel and do not see each other's drafts. The orchestrator accepts both reports, then decides whether a fix task is in budget.

## Failure handling

Follow `.cursor/skills/failure-recovery/SKILL.md`.

| Situation | Recovery |
| --- | --- |
| Subagent errors or returns no handoff | Retry once with the same task and the error text. Second failure stops. |
| Unit or smoke test fails | Send the output to the owning engineer. That is a retry. |
| Edit outside owned paths | Orchestrator restores those files from the pre-task snapshot and retries the task once. |
| Two agents changed the same file | Stop parallel work. Assign the file to one owner. Do not tell both to fix it. |
| Contract change disguised as a bug | Stop for the human. |
| Playwright browsers missing | Stop. Installing browsers is part of G2 if it was not already approved. |
| Git command refused for ownership | Stop. Do not bypass `safe.directory`. Do not start implementation. |
| Preview command fails or verification fails | Quote the output. Leave the verified URL empty. One retry of the same preview deploy is allowed. A second failure escalates to the human. |
| Retry budget exhausted | Stop the fix loop. Escalate to the human. Still write the reflection and the run summary. |
| Installed Next.js method status differs from the contract for `GET`, `HEAD`, `OPTIONS`, `POST`, `PUT`, `PATCH`, or `DELETE` | Stop and report the observed status. Do not add a handler to force the target. `TRACE` is excluded by D-015. |

Attempt count is per task id. A QA failure that sends work back to the backend counts against the backend task, not against QA.

## Context limits

- Subagent prompts name paths. They quote a file only when it is the contract under dispute and the excerpt is under 80 lines.
- One task per invocation.
- Do not resume a specialist for a different task.
- Parent state that must survive a long chat is written to `docs/execution-log.md` or `docs/decisions.md`.
- Specialists do not launch subagents, even though Cursor may still expose Task. That limit is an instruction.

## Logging

The orchestrator appends an entry to `docs/execution-log.md` when a task is launched, when it returns, when a gate is reached, and when a recovery action is taken.

Each task entry includes:

- task id
- agent id, or `not exposed` when the tool result has none
- agent role
- start and end timestamps, or `unknown`
- elapsed duration only when both timestamps were observed
- input artifact paths and output artifact paths
- test result and review result, or `not run`
- retry count for that task id
- model, only if shown
- token usage, only if shown, otherwise `unavailable`
- cost, or `unavailable`

When a delegation is sent, save that text unchanged to `prompts/delegations/<task-id>.md` before the specialist returns. When a tool result includes an agent id or a transcript path, copy that result to `artifacts/native/<task-id>.txt` and point the log at it. Do not rewrite the transcript.

Cursor does not give this agent a billing API. A blank usage field stays `unavailable`.

`artifacts/run-summary.json` is written when the run stops. It is not created during planning. Shape:

```json
{
  "status": "not_run",
  "previewUrl": null,
  "previewVerified": false,
  "planningCommit": null,
  "tasks": [],
  "tests": [],
  "reviews": []
}
```

Each task object uses the same fields as the log entry. `previewUrl` stays null until G4 verification passes. `status` then becomes `preview_verified`. A stopped or failed run still writes this file, uses `failed` or `stopped`, and leaves `previewUrl` null. The log may quote a URL printed by the CLI and label it unverified.

## Submission files

| File | When it is written | Rule |
| --- | --- | --- |
| `docs/workflow-diagram.md` | This planning revision | One-page diagram of the gates. |
| `prompts/initial-task.md` | This planning revision | Verbatim first human task. |
| `prompts/planning-review.md` | This planning revision | Verbatim planning-review message. |
| `prompts/delegations/` | At each delegation | Exact prompt sent. Empty of delegations until then. |
| `docs/reflection.md` | Whenever the run stops | Filled from the log, including when execution or the preview fails. The file currently says not started. |
| `artifacts/run-summary.json` | Whenever the run stops | Schema above, including a failed run. Not created in planning. |
| `README.md` | Started in planning | Demo steps for the approved app. Verified preview URL filled only after G4. |

Do not reconstruct a missing prompt and label it verbatim. If a prompt was not saved, the delegation file says `not preserved` and points at the task id.

## Preview deployment

G4 uses the Vercel CLI for one preview deployment. `vercel` is not added to `package.json`. The human approves the CLI invocation and completes `vercel login` or provides auth in the session. Tokens are not written into the repo, the log, or the reflection.

Command shape, without `--prod`: a preview deploy of this Next.js app. The exact command is recorded when it is run.

After the CLI prints a URL, verify that URL before calling it verified:

- `GET /` returns 200 and the disclaimer text
- `GET /api/matches` returns 200 and 9 matches
- `GET /api/matches?extra=1` returns 400
- `POST /api/matches` returns 405
- `OPTIONS /api/matches` returns 204
- `HEAD /api/candidates` returns 200 and an empty body

Write the command output to `artifacts/qa/preview-check.md`. On full success, set the README preview line and `previewUrl` to that same URL. On any failure, do not put the URL in the README. One redeploy is the retry. A product defect found here goes back to the owning engineer under the existing retry budget, then local QA for the failing id, then one redeploy. If that budget is exhausted, or the preview still fails, escalate to the human and still complete the reflection and run summary.

## Git

Planning observed that Git refuses this repo for dubious ownership. The human resolves that. The orchestrator does not change Git config and does not pass `safe.directory`.

Implementation starts only after `git status` succeeds and the human has authorized the planning-baseline commit, and that commit has been made. Until then, this revision stays in the working tree.

During implementation, still save `artifacts/snapshots/<task-id>/` before each writer so path ownership can be checked even when the tree is dirty. Once Git works, also record `git status` in the task log. Further commits still require a human request.

## One-day contingency

If the remaining time is short, simplify spacing and color first. Keep the formula tests, the API spec, the retry spec, the smoke spec, QA, and the security review. If `next build` or Playwright cannot run, stop and quote the command. If G4 cannot start because Vercel auth is unavailable, stop and leave the preview URL empty. Do not publish localhost as the preview URL.
