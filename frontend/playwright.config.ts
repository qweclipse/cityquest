import { defineConfig, devices } from "@playwright/test";

const port = process.env.CITYQUEST_E2E_PORT ?? "3010";
const hostedBaseURL = process.env.CITYQUEST_E2E_BASE_URL;
const baseURL = hostedBaseURL ?? `http://127.0.0.1:${port}`;

export default defineConfig({
  expect: {
    timeout: 10_000,
  },
  fullyParallel: true,
  reporter: [["list"]],
  testDir: "./tests",
  timeout: 60_000,
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: hostedBaseURL
    ? undefined
    : {
        command: `npm run start -- -p ${port}`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        url: baseURL,
      },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
