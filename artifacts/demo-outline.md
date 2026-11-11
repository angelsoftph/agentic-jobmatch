# 25-minute demonstration outline

Use the verified preview `https://jobmatch-p4vvrid11-freds-projects-6ef41a64.vercel.app` and the files named below. Times are a speaking plan, not measured durations.

1. Minutes 0–3. Say what the POC is: three fictional people, three fictional jobs, skills 70% and experience 30%. Show `docs/architecture.md` for the formula and `docs/workflow-diagram.md` for the gates.
2. Minutes 3–7. Open the preview. Read the disclaimer. Show nine rows. Point to Ada Okonkwo / Full Stack Engineer `100.00` and Mina Chen / Data Analyst `100.00`.
3. Minutes 7–11. Use the Candidate select for Ada Okonkwo and show three rows. Use the Job select for Data Analyst and show three rows, including Mina Chen at `100.00`. Say the page displays the API strings.
4. Minutes 11–15. Open `GET /api/matches` from the same host. Show the nine-pair JSON and the same two `100.00` values. Mention `GET /api/matches?extra=1` returned 400 and `POST /api/matches` returned 405 during the preview check.
5. Minutes 15–19. Open `artifacts/failures/QA-001-attempt-2.md`. Say TRACE was expected to return 400 and the installed Next.js server returned 500. Say that failure is still a failure. Open D-015 in `docs/decisions.md` and say the human removed TRACE from the blocking suite.
6. Minutes 19–22. Show the QA-003 counts in `artifacts/qa/report.md`: Vitest 19 passed and Playwright 19 passed. Show `artifacts/reviews/security-review.md`: no high findings. Mention the port 3000 conflict was left alone and the suite ran on port 3210.
7. Minutes 22–25. Show `artifacts/qa/preview-check.md` and the README URL. Say the first deploy command came back as production even with `--target preview`, those aliases were removed, and the recorded URL is the preview deployment. Say cost and token usage were unavailable. Stop for questions. Do not claim a production domain or a pushed remote.
