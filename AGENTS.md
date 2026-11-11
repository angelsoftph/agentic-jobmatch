# Orchestration rules

This file binds the parent agent for the Cybergirls Agentic Job Match POC. The parent session is the orchestrator. Specialist roles are subagents under `.cursor/agents/`.

Planning is complete only when the human approves it in the chat. Until that approval, do not implement application code, install packages, deploy, commit, or push. After that approval, implementation still waits until Git accepts commands in this repo and the human has authorized the planning-baseline commit.

## What is enforced, and what is only an instruction

| Control | Status |
| --- | --- |
| `readonly: true` on a subagent | Documented Cursor behavior: no file edits and no state-changing shell commands. Source: Cursor subagent docs read during planning. Not re-tested by launching a subagent in the planning session. |
| Subagent context isolation | Documented Cursor behavior. A subagent does not see this chat unless the prompt includes the needed facts. |
| Nesting limit | Documented Cursor behavior. The parent and its direct subagents may launch subagents. A subagent launched by a subagent cannot launch further ones. |
| Git `safe.directory` | Enforced by Git on this machine. Observed 2026-11-11: `git status` fails because `.git` is owned by `BUILTIN\Administrators` and the user is `DESKTOP-JUV1MFN\kylle`. |
| Path allowlists, retry caps, approval gates, "do not fix what you review" | Instructions. Cursor agent frontmatter has no `tools` allowlist. A subagent inherits the parent's tools, including shell, file edits, MCP, and Task. |
| Skill text | Instructions. A specialist is told to read the skill. The platform does not prove that it did. |
| Cost and token totals | Not available to the agent as a reliable meter. Do not invent them. |

Do not bypass Git `safe.directory` with `-c` or by editing Git config. Ask the human to change ownership or add the exception.

## Roles

| Role | Where it lives | Writes product code |
| --- | --- | --- |
| Orchestrator | This session, following this file | No feature code. May write logs, configs, the filed security report, the preview check, and the submission files after G4. |
| Requirements architect | `.cursor/agents/requirements-architect.md` | Types and seed JSON only, as contract material, after approval. |
| Backend engineer | `.cursor/agents/backend-engineer.md` | Matching engine, loader, API, unit tests, and the API integration spec. |
| Frontend engineer | `.cursor/agents/frontend-engineer.md` | Results page, stylesheet, smoke spec, and the error/retry spec. |
| QA engineer | `.cursor/agents/qa-engineer.md` | Verification artifacts and `tests/qa/**` only. |
| Security reviewer | `.cursor/agents/security-reviewer.md` | Nothing. `readonly: true`. |

Do not create or invoke an orchestrator subagent. That would spend the nesting level the parent needs. Details and trade-offs: `docs/workflow-design.md`, `docs/decisions.md`.

## Required reading before implementation

After approval, follow `docs/scope.md`, `docs/architecture.md`, and `docs/workflow-design.md`. The scoring formula in `docs/architecture.md` is normative. Do not change weights, rounding, seed profiles, or the API error contract without a human decision.

Skills:

- `.cursor/skills/contract-first/SKILL.md` before any feature code
- `.cursor/skills/acceptance-verification/SKILL.md` for QA
- `.cursor/skills/failure-recovery/SKILL.md` when a task fails

## Quality gates

1. **G0 — Planning approval.** Current stop. No implementation before an explicit human approval of this planning pack.
2. **G0-git — Planning baseline.** The human makes Git usable in this repo without the orchestrator changing Git config or bypassing `safe.directory`. The human then authorizes the planning-baseline commit. The orchestrator makes that commit. Implementation stays stopped until the commit exists.
3. **G1 — Contract drift.** After the requirements architect finishes, compare the new requirements, acceptance list, seed, and types with `docs/architecture.md`. Continue only if the normative formula, fixture scores, seed profiles, and API behavior are unchanged. Any change stops for approval.
4. **G2 — Install approval.** Show the direct dependency list and config files. Install only after an explicit human approval. Direct dependencies are limited to `next`, `react`, `react-dom`, `typescript`, `@types/node`, `@types/react`, `@types/react-dom`, `vitest`, and `@playwright/test`.
5. **G3 — Local acceptance.** QA has recorded a pass for AC-01 through AC-15 from commands actually run. The security review has been received. The orchestrator then evaluates AC-16. G4 opens only when AC-16 passes. This gate does not deploy and does not claim a preview URL.
6. **G4 — Preview deployment.** After G3, ask the human before any Vercel login or deploy. On approval, deploy one preview, not a production alias. Verify the page and API. Write the preview URL into `README.md` and `artifacts/run-summary.json` only after those checks pass. Then stop for human acceptance.

The orchestrator may, without a new gate, implement the approved contract, run the approved local test commands, file handoffs and logs, and restore files a specialist was not allowed to change. Deploy, package install, and the planning commit stay behind their gates.

## Human approval boundaries

Stop and ask before:

- changing score weights, formula, seed people, or API error codes
- adding a direct dependency or running a package install
- using real personal data or secrets
- calling a network service other than the local app, the package registry approved at G2, and the Vercel preview deploy approved at G4
- deploying, including any Vercel command, before G4
- authenticating to Vercel before G4
- a production alias, a custom domain, or `vercel --prod`
- git push
- changing Git config, remotes, or hooks, or bypassing `safe.directory`
- committing, including the planning baseline, before the human authorizes that commit
- expanding scope: authentication, accounts, an LLM, a database, file upload, or more than the approved seed
- retry budget exhausted
- a high security finding whose fix changes scope or dependencies

## Retry limits

- A task has at most 3 attempts: the first try plus 2 retries.
- A specialist may correct one obvious mistake inside a single attempt, then must return.
- Retry only for a test failure with output, an incomplete handoff, a subagent error, or an edit outside the owned paths.
- Do not retry a scope change, a missing approval, or the same error after it has already been retried once with the evidence included.
- When the budget is exhausted, write a failure record and stop. Do not start a redesigned solution in the same turn.

## Artifacts

| Artifact | Owner | When |
| --- | --- | --- |
| `docs/execution-log.md` | Orchestrator | Every delegated task and every gate |
| `prompts/delegations/<task-id>.md` | Orchestrator | The exact prompt, saved when it is sent |
| `artifacts/handoffs/*.md` | Specialist, filed as written | End of each task |
| `artifacts/failures/*.md` | Orchestrator | Each failed attempt |
| `artifacts/native/<task-id>.txt` | Orchestrator | Tool result or transcript path, only when one was actually returned |
| `artifacts/qa/report.md` | QA | Local verification |
| `artifacts/qa/preview-check.md` | Orchestrator | After the preview checks, quoting command output |
| `artifacts/reviews/security-review.md` | Orchestrator, verbatim from the reviewer | After security review |
| `artifacts/run-summary.json` | Orchestrator | Whenever the run stops, including retry exhaustion and a failed preview. Use null and `unavailable` for missing values. |
| `docs/reflection.md` | Orchestrator | Whenever the run stops, including a failed execution or preview, from the log |
| `README.md` | Orchestrator | Preview URL filled only after G4 verification |
| `docs/workflow-diagram.md` | Orchestrator | Planning diagram; update it if the gate order changes |

Do not invent command output, test results, durations, models, or costs. If a value was not observed, write `unknown` or `unavailable`.

## Delegation

- Launch independent tasks together: backend with frontend, then QA with security.
- Pass file paths and the task id. Do not paste the whole chat or unrelated source.
- Specialists do not launch subagents.
- Specialists do not install packages, commit, push, or deploy.
- After a specialist returns, check written files against the path ownership in `docs/workflow-design.md` before accepting the handoff.

## Context

- Prefer links to repo files over copied source.
- Keep the parent's running state in `docs/decisions.md` and `docs/execution-log.md`.
- Start a fresh subagent for a new task. Resume a subagent only to continue the same failed attempt, and count that resume as a retry.
- If a return is too large to carry forward, store it under `artifacts/` and carry the handoff summary only.

## Logging

Append to `docs/execution-log.md` using the entry format in that file. Every task entry has a task id, agent role, and retry count. Record an agent id only when the tool result exposes one. Record start and end timestamps when they are observed, and elapsed duration only when both exist. Record input and output artifact paths, test results, and review results from the files that were written. Record model and token usage only when the session shows them. Cost is `unavailable` unless the human supplies a figure. Keep native evidence by saving the returned tool result or transcript path. Do not rewrite it into a cleaner story.
