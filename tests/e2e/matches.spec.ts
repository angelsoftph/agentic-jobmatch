import { expect, test, type Page } from "@playwright/test"

const DISCLAIMER =
  "Fictional profiles for a proof of concept. Scores are a deterministic skills-and-experience formula, not a hiring decision."

type ExpectedRow = {
  candidate: string
  job: string
  overall: string
}

async function expectRows(
  page: Page,
  expected: readonly ExpectedRow[],
): Promise<void> {
  const rows = page.locator("tbody tr")
  await expect(rows).toHaveCount(expected.length)

  for (const [index, row] of expected.entries()) {
    const cells = rows.nth(index).locator("td")
    await expect(cells.nth(0)).toHaveText(row.candidate)
    await expect(cells.nth(1)).toHaveText(row.job)
    await expect(cells.nth(2)).toHaveText(row.overall)
  }
}

test("shows the disclaimer and nine match rows", async ({ page }) => {
  await page.goto("/")

  await expect(page.getByText(DISCLAIMER, { exact: true })).toBeVisible()

  const rows = page.locator("tbody tr")
  await expect(rows).toHaveCount(9)

  const adaFullStack = rows
    .filter({ hasText: "Ada Okonkwo" })
    .filter({ hasText: "Full Stack Engineer" })
  await expect(adaFullStack).toHaveCount(1)
  await expect(adaFullStack.locator("td").nth(2)).toHaveText("100.00")

  const minaAnalyst = rows
    .filter({ hasText: "Mina Chen" })
    .filter({ hasText: "Data Analyst" })
  await expect(minaAnalyst).toHaveCount(1)
  await expect(minaAnalyst.locator("td").nth(2)).toHaveText("100.00")
})

test("filters matches from the candidate and job selects", async ({ page }) => {
  await page.goto("/")

  const candidateSelect = page.getByLabel("Candidate")
  const jobSelect = page.getByLabel("Job")
  await expect(
    candidateSelect.locator('option[value="cand-ada-okonkwo"]'),
  ).toHaveCount(1)
  await expect(jobSelect.locator('option[value="job-data-analyst"]')).toHaveCount(
    1,
  )

  await candidateSelect.selectOption({ value: "cand-ada-okonkwo" })
  await expectRows(page, [
    {
      candidate: "Ada Okonkwo",
      job: "Full Stack Engineer",
      overall: "100.00",
    },
    {
      candidate: "Ada Okonkwo",
      job: "Frontend Engineer",
      overall: "76.67",
    },
    {
      candidate: "Ada Okonkwo",
      job: "Data Analyst",
      overall: "30.00",
    },
  ])

  await candidateSelect.selectOption({ label: "All" })
  await expect(page.locator("tbody tr")).toHaveCount(9)

  await jobSelect.selectOption({ value: "job-data-analyst" })
  await expectRows(page, [
    {
      candidate: "Mina Chen",
      job: "Data Analyst",
      overall: "100.00",
    },
    {
      candidate: "Ada Okonkwo",
      job: "Data Analyst",
      overall: "30.00",
    },
    {
      candidate: "Jordan Hale",
      job: "Data Analyst",
      overall: "15.00",
    },
  ])

  await candidateSelect.selectOption({ value: "cand-ada-okonkwo" })
  await expectRows(page, [
    {
      candidate: "Ada Okonkwo",
      job: "Data Analyst",
      overall: "30.00",
    },
  ])
})
