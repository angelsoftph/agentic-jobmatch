---
name: failure-recovery
description: Recovers failed job-match agent tasks with a three-attempt cap, written failure records, and a fresh prompt when context is spent. Use when a specialist errors, tests fail, a handoff is incomplete, or an edit lands outside owned paths.
---

# Failure recovery

The orchestrator owns recovery. Specialists report failure. They do not launch a replacement agent.

## Attempt budget

Each task id gets 3 attempts: the initial attempt and 2 retries.

A specialist may correct one local mistake inside an attempt (a typo, a single failing assertion they just wrote). The second failure of the same command ends the attempt.

These do not get a retry:

- the human has not approved the relevant gate
- the fix would change the formula, seed, weights, or error codes
- the same error was already retried once and the new output is the same
- the budget is exhausted

When the budget is exhausted, write the failure record, escalate to the human, and still complete `docs/reflection.md` and `artifacts/run-summary.json` from observed evidence. Do not switch to a different design in that turn.

## Failure classes

| Class | What the orchestrator does |
| --- | --- |
| `agent_error` | Retry once with the same task and the error text. |
| `incomplete_handoff` | Retry once, naming the missing file or section. |
| `test_failure` | Send the observed output to the owning engineer. Counts as a retry for that engineer. |
| `outside_path` | Restore the unexpected files from the pre-task snapshot. Retry the specialist once. |
| `path_conflict` | Stop both writers. Assign one owner. Do not retry both. |
| `contract_drift` | Stop for the human. |
| `git_blocked` | Do not bypass `safe.directory`. Stop implementation until the human fixes Git trust. |
| `deploy_failed` | Quote the CLI or verification output. Leave the verified URL empty. One redeploy, then stop. |
| `framework_mismatch` | The installed Next.js status for HEAD, OPTIONS, 405, or a non-listed method differs from `docs/architecture.md`. Stop and report it. |

## Failure record

Write `artifacts/failures/<task-id>-attempt-<n>.md`:

```markdown
# Failure <task-id> attempt <n>

- class:
- time:
- actor:
- evidence: command output or file path, quoted from observation
- recovery:
- next: retry | stop_for_human
```

If the evidence is long, store the output file and quote the first error line plus the exit code.

## Handoff shape

Specialists use this for both success and failure, at `artifacts/handoffs/<task-id>.md`:

```markdown
# Handoff <task-id>

- from:
- to: orchestrator
- status: ready | blocked | failed
- attempt:
- files read:
- files written:
- checks run: none | command — observed result
- decisions made:
- blockers:
- next action:
```

The security reviewer uses the same fields in its final message because `readonly: true` blocks writing the file.

## Context

- A retry prompt includes the failure-record path, the owned paths, and the contract path. It does not include the full previous transcript.
- Resume the same subagent only when it still holds unsaved reasoning for that same attempt. A resume counts as the next attempt.
- Otherwise start a fresh subagent. Isolated context is the point of the specialist.
- If the parent chat is carrying large logs, write them to `docs/execution-log.md` and refer to ids.

## Snapshot fallback

Git may be unavailable because of directory ownership. Before launching a writer, copy the files that writer could illegally touch, or record their hashes, under `artifacts/snapshots/<task-id>/`. Restore from that copy on `outside_path`. Do not use `git reset` or `git checkout` unless the human has made Git usable and the orchestrator has confirmed the command will not discard unrelated work.
