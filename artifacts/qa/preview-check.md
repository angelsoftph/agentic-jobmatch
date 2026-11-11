# Preview check

- status: pass
- checked: 2026-11-11 20:34 to 20:36 +08:00
- url: https://jobmatch-p4vvrid11-freds-projects-6ef41a64.vercel.app
- deployment id: dpl_2rkSWN7UuCfBjTSo842fmiZz7For
- target: preview
- command that created it: `vercel deploy --yes --target preview`
- that command did not include `--prod`

`vercel inspect` reported target `preview`, status Ready, created Wed Nov 11 2026 20:34:05 GMT+0800, build duration 14s. No alias was listed.

Public `curl.exe` requests, without a Vercel token, returned:

- `GET /` status 200. The HTML contained `Fictional profiles for a proof of concept. Scores are a deterministic skills-and-experience formula, not a hiring decision.`
- `GET /api/candidates` status 200. Body length 331. Three records: Ada Okonkwo, Mina Chen, Jordan Hale.
- `GET /api/jobs` status 200. Body length 370. Three records: Frontend Engineer, Full Stack Engineer, Data Analyst.
- `GET /api/matches` status 200. A follow-up parse printed `match-count 9`, `score100 Ada Okonkwo | Full Stack Engineer | 100.00`, and `score100 Mina Chen | Data Analyst | 100.00`.
- `GET /api/matches?candidateId=cand-ada-okonkwo` status 200. Parsed count 3. The page later showed Ada Okonkwo against Full Stack Engineer `100.00`, Frontend Engineer `76.67`, and Data Analyst `30.00`.
- `GET /api/matches?jobId=job-data-analyst` status 200. Parsed count 3. The page later showed Mina Chen `100.00`, Ada Okonkwo `30.00`, and Jordan Hale `15.00`, all for Data Analyst.
- `GET /api/matches?extra=1` status 400. Body `{"error":"Bad request","code":"bad_request"}`.
- `POST /api/matches` status 405. Body length 0.
- `OPTIONS /api/matches` status 204. `allow GET, HEAD, OPTIONS`. Body length 0.
- `HEAD /api/candidates` status 200. Body length 0.

The seed records came back from the deployed functions, so `data/candidates.json` and `data/jobs.json` were available to the serverless reads.

`vercel logs dpl_2rkSWN7UuCfBjTSo842fmiZz7For --since 30m --level error` printed `No logs found`. The same command without `--level error` listed 13 info lines for this host, including `GET /`, `GET /api/candidates`, `GET /api/jobs`, `GET /api/matches`, `POST /api/matches`, `OPTIONS /api/matches`, and `HEAD /api/candidates`. No error line was in that list.

The browser loaded the same URL. The disclaimer was visible. The table had 9 rows, including both `100.00` pairs. Choosing Ada Okonkwo left 3 rows. Choosing Ada Okonkwo and Data Analyst left 1 row, `Ada Okonkwo | Data Analyst | 30.00`. Choosing only Data Analyst left 3 rows, with Mina Chen at `100.00`.

## Earlier deployment

`vercel deploy --yes --target preview` at 20:30:13 +08:00, after `vercel link --yes --scope freds-projects-6ef41a64`, returned `"target": "production"` for `https://jobmatch-pc5zury76-freds-projects-6ef41a64.vercel.app`. The command did not include `--prod`. Inspect listed aliases `https://jobmatch-brown-three.vercel.app` and `https://jobmatch-freds-projects-6ef41a64.vercel.app`. Both aliases were removed. That URL is not the verified preview.
