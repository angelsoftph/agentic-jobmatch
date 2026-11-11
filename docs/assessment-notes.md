# Assessment notes

These notes describe the repository as reviewed at `5edcf59cc9ec07f4cc56802e4a095f2b32ec36d8`. They do not rewrite `docs/execution-log.md`, the reflection, or the original handoffs.

## Why Cursor

Cursor was chosen instead of building a custom orchestrator. That was a deliberate time-and-complexity trade-off. The one-day assessment was better spent demonstrating agent delegation, verification, and recovery than building orchestration infrastructure.

Cursor was already the working environment. It supplies the parent session, specialist subagent files, and skill files. The scorer stays local and does not call a model. The useful parts for this proof of concept were a parent that can launch specialists, a read-only security reviewer, written prompts and handoffs, and human gates in the same chat.

The recorded limits are part of that choice. Path ownership and "do not launch subagents" are instructions rather than an enforced tool allowlist. A specialist does not see this chat unless the prompt includes the facts. The platform does not prove that a skill was read. Nesting stops a specialist's own subagent from launching further agents. The task tool often returned no end timestamp. Token and cost totals were not exposed. One shared working tree was the default. Worktrees were reserved and were not used.

## Time

All clocks below are `2026-11-11`, UTC+8, from `docs/execution-log.md`.

Three different readings are kept apart:

- Observed execution time is a duration the log itself records, such as a command duration or a test duration.
- An approximate elapsed window is the gap between two recorded clocks. It is not a measured work duration.
- Waiting for human approval is named only when the log identifies the gap as waiting and the preceding work has an end time. A gap that mixes unfinished work and waiting is not split.

| Phase | Recorded clocks | What the clocks support |
| --- | --- | --- |
| Planning pack | P-001 at 17:32. Duration unknown. | Work time was not measured. The result says it was waiting for approval. |
| Planning revision | P-004 starts at 17:57. End unknown. | The next dated entry is G0 at 18:31. Those 34 minutes mix revision work and waiting. |
| G0 corrections and planning commit | P-005 starts at 18:31, end unknown. P-006 is 18:33 to 18:33. | The commit is the same minute. No command duration was recorded. |
| Requirements | P-007 starts at 18:33:53 and was in hand before 18:38:34. | The return timestamp was not printed. This is an upper bound of under about 5 minutes, not a measured duration. |
| G1 | P-008 starts at 18:38, minute precision, and ends at 18:38:34. | Evaluation inside that minute. |
| Waiting for G2, then install | P-009 starts at 18:38:34. P-010 is 19:02:50 to 19:03:55. | 24 minutes 16 seconds from the manifest start to install. The manifest's own end was not recorded, so that gap is not pure waiting. The install window is 65 seconds of observed execution time. |
| Backend, frontend, first QA and security | Backend and frontend start after 19:03:55. The backend handoff quotes Vitest at 19:12:54. QA attempt 1 quotes Vitest at 19:16:25. QA attempt 2 quotes Vitest at 19:20:35. Security start and end are unknown. | Return timestamps were not printed. Parallel overlap was not measured. |
| Stop for the TRACE decision | Next recorded start is P-018 at 20:13. | From the 19:20:35 Vitest clock to 20:13 is 52 minutes 25 seconds. The QA attempt's end is unknown, so this includes both unfinished test time and the human wait. |
| Contract edit | P-018, 20:13 to 20:15. | The log calls this about 2 minutes. |
| Revised local acceptance | QA-002 Vitest at 20:16:31, duration 164 ms. QA-003 Vitest at 20:19:27, duration 165 ms. Playwright reported 19 passed in 6.2 s, and the shell duration was 11269 ms. P-021 is 20:21 to 20:21. | Those are measured test or evaluation times. They are not the whole phase. |
| Interval before G4 | P-021 at 20:21, then P-022 starts at 20:27:47. | About 7 minutes. The G4 approval message has no separate log timestamp, so this is not labeled as waiting only. |
| Preview | P-022, 20:27:47 to 20:36:18. | Elapsed 8 minutes 31 seconds. Measured pieces inside it: login 96671 ms, the first deploy command 34247 ms, the preview deploy command 20469 ms, and inspect build durations of 23 s and 14 s. The log says no single duration was measured for the whole project. |
| Publication | No execution-log start or end. | The commits exist. Their phase time is not in the log. |
| Vercel cleanup | P-023, 22:34 to 22:37:21. | About 3 minutes. The start is minute precision, and the log says it was not one measured command. |

The remediation report separately records orchestrator checks from 22:14:02 to 22:14:16 and a QA run whose Vitest started at 22:15:30. Those clocks are not execution-log phase entries, so they are not added to the table above.

## Native evidence and parallelism

The original `artifacts/native/` files contain human-readable agent task results saved by the orchestrator. They are not complete raw execution traces. Actual parallel execution overlap cannot be independently measured from those files. Backend and frontend were launched in the same parent turn, and the first QA attempt was launched with the security reviewer. The task tool did not return start and end timestamps for both sides of those pairs.

## Cost

Every execution-log entry records token usage and cost as `unavailable`. No billing total was shown to the agent. No token count or API spending figure is estimated here.

## Engineer return

`docs/workflow-design.md` and `.cursor/skills/failure-recovery/SKILL.md` define the route: a failed unit or smoke test is sent back to the owning engineer and counts as that engineer's retry. The original run did not use it. The port conflicts stayed environment failures. The TRACE result was `framework_mismatch`, the log stopped for a human, and no handler was added. D-015 was a human contract change. The later backend and frontend tasks, BE-002 and FE-002, added audit tests. They were not a return of the original failing run.

## MCP

The matcher reads `data/candidates.json` and `data/jobs.json`. Tests are Vitest and Playwright. The preview used the Vercel CLI, `curl.exe`, and a browser load recorded in `artifacts/qa/preview-check.md`. No MCP server is a data source or an application dependency. `AGENTS.md` notes that a subagent inherits the parent's tools, including MCP. That availability was not required for the seed, the score, or the tests.

## Integration approval

The recorded gate is a human authorizing a commit or push. The planning commit is `a3f6ed7`, the implementation commit is `d0e72a3`, the documentation commit is `60af5a4`, and the remediation commit is `5edcf59`. Each was pushed to `master` on the existing repository. The workflow does not include a pull-request review or a merge gate, and this run did not exercise one.

## Two periods

The one-day execution is P-001 through P-022: planning, implementation, the preserved TRACE failure, QA-003 with 19 Playwright tests, and the G4 preview. Publication of `d0e72a3` and `60af5a4` came after G4 and is not part of the preview gate.

The later period is the independent audit and remediation in `5edcf59`: filter and `PROPFIND` tests, QA-004 with 24 Playwright tests, the remediation security review, and P-023. Those tests do not change the original QA-003 count, and they do not mark the TRACE failure as a pass.
