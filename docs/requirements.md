# Requirements

`docs/architecture.md` is normative. This file restates that behavior for implementation. If this file and the architecture document disagree, stop at gate G1.

Acceptance ids are AC-01 through AC-17, defined in `docs/scope.md` and repeated in `docs/acceptance-criteria.md`. QA verifies AC-01 through AC-15. The orchestrator evaluates AC-16. AC-17 is the preview gate. No id is marked passed. No test was run to produce this file. Fixture numbers below are the expected values from the architecture document, not observed test output.

Seed records live in `data/candidates.json` and `data/jobs.json`. Constants and types live in `src/types/domain.ts`. That module exports constants and types only. It exports no functions.

## Product

One Next.js App Router application. The browser talks only to same-origin route handlers. Route handlers read the local JSON and call a pure scorer. The page renders the JSON it receives. There is no database, no session, and no outbound product call.

```text
Browser page
  -> GET /api/candidates
  -> GET /api/jobs
  -> GET /api/matches
       -> data/candidates.json
       -> data/jobs.json
       -> src/lib/match/score.ts
```

The loader is `src/lib/data/load.ts`. Scores are computed only on the server. The page does not recompute them (AC-11).

Out of scope: production hosting, a Vercel production alias, accounts, authentication, real personal data, external LLM APIs, embeddings, fuzzy match, synonym tables, databases, queues, file upload, email, third-party SaaS, create/update/delete of candidates or jobs, preferred-skill weights, location, salary, seniority titles, free-text search, a component library, a CSS framework, an extra validation library, and mobile-native apps. The approved seed is the only seed.

## Domain constants and types

`src/types/domain.ts` exports:

- `SKILL_WEIGHT` = 70
- `EXPERIENCE_WEIGHT` = 30
- `SCORE_SCALE` = 10000
- `Candidate`, `Job`, `MatchLabel`, `Match`, `MatchResponse`, and `ErrorBody` as written in `docs/architecture.md`

`MatchLabel` is `"Strong"`, `"Partial"`, or `"Weak"`.

`MatchResponse.formula` is `{ skillWeight: 70, experienceWeight: 30, scale: 10000 }`.

`ErrorBody.code` is `"bad_request"`, `"not_found"`, or `"seed_invalid"`. HTTP 405 responses are not `ErrorBody` and include no `code`.

`Candidate` fields are `id`, `name`, `skills`, and `yearsExperience`. `Job` fields are `id`, `title`, `requiredSkills`, and `minYearsExperience`. No other score component and no other seed field is in the contract.

## Seed (AC-01)

Synthetic data only. No contact details. Exactly three candidates and three jobs.

| id | name | skills | yearsExperience |
| --- | --- | --- | --- |
| cand-ada-okonkwo | Ada Okonkwo | TypeScript, React, Node.js, Accessibility | 6 |
| cand-mina-chen | Mina Chen | Python, SQL, Data modeling | 3 |
| cand-jordan-hale | Jordan Hale | React, CSS, Figma | 1 |

| id | title | requiredSkills | minYearsExperience |
| --- | --- | --- | --- |
| job-frontend-engineer | Frontend Engineer | TypeScript, React, CSS | 3 |
| job-fullstack-engineer | Full Stack Engineer | TypeScript, React, Node.js | 4 |
| job-data-analyst | Data Analyst | Python, SQL | 2 |

Skill strings, ids, names, titles, and year values match `docs/architecture.md` and the JSON files. The names are fictional labels.

## Scoring formula (AC-04, AC-05, AC-06, AC-07)

Weights: required skills 70%, experience 30%. There is no third component. All score math uses non-negative safe integers. `skillBasis`, `experienceBasis`, and `overallBasis` are integers from 0 through 10000.

### Normalization (AC-05)

For each skill string:

1. Trim the ends.
2. Collapse internal whitespace to one space.
3. Map ASCII `A-Z` to `a-z`. Leave every other character unchanged. Do not use locale case folding.

Equality after that is the only match. No synonyms, punctuation stripping, or partial credit. `Node.js` does not match `nodejs` or `node`.

Unique the job's required skills after normalization, keeping the first original string. Unique the candidate's skills the same way. Duplicates add no credit. Skills the candidate has that the job does not require add no credit.

`matchedCount` is the size of the intersection. `requiredCount` is the unique required-skill count.

### Integer rounding (AC-07)

```text
divRoundHalfUp(numerator, denominator):
  q = floor(numerator / denominator)
  r = numerator % denominator
  if r * 2 >= denominator then q + 1 else q
```

`denominator` is greater than 0. This rounds halves away from zero for these non-negative inputs.

Required helper results from the architecture document:

- `divRoundHalfUp(5, 2)` is 3
- `divRoundHalfUp(1, 2)` is 1
- `divRoundHalfUp(4, 2)` is 2

Implement this function once and call it. Do not inline a different rounding rule.

### Components (AC-06)

```text
skillBasis = divRoundHalfUp(10000 * matchedCount, requiredCount)
experienceBasis =
  minYears == 0
    ? 10000
    : divRoundHalfUp(10000 * min(years, minYears), minYears)
overallBasis = divRoundHalfUp(70 * skillBasis + 30 * experienceBasis, 100)
```

Meeting the experience minimum scores `10000`. Exceeding it still scores `10000`. A shortfall is linear. A minimum of 0 scores the full experience component. Negative, fractional, or non-finite years are seed errors, not clamped inputs. A job with zero required skills after unique-ing is a seed error.

Format a basis as a string without floating-point conversion:

```text
whole = floor(basis / 100)
fraction = basis % 100
string = whole + "." + two digits of fraction
```

`6667` formats as `66.67`. `10000` formats as `100.00`. The `skill`, `experience`, and `overall` strings use this format on `skillBasis`, `experienceBasis`, and `overallBasis`.

### Labels

Labels are display text. They do not change sort order.

| overallBasis | Label |
| --- | --- |
| 8000 through 10000 | Strong |
| 6000 through 7999 | Partial |
| 0 through 5999 | Weak |

### Sort

`GET /api/matches` with no query returns all 9 pairs in this order (AC-03):

1. `overallBasis` descending
2. `skillBasis` descending
3. `candidateId` ascending by UTF-16 code unit
4. `jobId` ascending by UTF-16 code unit

The two `30.00` rows tie on overall and skill basis. `cand-ada-okonkwo` sorts before `cand-mina-chen`.

### Explanation

One sentence, built only from fields already computed:

```text
{name} matches {matchedCount} of {requiredCount} required skills for {title} and has {yearsExperience} years of experience against a minimum of {minYearsExperience}. Overall {overall} from skills {skill} (weight 70) and experience {experience} (weight 30). Missing: {missing}.
```

`missing` is `none` or the original required-skill strings that did not match, in job order, separated by `, `.

`matchedSkills` uses the job's original casing, in job order. `missingSkills` is those unmatched original required-skill strings in job order.

### Fixture table (AC-04)

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

Worked example, Ada Okonkwo and Frontend Engineer: 2 of 3 skills, so `divRoundHalfUp(20000, 3) = 6667`. Experience 6 against a minimum of 3 scores `10000`. Overall `divRoundHalfUp(70 * 6667 + 30 * 10000, 100) = divRoundHalfUp(766690, 100) = 7667`.

The same helper produces a below-half result on `divRoundHalfUp(10000, 3) = 3333` and an above-half result on `divRoundHalfUp(20000, 3) = 6667`. Those inputs are already in the fixture math. This requirement does not add another numeric case.

## Loader (AC-09)

`src/lib/data/load.ts` reads `data/candidates.json` and `data/jobs.json` from the process working directory with `fs`. It does not use the request id as a path. Ids are filtered in memory after the whole JSON is loaded.

Reject the seed, with code `seed_invalid`, when:

- JSON is not an array of objects with the required fields
- an id does not match `^[a-z0-9-]{1,64}$` or is duplicated
- a name or title is empty or longer than 80 characters
- a skill string is empty or longer than 40 characters
- years are not integers in 0 through 60
- a job has no required skills after unique-ing
- either file has fewer than 1 or more than 20 records

The approved seed is inside these bounds. The upper bound stops a replaced file from scoring a large cross product. It is not an invitation to add records.

A seed failure on the API is HTTP 500 with `error: "Seed data is invalid"` and `code: "seed_invalid"`. The body does not include a stack, file path, or exception text.

The scorer does not read the clock, random values, or the network.

## API (AC-02, AC-03, AC-08)

Each route module exports `GET` only. The app does not export `HEAD`, `OPTIONS`, `POST`, `PUT`, `PATCH`, or `DELETE`. Next.js fills some of those in. Calling the `GET` function from a unit test does not show that behavior. Method checks run against the running server.

| Request | Who answers | Expected result |
| --- | --- | --- |
| `GET /api/candidates` | Application | 200 and the candidate array. 500 `seed_invalid` if the seed fails. |
| `GET /api/jobs` | Application | 200 and the job array. 500 `seed_invalid` if the seed fails. |
| `GET /api/matches` | Application | 200 and `MatchResponse`, or 400, 404, or 500 as below. |
| `HEAD` on those paths | Framework, by calling the `GET` handler | Same status as `GET` for that URL. Body empty. |
| `OPTIONS` on those paths | Framework | 204, empty body, `Allow: GET, HEAD, OPTIONS`. Query parameters are not validated because `GET` does not run. |
| `POST`, `PUT`, `PATCH`, `DELETE` | Framework | 405, empty body. No `ErrorBody` and no `code`. |

`TRACE` is outside this contract. The observed HTTP 500 on Next.js 16.4.6 is recorded in `artifacts/failures/QA-001-attempt-2.md` and is not an acceptance pass. Do not add a handler for it.

`GET /api/matches` query:

- No query: all pairs, in the sort order above.
- `candidateId`: that candidate against every job.
- `jobId`: that job against every candidate.
- Both: one pair.
- Any other query key, an empty value, or a value that fails `^[a-z0-9-]{1,64}$`: 400 `bad_request`.
- A well-formed id that is not in the seed: 404 `not_found`. The body `error` string says whether the candidate, the job, or both are missing, without echoing the raw value if it failed the pattern. Well-formed misses may echo the id.

400 and 404 JSON bodies have `error` and `code`, and omit stacks and filesystem paths.

The response `formula` object repeats the constants so the page can show the weights it was served.

The UI option "All" omits that side's query key. Sending an empty value is `bad_request`, so "All" is not an empty `candidateId` or `jobId`.

## Page (AC-10, AC-11, AC-12)

One route, `/`.

- Title: Job Match.
- Disclaimer, visible as text: `Fictional profiles for a proof of concept. Scores are a deterministic skills-and-experience formula, not a hiring decision.`
- A candidate select and a job select. Each has an "All" option and the loaded records. Controls have visible labels.
- Changing a select requests `/api/matches` with the corresponding query. "All" omits that key, as stated in the API section.
- A table in server order. Columns: candidate, job, overall, skill, experience, label, missing skills.
- The label text is present, not color alone.
- Loading copy: `Loading matches`.
- Empty `matches` array copy: `No matches`.
- Failed request: when the response JSON contains `code`, show that code as text. When the request fails without that JSON, show the text `Request failed`. A button labeled `Try again` repeats the same request.
- No client-side recomputation of basis points. Displayed `overall`, `skill`, and `experience` are the API strings.

Styling is one global stylesheet, system fonts, and a simple stacked layout. No component library. No `dangerouslySetInnerHTML`. No CORS wideners and no remote image hosts.

## Dependencies and data handling (AC-13, AC-14)

Application code does not call external hosts. It calls only its own origin.

Direct dependencies are limited to `next`, `react`, `react-dom`, `typescript`, `@types/node`, `@types/react`, `@types/react-dom`, `vitest`, and `@playwright/test`, plus what the lockfile records after the approved install. No Zod and no UI kit.

The repo contains no secrets, credentials, or real personal data. Secrets stay out of the client bundle and the logs. Vercel tokens and `.vercel` local link files stay out of the repo and the logs.

TypeScript `strict` is on. The scorer and loader are plain TypeScript with no React imports.

`.gitignore` must ignore `node_modules`, `.next`, `.vercel`, `test-results`, `playwright-report`, and `blob-report` before install.

## Verification ownership (AC-15, AC-16, AC-17)

QA verifies AC-01 through AC-15 from commands actually run. The log quotes that output. No test result is claimed before the output exists.

Vitest, node environment, no browser, covers the helper rounding cases listed above, each fixture row's three basis integers and formatted strings, normalization, duplicates, `Node.js` versus `nodejs`, experience above the minimum, minimum years of 0, the sort tie between the two `30.00` rows, and loader rejection for a duplicate id, a non-integer year, and an empty required-skill list.

Playwright uses `retries: 0` and base URL `http://127.0.0.1:3000`, against `next start` after a build. `next dev` is for local construction only.

- `tests/e2e/api.spec.ts` covers AC-02, AC-03, and AC-08 through the server.
- `tests/e2e/matches.spec.ts` covers AC-10 for the disclaimer, the 9-row result, and the two `100.00` pairs (Ada Okonkwo / Full Stack Engineer, and Mina Chen / Data Analyst).
- `tests/e2e/error-retry.spec.ts` covers AC-12, including the retry click: intercept `/api/matches` with 500 and `code: "seed_invalid"`, see that code and `Try again`, remove the intercept, activate `Try again`, and see the 9 match rows. A failure without that JSON still shows `Request failed` and the same button.

AC-16 is evaluated by the orchestrator after the QA report and the security review both exist. QA does not assign AC-16. Pass requires a QA report for AC-01 through AC-15, a security review, no product-source edits by QA, and no open high finding. An open high finding stops for a human decision.

AC-17 is the preview gate. After local QA and security review, and after the human approves gate G4, the orchestrator deploys one Vercel preview. The verified preview URL in `README.md` and `artifacts/run-summary.json` is the URL that passed the G4 page and API checks. Until those checks pass, both say the preview is not deployed. Localhost is not a substitute preview URL. No preview URL exists yet.
