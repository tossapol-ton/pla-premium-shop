import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

// Tests WIPE this database (prisma db seed). Default: a local Postgres database
// named pla_e2e. Override with E2E_DATABASE_URL. Never point it at production.
const TEST_DATABASE_URL =
  process.env.E2E_DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/pla_e2e";
if (/supabase\.(co|com)/.test(TEST_DATABASE_URL)) {
  throw new Error("E2E_DATABASE_URL points at Supabase. Tests wipe the database — use a local/test database.");
}

export const E2E_ADMIN_PASSWORD = "e2e-admin-password";

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
    env: {
      DATABASE_URL: TEST_DATABASE_URL,
      DIRECT_URL: TEST_DATABASE_URL,
      ADMIN_PASSWORD: E2E_ADMIN_PASSWORD,
    },
    reuseExistingServer: false,
    timeout: 180_000,
    stdout: "pipe",
  },
});
