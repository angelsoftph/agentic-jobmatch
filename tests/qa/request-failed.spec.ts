import { expect, test } from "@playwright/test"

test("shows Request failed when the matches response has no JSON code", async ({
  page,
}) => {
  const isMatchesUrl = (url: URL) => url.pathname === "/api/matches"

  await page.route(isMatchesUrl, async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "text/plain",
      body: "upstream unavailable",
    })
  })

  await page.goto("/")

  await expect(page.getByText("Request failed", { exact: true })).toBeVisible()
  await expect(page.getByRole("button", { name: "Try again", exact: true })).toBeVisible()
  await expect(page.getByText("seed_invalid", { exact: true })).toHaveCount(0)
})
