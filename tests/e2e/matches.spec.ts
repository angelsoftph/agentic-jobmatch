import { expect, test } from "@playwright/test"

const DISCLAIMER =
  "Fictional profiles for a proof of concept. Scores are a deterministic skills-and-experience formula, not a hiring decision."

test("shows the disclaimer and nine match rows", async ({ page }) => {
  await page.goto("/")

  await expect(page.getByText(DISCLAIMER, { exact: true })).toBeVisible()

  const rows = page.locator("tbody tr")
  await expect(rows).toHaveCount(9)

  const adaFullStack = rows
    .filter({ hasText: "Ada Okonkwo" })
    .filter({ hasText: "Full Stack Engineer" })
  await expect(adaFullStack).toHaveCount(1)
  await expect(adaFullStack).toContainText("100.00")

  const minaAnalyst = rows
    .filter({ hasText: "Mina Chen" })
    .filter({ hasText: "Data Analyst" })
  await expect(minaAnalyst).toHaveCount(1)
  await expect(minaAnalyst).toContainText("100.00")
})
