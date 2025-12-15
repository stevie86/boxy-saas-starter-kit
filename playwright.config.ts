import { PlaywrightTestConfig, devices } from '@playwright/test';

const config: PlaywrightTestConfig = {
  workers: 1,
  // Removed globalSetup as it caused issues
  // Timeout per test
  timeout: 120 * 1000,
  // Assertion timeout
  expect: {
    timeout: 30 * 1000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  reporter: 'html',
  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
  retries: 1,
  use: {
    headless: true,
    ignoreHTTPSErrors: true,
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-first-failure',
    navigationTimeout: 60 * 1000, // New: Add navigation timeout
  },
  testDir: './tests/e2e/auth', // Point to the specific test directory
};

export default config;
