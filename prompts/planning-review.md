# Planning review

Source: human message in this chat, 2026-11-11 17:57 UTC+8. The body below is that message, unchanged.

---

PLANNING REVIEW — REVISIONS REQUIRED

I have reviewed the planning pack. The architecture,
scoring algorithm, agent roster, and parallel workflow
are approved in principle.

However, G0 is not yet granted.

Please make the following targeted planning corrections:

1. LIVE PREVIEW
The assessment explicitly requires a working application
with a live preview URL.

Remove preview deployment from the exclusions.

Add a human-approved G4 deployment gate after successful
local QA and security review.

Use Vercel preview deployment as the proposed approach.
Do not deploy or authenticate to Vercel yet.

Add post-deployment verification of the page and API.
Record the actual preview URL only after successful
deployment. Do not claim deployment success prematurely.

2. SUBMISSION ARTIFACTS
Explicitly plan for:
- docs/workflow-diagram.md (one-page Mermaid diagram)
- docs/reflection.md (completed after execution)
- prompts/initial-task.md
- prompts/delegations/
- artifacts/run-summary.json
- README.md with the verified preview URL and demo guide

Preserve original prompts where available. Do not
reconstruct prompts and present them as verbatim history.

3. API CONTRACT
Review GET-only behavior against Next.js Route Handlers.
Clarify handling of HEAD, OPTIONS, and unsupported methods.

Ensure our acceptance criteria describe actual,
testable framework and application behavior.

4. TEST COVERAGE
Add a small number of API integration tests covering:
- Successful endpoint responses
- Malformed query parameters
- Unknown IDs
- Unsupported HTTP methods

Add coverage of the page's error/retry behavior.

Keep testing proportional to the one-day time box.

5. OBSERVABILITY
Expand execution logging to include:
- Task ID
- Agent ID, when exposed
- Agent role
- Start/end timestamps and elapsed duration
- Input/output artifact paths
- Test and review results
- Retry count
- Model and token usage where actually available
- Actual cost or clearly labeled unavailable values

Preserve native agent execution evidence where possible.

Never fabricate traces, token usage, costs, or failures.

6. GIT
Keep Git ownership/trust resolution as a human action.
Do not bypass the security check.

Do not proceed to implementation until Git is usable
and the planning baseline has been committed with
human authorization.

7. TIME BOX
Keep the entire workflow achievable in one working day.
Do not add features to the application.

Maintain the existing scoring formula and seed data.
Do not change approved architectural decisions unless
required by these corrections.

UPDATE ONLY THE PLANNING DOCUMENTS AND DEFINITIONS.

Do not install packages, implement the application,
commit, or deploy.

After updating, summarize the changes and stop
for human G0 approval.
