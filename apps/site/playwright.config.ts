import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:3000";

const offlineServerEnv = {
  SEMANTIC_MANIFEST_OFFLINE: "1",
  NEXT_PUBLIC_SITE_URL: baseURL,
};

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run start",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: offlineServerEnv,
  },
});
