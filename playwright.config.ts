import { defineConfig, devices } from '@playwright/test';
import { channel } from 'node:diagnostics_channel';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: './e2e-tests',
    /* Run tests in files in parallel */
    fullyParallel: !!process.env.CI,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: !process.env.CI ? 0 : 1,
    /* Opt out of parallel tests not on CI. */
    workers: !process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: 'html',
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: process.env['PLAYWRIGHT_TEST_BASE_URL'] ?? 'http://localhost:4200',

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
        headless: !!process.env.CI,
        launchOptions: {
            slowMo: !process.env.CI ? 1000 : undefined
        }
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },

        ...(!!process.env.CI ? [
            {
                name: 'webkit',
                use: { ...devices['Desktop Safari'] },
            },
            {
                name: 'firefox',
                use: { ...devices['Desktop Firefox'] },
            },
            {
                name: 'google-chrome',
                use: { ...devices['Desktop Chrome'], channel: 'chrome' },
            },
            {
                name: 'edge',
                use: { ...devices['Desktop Edge'], channel: 'msedge' },
            },
            // {
            //     name: 'Mobile Chrome',
            //     use: { ...devices['Pixel 5'] },
            //     },
            // {
            //     name: 'Mobile Safari',
            //     use: { ...devices['iPhone 12'] },
            // },
        ] : []),
    ],
});
