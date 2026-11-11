import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "tests",
  testMatch: ["e2e/**/*.spec.ts", "qa/**/*.spec.ts"],
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:3210",
  },
  webServer: {
    command: "npm run build && npx next start -p 3210",
    url: "http://127.0.0.1:3210",
    timeout: 180000,
    reuseExistingServer: false,
  },
})
