# Security review

- status: high findings open
- task id: SR-002
- files read: `docs/architecture.md`, `docs/scope.md`, `.cursor/skills/acceptance-verification/SKILL.md`, `prompts/g4-approval.md`, `prompts/delegations/SR-002.md`, `artifacts/qa/preview-check.md`, `artifacts/reviews/security-review.md`, `artifacts/handoffs/BE-002.md`, `artifacts/failures/QA-001-attempt-2.md`, `docs/execution-log.md` (P-022), `package.json`, `package-lock.json` (root dependencies and the `fsevents` install-script entry), `src/app/api/matches/route.ts`, `src/app/api/candidates/route.ts`, `src/app/api/jobs/route.ts`, `src/app/api/respond.ts`, `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/globals.css`, `src/lib/data/load.ts`, `src/lib/match/score.ts`, `data/candidates.json`, `data/jobs.json`, `next.config.ts`, `.gitignore`, `tests/e2e/api.spec.ts`, `tests/e2e/matches.spec.ts`

Filed verbatim from the security reviewer return on 2026-11-11. This file does not replace `artifacts/reviews/security-review.md`.

## Findings

- severity: high
- location: recorded G4 project protection change. `docs/execution-log.md` P-022 records "Disabled project SSO." The command and the prior value are the G4 action supplied to this review: protection was read as `deploymentType` `all_except_custom_domains`, then `vercel project protection disable jobmatch --sso` set `ssoProtection` to false. `prompts/g4-approval.md` does not name that setting.
- evidence: The G4 approval authorizes one non-production preview, forbids `vercel --prod` and a production domain, and asks for a public check of that preview. It does not authorize a change to Deployment Protection. No separate approval for disabling SSO was found. `vercel project protection disable jobmatch --sso` is project-wide, so `ssoProtection: false` applies to every deployment of `jobmatch`, not only the verified preview `dpl_2rkSWN7UuCfBjTSo842fmiZz7For`. The same session had already created production-targeted deployment `dpl_5ivwshQAPh9LYLGv3Xp3Cq9jd7mV`. With project SSO off, deployments that the prior `all_except_custom_domains` rule covered are reachable without Vercel authentication. This review did not call Vercel and does not claim the setting's value as of this review.
- recommendation: Stop for a human decision before any further Vercel command. Restore project protection to the previously read mode, `deploymentType` `all_except_custom_domains` with SSO enabled, unless the human explicitly approves a different setting. Do not leave `ssoProtection: false` as the project default. If one preview must stay publicly checkable, approve a deployment-scoped exception for `dpl_2rkSWN7UuCfBjTSo842fmiZz7For` only, and remove that exception when the check is finished.

- severity: medium
- location: recorded first G4 deployment `dpl_5ivwshQAPh9LYLGv3Xp3Cq9jd7mV`, described in `docs/execution-log.md` P-022 and `artifacts/qa/preview-check.md`
- evidence: `vercel deploy --yes --target preview` at 20:30:13 +08:00 did not include `--prod` and still returned `"target": "production"` for `https://jobmatch-pc5zury76-freds-projects-6ef41a64.vercel.app`. Inspect listed aliases `https://jobmatch-brown-three.vercel.app` and `https://jobmatch-freds-projects-6ef41a64.vercel.app`. P-022 and the preview check record that both aliases were later removed and that this URL is not the verified preview. Nothing in those records says the deployment was deleted. The verified preview is the later deployment `dpl_2rkSWN7UuCfBjTSo842fmiZz7For`. This review did not inspect or delete the earlier deployment.
- recommendation: After the human approves a read-only check, inspect `dpl_5ivwshQAPh9LYLGv3Xp3Cq9jd7mV`. If it still exists, delete that deployment and confirm both aliases stay unassigned. Do not run `--prod`, do not recreate those aliases, and do not treat `jobmatch-pc5zury76-freds-projects-6ef41a64.vercel.app` as the preview. The public URL that passed the recorded checks remains `https://jobmatch-p4vvrid11-freds-projects-6ef41a64.vercel.app`.

## Empty severities

- high: see above
- medium: see above
- low: none

## Notes

A high finding is open. This review did not change Vercel settings, aliases, or deployments.

The test changes introduce no new application risk. `tests/e2e/api.spec.ts` adds a `PROPFIND /api/matches` request that expects HTTP 400 and an empty body. It does not send `TRACE`, and it does not add a route handler. `tests/e2e/matches.spec.ts` checks the existing candidate and job selects and compares rendered text with the API score strings. The route modules still export `GET` only. `src/app/api/matches/route.ts` still filters ids in memory after `^[a-z0-9-]{1,64}$` and reads only the fixed seed files. The `PROPFIND` expectation does not mark the preserved `TRACE` HTTP 500 as a pass. `docs/architecture.md` still records that limit under D-015.

Application posture is otherwise unchanged from SR-001. Direct dependencies remain the approved set. The only lockfile `hasInstallScript` entry is optional, Darwin-only `fsevents`. Scoring arithmetic remains in `src/lib/match/score.ts`. The page renders API strings as text and has no `dangerouslySetInnerHTML`. Seed names are the approved fictional profiles. Error responses for bad requests and invalid seed do not include exception text. A 404 may include a well-formed id, which the architecture allows. No authentication and local JSON remain the approved design. This review does not assign AC-13 or AC-14.
