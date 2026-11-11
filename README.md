# Cybergirls Job Match POC

A local Next.js proof of concept. Three fictional candidates are scored against three fictional jobs with a fixed formula: required skills 70%, experience 30%. The page shows the API scores. It does not compute a second score.

No application code is in this repo yet. Nothing has been deployed.

## Preview

Verified preview URL: not deployed.

This line is replaced only after gate G4 verification succeeds. A URL printed by the deploy command is not copied here until the page and API checks pass.

## Demo, after the app exists

Planned local commands, not yet created:

1. Install the approved dependencies and build the app.
2. Start it and open `http://127.0.0.1:3000`.
3. The page shows a fictional-data disclaimer and nine matches.
4. Ada Okonkwo / Full Stack Engineer and Mina Chen / Data Analyst show `100.00`.
5. The same scores are available from `GET /api/matches`.

The formula, seed, and HTTP matrix are in `docs/architecture.md`. The gate order is in `docs/workflow-diagram.md`.

## Status

Planning is waiting for human G0 approval. Implementation also waits until Git works in this checkout and the human authorizes the planning-baseline commit.
