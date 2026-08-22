import { defineConfig, devices, type PlaywrightTestConfig } from "@playwright/test";

const externalBaseUrl = process.env.PLAYWRIGHT_BASE_URL?.trim();
const baseURL = externalBaseUrl || "http://127.0.0.1:3000";

const offlineServerEnv = {
  SEMANTIC_MANIFEST_OFFLINE: "1",
  SEMANTIC_MANIFEST_USE_LOCAL: "1",
  NEXT_PUBLIC_SITE_URL: baseURL,
};

const bypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim();
const extraHTTPHeaders = bypassSecret
  ? {
      "x-vercel-protection-bypass": bypassSecret,
      "x-vercel-set-bypass-cookie": "true",
    }
  : undefined;

const config: PlaywrightTestConfig = {
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    ...(extraHTTPHeaders ? { extraHTTPHeaders } : {}),
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
};

// Remote CI (deployed preview): do not start a local Next server.
// Local / fork fallback: keep the existing webServer developer experience.
if (!externalBaseUrl) {
  config.webServer = {
    command: "npm run start",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: offlineServerEnv,
  };
}

export default defineConfig(config);
