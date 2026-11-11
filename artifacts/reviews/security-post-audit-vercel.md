# Post-audit Vercel protection decision

- status: recorded after the authorized cleanup
- date: 2026-11-11 22:37 +08:00
- project: `jobmatch` (`prj_i8S35UlK7zHJET5sb9eQIFGCkWqU`)
- scope: `freds-projects-6ef41a64`

This file is a new record. It does not replace `artifacts/reviews/security-review.md` or `artifacts/reviews/security-review-remediation.md`, and it does not rewrite `docs/execution-log.md` entry P-022.

## Decision

On 2026-11-11 the human reviewed the Vercel protection findings and accepted public access for this project. The project is a dedicated, disposable proof of concept with fictional seed data, no authentication, and no production secrets.

This is a new human-approved risk acceptance. It does not authorize the earlier project-wide SSO disable. That command remains unapproved at the time it was run. P-022 records "Disabled project SSO." `prompts/g4-approval.md` does not name Deployment Protection. The high finding in `artifacts/reviews/security-review-remediation.md` stays as written.

The accepted public access is intentionally limited to this public POC. It is not a setting to copy to another project, and it is not a Vercel Deployment Protection Exception object. SSO was not enabled during this operation.

## What was done

1. Confirmed `dpl_5ivwshQAPh9LYLGv3Xp3Cq9jd7mV` before removal. The API returned that id, project `jobmatch`, target `production`, URL `jobmatch-pc5zury76-freds-projects-6ef41a64.vercel.app`, and state Ready. `vercel remove` was then run with that deployment id only. The CLI reported one deployment removed: `jobmatch-pc5zury76-freds-projects-6ef41a64.vercel.app`. The project was not removed.
2. Left `dpl_2rkSWN7UuCfBjTSo842fmiZz7For` in place. No new deployment was created.
3. Revoked the one automation protection-bypass secret on this project. Its value was not printed or written here. Before revocation it had scope `automation-bypass`, `isEnvVar` true, `createdAt` `1794400381378` (`2026-11-11 20:33:01 +08:00`), and the creator matched the logged-in Vercel user. That time is inside the G4 window in P-022 (`20:27:47` to `20:36:18 +08:00`). The project `env` list was null. No application file references the bypass. After revocation the project had zero protection-bypass entries.
4. Did not run an alias or domain command. Did not enable SSO. Did not change application code.

## Results

Checked at 2026-11-11 22:37:21 +08:00.

- `vercel ls jobmatch` lists one deployment: `https://jobmatch-p4vvrid11-freds-projects-6ef41a64.vercel.app`, Ready, Preview.
- `vercel inspect dpl_5ivwshQAPh9LYLGv3Xp3Cq9jd7mV` returns "Can't find the deployment".
- `GET /v13/deployments/dpl_2rkSWN7UuCfBjTSo842fmiZz7For` returns that id, URL `jobmatch-p4vvrid11-freds-projects-6ef41a64.vercel.app`, state Ready, and no alias hostnames. The deployment list classifies it as Preview.
- Unauthenticated `curl.exe` of `https://jobmatch-p4vvrid11-freds-projects-6ef41a64.vercel.app/` returned HTTP 200 and the page contains "Fictional profiles for a proof of concept". `GET /api/candidates` returned HTTP 200 and 3 candidates. No credential was sent.
- Unauthenticated requests to `https://jobmatch-pc5zury76-freds-projects-6ef41a64.vercel.app/`, `https://jobmatch-brown-three.vercel.app/`, and `https://jobmatch-freds-projects-6ef41a64.vercel.app/` each returned HTTP 404.
- `ssoProtection` is still null. `protectionBypass` count is 0.

## What this does not change

The original SR-002 finding remains open as a historical finding: project SSO was disabled on 2026-11-11 without a separate approval. The later risk acceptance explains why public access remains for this POC. It does not mark that earlier command as authorized.
