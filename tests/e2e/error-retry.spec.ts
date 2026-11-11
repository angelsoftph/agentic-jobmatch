import { expect, test } from "@playwright/test"

test("shows seed_invalid and loads nine rows after Try again", async ({
  page,
}) => {
  const isMatchesUrl = (url: URL) => url.pathname === "/api/matches"

  await page.route(isMatchesUrl, async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({
        error: "Seed data is invalid",
        code: "seed_invalid",
      }),
    })
  })

  await page.goto("/")

  await expect(page.getByText("seed_invalid", { exact: true })).toBeVisible()
  const tryAgain = page.getByRole("button", { name: "Try again", exact: true })
  await expect(tryAgain).toBeVisible()

  await page.unroute(isMatchesUrl)
  await tryAgain.click()

  await expect(page.locator("tbody tr")).toHaveCount(9)
})
