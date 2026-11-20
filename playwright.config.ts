import { defineConfig, devices } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';

const port = process.env.E2E_PORT ?? '3000';

for (const file of ['.env.local', '.env.demo.local']) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = /^([A-Z][A-Z0-9_]*)=(.*)$/.exec(line);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

export default defineConfig({
  testDir: './e2e',
  workers: 2,
  use: { baseURL: `http://127.0.0.1:${port}`, trace: 'off' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], channel: process.env.CI ? undefined : 'chrome' } },
    { name: 'mobile', use: { ...devices['iPhone 13'], browserName: 'chromium', channel: process.env.CI ? undefined : 'chrome' } },
  ],
  webServer: { command: `npm run start -- --hostname 127.0.0.1 --port ${port}`, url: `http://127.0.0.1:${port}`, reuseExistingServer: !process.env.CI, timeout: 30_000 },
});
