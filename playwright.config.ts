import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
// Tests use their own SQLite file so they never touch prisma/dev.db.
const TEST_DATABASE_URL = "file:./e2e.db";

export default defineConfig({
  testDir: "./e2e-test",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: "th-TH",
    timezoneId: "Asia/Bangkok",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Fresh schema + sample data, then start the app on a dedicated port.
    command: `npx prisma migrate deploy && npx prisma db seed && npx next dev --port ${PORT}`,
    url: `http://localhost:${PORT}/api/products`,
    env: { DATABASE_URL: TEST_DATABASE_URL },
    reuseExistingServer: false,
    timeout: 180_000,
    stdout: "pipe",
  },
});
