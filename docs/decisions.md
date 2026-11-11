# Decision log

Decisions made during planning on 2026-11-11. No implementation followed from them.

On 2026-11-11 the human approved the architecture, scoring algorithm, agent roster, and parallel workflow in principle. G0 was not granted. The revision below applies the requested corrections. The scoring formula, seed data, and roster are unchanged.

## Planning record

Observed actions, in order:

1. Listed the workspace. The only files were inside `.git`. There was no `package.json`, source, or docs.
2. Read the local skill-authoring guide and the rule-authoring guide so agent and skill files would match Cursor's expected shape.
3. Fetched `https://cursor.com/docs/subagents`. The documented frontmatter fields are `name`, `description`, `model`, `readonly`, and `is_background`. There is no `tools` allowlist.
4. Ran `git status`. Git refused the repo: `.git` is owned by `BUILTIN\Administrators`, current user is `DESKTOP-JUV1MFN\kylle`. Git config was not changed. `safe.directory` was not bypassed.
5. Ran a one-off `node` expression to check the fixture arithmetic. Node completed and printed the basis integers recorded in `docs/architecture.md`. This was not a project test, and Vitest was not installed.
6. Wrote the first planning pack. No packages were installed. No application source was created. No specialist subagent was launched.
7. After human review, read Next.js route-handler source for `HEAD`, `OPTIONS`, and unimplemented methods, then revised the planning pack. Still no install, application code, commit, or deploy.

## D-001 Orchestrator stays in the parent session

Status: proposed.

The human talks to one coordinator. Cursor's nesting rule allows the parent to launch specialists and allows those specialists to launch children, but not a third level. A subagent named orchestrator would sit between the human and the workers without adding a skill the parent lacks.

Rejected: `.cursor/agents/orchestrator.md` as the coordinator. It would be versioned as a slash command, which is attractive, and it would still be able to launch the specialists. The extra agent is another context to brief, and a mistaken launch from inside a specialist would hit the nesting ceiling. `AGENTS.md` is the versioned definition instead.

## D-002 Keep QA and security as separate agents

Status: proposed.

The assessment asks for independent verification and a security review. They run together after implementation. QA may write a report and gap tests. Security is `readonly: true` and returns findings to the parent.

Rejected: one reviewer agent. Faster and cheaper, and it collapses the second parallel window and the read-only boundary.

Rejected: a separate test-writer plus a QA runner. That is a seventh role for a POC this small. The frontend writes the smoke spec. The backend writes unit tests. QA runs them and may add `tests/qa/**` only when an acceptance id has no evidence.

## D-003 Subagent frontmatter uses only documented fields

Status: proposed.

Each specialist file sets `name`, `description`, `model: inherit`, `readonly`, and `is_background: false`.

`inherit` avoids pinning a model the account might block. Cursor documents that a blocked or unavailable model is replaced. Pinning would also bill a different model than the parent without a reason on this POC.

`is_background: false` because gates need the result before the next step. Parallelism is two Task launches in one turn, which the subagent docs describe as concurrent foreground work.

Rejected: a `tools` key copied from Claude Code or the Agent SDK. It is not a documented Cursor subagent field. Putting it in frontmatter would look like an enforced allowlist and would not be one.

Tool limits beyond `readonly` are written in the agent body as instructions. `docs/workflow-design.md` states that Cursor does not enforce them.

## D-004 QA is not marked readonly

Status: proposed.

The security reviewer is `readonly: true`, which the docs describe as blocking file edits and state-changing shell commands. QA must run Vitest and Playwright. Those tools write caches and reports. Planning did not experiment with a readonly subagent, so it is not claimed that test commands would succeed under `readonly: true`.

QA is therefore `readonly: false`, with an instruction to write only `artifacts/qa/**` and `tests/qa/**`. The orchestrator checks that limit with a file snapshot. The check is a process control, not a platform permission.

Rejected: readonly QA, with the parent running every command. That would make the parent the verifier and would weaken AC-16.

## D-005 Integer basis points and half-up division

Status: proposed.

Scores are integers 0 through 10000, formatted to two decimal places with integer arithmetic. Weights are 70 and 30. Skill match is normalized exact equality. Experience caps at the minimum. Empty required skills and non-integer years are seed errors.

Rejected:

- IEEE floats compared with a tolerance. `76.67` is not exact in binary, so tests become fuzzy.
- Floor-only division. It biases every 2-of-3 skill match downward and is harder to explain as a percentage.
- Extra credit for unused skills or for years above the minimum. The brief gives required skills 70% and experience 30%, with no leftover weight.
- Fuzzy or synonym matching. It needs a dictionary and makes the fixture arguable.
- A third "preferred skills" weight. Out of scope for one day.

The fixture table in `docs/architecture.md` is the reference. Changing a weight requires a human decision and a new table.

## D-006 Server-side scoring, local JSON, no extra libraries

Status: proposed.

The page displays API strings. Data is two JSON files. Validation is hand-written. Styling is one stylesheet.

Rejected:

- Client-side scoring. Duplicates the formula.
- SQLite or Prisma. No operational gain for nine pairs.
- Zod and a component library. More install surface and review time.
- Pages Router. App Router is the current Next.js default and was requested via route handlers.
- An LLM ranker. The brief forbids an external model dependency and asks for a deterministic formula.

## D-007 Short sequential prefix, then two parallel windows

Status: proposed.

Requirements, seed, and types land before backend and frontend run together. They share `src/types/domain.ts`. Cursor's default is one working tree, and path limits are not enforced. A sequential prefix is cheaper than a merge.

Rejected: starting both feature agents immediately, both allowed to create types. That race is the likely way the parallel window corrupts the contract.

Rejected: worktrees for every agent as the default. Cursor supports isolated copies, and they are the escalation if a path conflict happens twice. They are not the default because the POC has only two writers with disjoint folders.

## D-008 Package install is a human gate

Status: proposed.

Direct dependencies, and no others: `next`, `react`, `react-dom`, `typescript`, `@types/node`, `@types/react`, `@types/react-dom`, `vitest`, `@playwright/test`.

Versions are whatever the registry resolves at install time, then the lockfile is the record. Planning did not guess versions.

Rejected: `create-next-app` during planning. It installs packages and generates application code, which this task forbids.

Transitive packages are accepted only as lockfile contents after G2, then read by the security reviewer. A new direct dependency still needs a human.

## D-009 Git trust stays a human action and blocks implementation

Status: revised during planning review. G0 still open.

Planning could not use Git. The orchestrator will not change Git config and will not pass `safe.directory`. The human fixes ownership or the safe-directory exception. Implementation does not start until `git status` works and the human has authorized the planning-baseline commit, and that commit exists.

Rejected: `git -c safe.directory=...` as a quiet bypass. The ownership check exists to stop a repo owned by someone else from influencing the user. This `.git` is owned by Administrators.

Rejected: starting the requirements architect while Git is still blocked and committing the plan later. The review requires the planning baseline to be committed before implementation.

## D-010 Cost is logged as unavailable

Status: unchanged in this revision. G0 still open.

The assessment asks for cost traceability. This session cannot read the billing ledger. The log has a cost field so a human can fill it later. Agents write `unavailable` rather than an estimate. Token counts are recorded only when the tool result shows them.

## D-011 Vercel preview after local acceptance

Status: proposed in this revision. Required by the planning review. G0 still open.

The assessment needs a live preview URL. After G3, gate G4 asks the human to approve one Vercel preview deploy. The CLI is not a project dependency. Production alias, custom domain, and `--prod` stay out of scope. The URL is written to `README.md` and `artifacts/run-summary.json` only after the page and API checks in `docs/workflow-design.md` pass.

Rejected: treating localhost as the preview. Rejected: deploying during planning. Rejected: inventing a `*.vercel.app` hostname before the CLI prints one.

## D-012 HTTP methods follow the framework

Status: proposed in this revision. Required because the first plan's "every non-GET is 405 JSON" does not match Next.js.

Route modules export `GET` only. Next.js canary source read on 2026-11-11 implements `HEAD` by calling `GET`, implements `OPTIONS` as 204 with `Allow: GET, HEAD, OPTIONS`, and returns 405 with an empty body for `POST`, `PUT`, `PATCH`, and `DELETE`. Those 405 responses are not application `ErrorBody` values. `method_not_allowed` is removed from the error type so tests do not expect a JSON code the framework does not send.

A method token outside the seven names is dispatched to `handleBadRequestResponse`. This session did not retrieve that function's body. The planning target is 400, confirmed by the integration test on the installed version.

Rejected: custom `HEAD` and `OPTIONS` handlers. They would duplicate the framework and add code without product behavior. Rejected: asserting 405 for `HEAD` or `OPTIONS`. That assertion would fail on current Next.js.

## D-013 Submission files and native evidence

Status: proposed in this revision.

`docs/workflow-diagram.md`, `prompts/initial-task.md`, and `prompts/planning-review.md` are written in this revision from material that exists now. `docs/reflection.md` stays unfilled. `artifacts/run-summary.json` is not created until a run stops. Delegation prompts are saved at send time. A prompt that was not saved is marked `not preserved` rather than rewritten from memory.

## D-014 G0 corrections

Status: applied after the human approved G0 on 2026-11-11 18:31 UTC+8.

QA independently verifies AC-01 through AC-15. The orchestrator evaluates AC-16 only after the QA report and the security review both exist. The workflow diagram shows retry exhaustion flowing to human escalation. `docs/reflection.md` and `artifacts/run-summary.json` are completed when the run stops, including a failed execution or a failed preview.

Formula, seed, roster, and the parallel windows are unchanged.

## Open items that need a human

- G0 is approved. G0-git is the authorized planning-baseline commit, then stop at G2 for install approval.
- Approve the install manifest at G2.
- Approve Vercel authentication and one preview deploy after local QA (G4).
