import { expect, test } from "@playwright/test"

type MatchRow = {
  candidateName: string
  jobTitle: string
  overall: string
  skill: string
  experience: string
  label: string
  missingSkills: string[]
}

test("shows API skill, experience, label, and missing skills on each row", async ({
  page,
  request,
}) => {
  const response = await request.get("/api/matches")
  expect(response.status()).toBe(200)
  const body = (await response.json()) as { matches: MatchRow[] }
  expect(body.matches.length).toBeGreaterThan(0)
  expect(body.matches.some((match) => match.missingSkills.length > 0)).toBe(true)

  await page.goto("/")

  const rows = page.locator("tbody tr")
  await expect(rows).toHaveCount(body.matches.length)

  for (const [index, match] of body.matches.entries()) {
    expect(match.skill).not.toBe("")
    expect(match.experience).not.toBe("")
    expect(match.overall).not.toBe("")
    expect(match.label).not.toBe("")

    const cells = rows.nth(index).locator("td")
    await expect(cells).toHaveCount(7)
    await expect(cells.nth(0)).toHaveText(match.candidateName)
    await expect(cells.nth(1)).toHaveText(match.jobTitle)
    await expect(cells.nth(2)).toHaveText(match.overall)
    await expect(cells.nth(3)).toHaveText(match.skill)
    await expect(cells.nth(4)).toHaveText(match.experience)
    await expect(cells.nth(5)).toHaveText(match.label)
    await expect(cells.nth(6)).toHaveText(match.missingSkills.join(", "))
  }
})
