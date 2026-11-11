# Architecture

Planning proposal for a local Next.js app. Nothing in this file has been implemented or executed as a test. The fixture numbers were checked with a one-off `node` expression during planning. That check is recorded in `docs/execution-log.md`. It is not a Vitest run.

## System

One Next.js App Router application. The browser talks only to same-origin route handlers. Route handlers read local JSON and call a pure scorer. The page renders the JSON it receives.

```text
Browser page
  -> GET /api/candidates
  -> GET /api/jobs
  -> GET /api/matches
       -> data/candidates.json
       -> data/jobs.json
       -> src/lib/match/score.ts
```

There is no database, no session, and no outbound product call.

## Why this shape

| Choice | Reason |
| --- | --- |
| App Router route handlers | Matches the requested Next.js stack and keeps the API beside the page. |
| Pure function in `src/lib/match` | Formula tests do not need HTTP or a browser. |
| JSON files | Three plus three records do not justify a database. |
| Scores computed only on the server | The page cannot drift from the tested formula. |
| Integer basis points | Two-decimal scores such as `76.67` are not exact binary floats. Tests compare integers and formatted strings. |
| No Zod, no UI kit | Avoids dependencies beyond the approved list. The validation surface is two query fields and a small JSON schema. |

Rejected options are in `docs/decisions.md`.

## Layout to create after approval

```text
data/candidates.json
data/jobs.json
src/types/domain.ts
src/lib/match/normalize.ts
src/lib/match/score.ts
src/lib/data/load.ts
src/app/layout.tsx
src/app/page.tsx
src/app/globals.css
src/app/api/candidates/route.ts
src/app/api/jobs/route.ts
src/app/api/matches/route.ts
tests/unit/score.test.ts
tests/unit/load.test.ts
tests/e2e/api.spec.ts
tests/e2e/matches.spec.ts
tests/e2e/error-retry.spec.ts
tests/qa/                 # only if QA must cover a gap
```

Configs created before feature work, and not edited by feature agents: `package.json`, lockfile, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `.gitignore`.

`.gitignore` must ignore `node_modules`, `.next`, `.vercel`, `test-results`, `playwright-report`, and `blob-report` before install. `.vercel` can hold a local project link. It stays uncommitted.

TypeScript `strict` is on. The scorer and loader are plain TypeScript with no React imports.

## Domain types

`src/types/domain.ts` exports constants and types only. No functions.

```ts
export const SKILL_WEIGHT = 70
export const EXPERIENCE_WEIGHT = 30
export const SCORE_SCALE = 10000

export type Candidate = {
  id: string
  name: string
  skills: string[]
  yearsExperience: number
}

export type Job = {
  id: string
  title: string
  requiredSkills: string[]
  minYearsExperience: number
}

export type MatchLabel = "Strong" | "Partial" | "Weak"

export type Match = {
  candidateId: string
  jobId: string
  candidateName: string
  jobTitle: string
  skillBasis: number
  experienceBasis: number
  overallBasis: number
  skill: string
  experience: string
  overall: string
  matchedSkills: string[]
  missingSkills: string[]
  label: MatchLabel
  explanation: string
}

export type MatchResponse = {
  formula: { skillWeight: 70; experienceWeight: 30; scale: 10000 }
  matches: Match[]
}

export type ErrorBody = {
  error: string
  code: "bad_request" | "not_found" | "seed_invalid"
}
```

## Seed

Synthetic data only. No contact details.

`data/candidates.json`

```json
[
  {
    "id": "cand-ada-okonkwo",
    "name": "Ada Okonkwo",
    "skills": ["TypeScript", "React", "Node.js", "Accessibility"],
    "yearsExperience": 6
  },
  {
    "id": "cand-mina-chen",
    "name": "Mina Chen",
    "skills": ["Python", "SQL", "Data modeling"],
    "yearsExperience": 3
  },
  {
    "id": "cand-jordan-hale",
    "name": "Jordan Hale",
    "skills": ["React", "CSS", "Figma"],
    "yearsExperience": 1
  }
]
```

`data/jobs.json`

```json
[
  {
    "id": "job-frontend-engineer",
    "title": "Frontend Engineer",
    "requiredSkills": ["TypeScript", "React", "CSS"],
    "minYearsExperience": 3
  },
  {
    "id": "job-fullstack-engineer",
    "title": "Full Stack Engineer",
    "requiredSkills": ["TypeScript", "React", "Node.js"],
    "minYearsExperience": 4
  },
  {
    "id": "job-data-analyst",
    "title": "Data Analyst",
    "requiredSkills": ["Python", "SQL"],
    "minYearsExperience": 2
  }
]
```

## Scoring formula

Weights: required skills 70%, experience 30%. There is no third component.

### Normalization

For each skill string:

1. Trim the ends.
2. Collapse internal whitespace to one space.
3. Map ASCII `A-Z` to `a-z`. Leave every other character unchanged. Do not use locale case folding.

Equality after that is the only match. No synonyms, punctuation stripping, or partial credit. `Node.js` does not match `nodejs` or `node`.

Unique the job's required skills after normalization, keeping the first original string. Unique the candidate's skills the same way. Duplicates add no credit. Skills the candidate has that the job does not require add no credit.

### Integer rounding

All score math uses non-negative safe integers.

```text
divRoundHalfUp(numerator, denominator):
  q = floor(numerator / denominator)
  r = numerator % denominator
  if r * 2 >= denominator then q + 1 else q
```

`denominator` is greater than 0. This rounds halves away from zero for these non-negative inputs. `divRoundHalfUp(5, 2)` is 3. `divRoundHalfUp(1, 2)` is 1. `divRoundHalfUp(4, 2)` is 2.

### Components

`matchedCount` is the size of the intersection. `requiredCount` is the unique required-skill count.

```text
skillBasis = divRoundHalfUp(10000 * matchedCount, requiredCount)
experienceBasis =
  minYears == 0
    ? 10000
    : divRoundHalfUp(10000 * min(years, minYears), minYears)
overallBasis = divRoundHalfUp(70 * skillBasis + 30 * experienceBasis, 100)
```

`skillBasis`, `experienceBasis`, and `overallBasis` are integers from 0 through 10000.

The approved formula rounds `skillBasis` and `experienceBasis` first, then rounds the weighted sum of those already rounded integers. `formatBasis` splits that integer into a two-decimal string and does not round again. The trade-off is that `overallBasis` can differ from one rounding of an unrounded weighted ratio. Later remediation does not change this order.

Format a basis as a string without floating-point conversion:

```text
whole = floor(basis / 100)
fraction = basis % 100
string = whole + "." + two digits of fraction
```

`6667` formats as `66.67`. `10000` formats as `100.00`.

Meeting the experience minimum scores `10000`. Exceeding it still scores `10000`. A shortfall is linear. Negative, fractional, or non-finite years are seed errors, not clamped inputs. A job with zero required skills after unique-ing is a seed error.

### Labels

Labels are display text. They do not change sort order.

| overallBasis | Label |
| --- | --- |
| 8000 through 10000 | Strong |
| 6000 through 7999 | Partial |
| 0 through 5999 | Weak |

### Sort

1. `overallBasis` descending
2. `skillBasis` descending
3. `candidateId` ascending by UTF-16 code unit
4. `jobId` ascending by UTF-16 code unit

### Explanation

One sentence, built only from fields already computed:

```text
{name} matches {matchedCount} of {requiredCount} required skills for {title} and has {yearsExperience} years of experience against a minimum of {minYearsExperience}. Overall {overall} from skills {skill} (weight 70) and experience {experience} (weight 30). Missing: {missing}.
```

`missing` is `none` or the original required-skill strings that did not match, in job order, separated by `, `.

`matchedSkills` uses the job's original casing, in job order.

### Fixture table

Planning calculation for the seed above. Not a test result.

| Pair | skillBasis | experienceBasis | overallBasis | overall | Label |
| --- | --- | --- | --- | --- | --- |
| cand-ada-okonkwo / job-fullstack-engineer | 10000 | 10000 | 10000 | 100.00 | Strong |
| cand-mina-chen / job-data-analyst | 10000 | 10000 | 10000 | 100.00 | Strong |
| cand-ada-okonkwo / job-frontend-engineer | 6667 | 10000 | 7667 | 76.67 | Partial |
| cand-jordan-hale / job-frontend-engineer | 6667 | 3333 | 5667 | 56.67 | Weak |
| cand-jordan-hale / job-fullstack-engineer | 3333 | 2500 | 3083 | 30.83 | Weak |
| cand-ada-okonkwo / job-data-analyst | 0 | 10000 | 3000 | 30.00 | Weak |
| cand-mina-chen / job-frontend-engineer | 0 | 10000 | 3000 | 30.00 | Weak |
| cand-mina-chen / job-fullstack-engineer | 0 | 7500 | 2250 | 22.50 | Weak |
| cand-jordan-hale / job-data-analyst | 0 | 5000 | 1500 | 15.00 | Weak |

The two `30.00` rows tie on overall and skill basis. `cand-ada-okonkwo` sorts before `cand-mina-chen`.

Worked example, Ada Okonkwo and Frontend Engineer: 2 of 3 skills, so `divRoundHalfUp(20000, 3) = 6667`. Experience 6 against a minimum of 3 scores `10000`. Overall `divRoundHalfUp(70 * 6667 + 30 * 10000, 100) = divRoundHalfUp(766690, 100) = 7667`.

## Loader

`src/lib/data/load.ts` reads `data/candidates.json` and `data/jobs.json` from the process working directory with `fs`. It does not use the request id as a path.

Reject the seed, with code `seed_invalid`, when:

- JSON is not an array of objects with the required fields
- an id does not match `^[a-z0-9-]{1,64}$` or is duplicated
- a name or title is empty or longer than 80 characters
- a skill string is empty or longer than 40 characters
- years are not integers in 0 through 60
- a job has no required skills after unique-ing
- either file has fewer than 1 or more than 20 records

The approved seed is inside these bounds. The upper bound stops a replaced file from scoring a large cross product. It is not an invitation to add records.

## API

Each route module exports `GET` only. The app does not export `HEAD`, `OPTIONS`, `POST`, `PUT`, `PATCH`, or `DELETE`. Next.js fills some of those in. Calling the `GET` function from a unit test does not show that behavior. Method checks run against the running server.

This matrix is from Next.js source read on 2026-11-11, not from a run of this app. `auto-implement-methods.ts` on the Next.js canary branch starts every unimplemented method at `405` with a null body, then replaces `HEAD` and `OPTIONS`. `http.ts` in the same tree lists the method tokens `GET`, `HEAD`, `OPTIONS`, `POST`, `PUT`, `DELETE`, and `PATCH`. Those seven methods are the blocking contract. `TRACE` is documented under "Known framework limitation: TRACE" and is not an acceptance requirement.

| Request | Who answers | Expected result |
| --- | --- | --- |
| `GET /api/candidates` | Application | 200 and the candidate array. 500 `seed_invalid` if the seed fails. |
| `GET /api/jobs` | Application | 200 and the job array. 500 `seed_invalid` if the seed fails. |
| `GET /api/matches` | Application | 200 and `MatchResponse`, or 400, 404, or 500 as below. |
| `HEAD` on those paths | Framework, by calling the `GET` handler | Same status as `GET` for that URL. Body empty. Node strips the body when the request method is `HEAD`. |
| `OPTIONS` on those paths | Framework | 204, empty body, `Allow: GET, HEAD, OPTIONS`. Query parameters are not validated because `GET` does not run. |
| `POST`, `PUT`, `PATCH`, `DELETE` | Framework | 405, empty body. No `ErrorBody` and no `code`. |

`GET /api/matches` query:

- No query: all pairs.
- `candidateId`: that candidate against every job.
- `jobId`: that job against every candidate.
- Both: one pair.
- Any other query key, an empty value, or a value that fails `^[a-z0-9-]{1,64}$`: 400 `bad_request`.
- A well-formed id that is not in the seed: 404 `not_found`. The body `error` string says whether the candidate, the job, or both are missing, without echoing the raw value if it failed the pattern. Well-formed misses may echo the id.

500 bodies use `error: "Seed data is invalid"` and `code: "seed_invalid"`. They do not include a stack, file path, or exception text.

The response `formula` object repeats the constants so the page can show the weights it was served.

## Page

One route, `/`.

- Title: Job Match.
- Disclaimer, visible as text: `Fictional profiles for a proof of concept. Scores are a deterministic skills-and-experience formula, not a hiring decision.`
- A candidate select and a job select. Each has an "All" option and the loaded records. Controls have visible labels.
- Changing a select requests `/api/matches` with the corresponding query.
- A table in server order. Columns: candidate, job, overall, skill, experience, label, missing skills.
- The label text is present, not color alone.
- Loading copy: `Loading matches`.
- Empty `matches` array copy: `No matches`.
- Failed request: when the response JSON contains `code`, show that code as text. When the request fails without that JSON, show the text `Request failed`. A button labeled `Try again` repeats the same request.
- No client-side recomputation of basis points.

Styling is one global stylesheet, system fonts, and a simple stacked layout. No component library.

## Tests to write after approval

Vitest, node environment, no browser:

- helper rounding cases listed above
- each fixture row's three basis integers and formatted strings
- normalization, duplicates, and `Node.js` versus `nodejs`
- experience above the minimum
- minimum years of 0
- sort tie between the two `30.00` rows
- loader rejection for a duplicate id, a non-integer year, and an empty required-skill list

Playwright, `retries: 0`, base URL `http://127.0.0.1:3000`, against `next start` after a build. `next dev` is for local construction only.

`tests/e2e/matches.spec.ts` (frontend):

- open `/`
- see the disclaimer
- see 9 match rows
- see `100.00` for Ada Okonkwo / Full Stack Engineer and for Mina Chen / Data Analyst

`tests/e2e/error-retry.spec.ts` (frontend):

- intercept `/api/matches` and return 500 with `code: "seed_invalid"`
- see that code and a `Try again` button
- remove the intercept, activate `Try again`, and see the 9 match rows

`tests/e2e/api.spec.ts` (backend), through the server:

- `GET /api/candidates` and `GET /api/jobs` return 200 and the three seed records
- `GET /api/matches` returns 200, nine pairs, and formula weights 70 and 30
- `GET /api/matches?extra=1` returns 400 `bad_request`
- `GET /api/matches?candidateId=not-a-real-id` returns 404 `not_found`
- `HEAD /api/candidates` returns 200 with an empty body
- `OPTIONS /api/matches` returns 204 and `Allow: GET, HEAD, OPTIONS`
- `POST` and `DELETE` on `/api/matches` return 405 with an empty body

That is the blocking HTTP suite. It does not add routes or fields.

## Known framework limitation: TRACE

`TRACE` is outside the supported HTTP methods for this Next.js route-handler POC. On 2026-11-11, QA attempt 2 sent `TRACE /api/matches` to Next.js 16.4.6. The server returned HTTP 500 and logged `TypeError: 'TRACE' HTTP method is unsupported.` The spec expected 400. That run failed and is preserved in `artifacts/failures/QA-001-attempt-2.md` and `docs/execution-log.md`. It is not an acceptance pass.

The application does not add a method filter or a `TRACE` handler. The human approved that limit on 2026-11-11. See D-015 in `docs/decisions.md`.

The HTTP 500 is also a client restriction. The Fetch `Request` constructor rejects `TRACE` before Next.js can apply its 400 response for a method token outside `GET`, `HEAD`, `OPTIONS`, `POST`, `PUT`, `PATCH`, and `DELETE`. The server log was `TypeError: 'TRACE' HTTP method is unsupported.` `PROPFIND` is a method the client can send. A post-implementation test on 2026-11-11 observed HTTP 400 and an empty body for `PROPFIND /api/matches`. That observation does not mark the original TRACE failure as a pass.

## Preview

After local QA and security review pass, and after the human approves gate G4, the orchestrator deploys a Vercel preview. The deployment steps and the rule for recording the URL are in `docs/workflow-design.md`.

Planning state: this section was written before a preview existed.

Implementation result: G4 verified https://jobmatch-p4vvrid11-freds-projects-6ef41a64.vercel.app. The checks are in `artifacts/qa/preview-check.md`.

Post-implementation: the remediation did not deploy again.

## Security boundaries in the design

- Ids are filtered in memory after the whole JSON is loaded.
- No `dangerouslySetInnerHTML`.
- No CORS wideners and no remote image hosts.
- No secrets in the repo, client bundle, or logs.
- Direct dependencies stay on the approved list. The security reviewer reads the lockfile after install.
- The Vercel deploy is an orchestrator step. Application code still calls only its own origin.
- Vercel tokens and `.vercel` local link files stay out of the repo and the logs.
