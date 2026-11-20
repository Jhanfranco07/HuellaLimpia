import { defineConfig, devices } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';

for (const file of ['.env.local', '.env.demo.local']) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = /^([A-Z][A-Z0-9_]*)=(.*)$/.exec(line);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
  }
}

export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://127.0.0.1:3000', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], channel: process.env.CI ? undefined : 'chrome' } },
    { name: 'mobile', use: { ...devices['iPhone 13'], browserName: 'chromium', channel: process.env.CI ? undefined : 'chrome' } },
  ],
  webServer: { command: 'npm run start -- --hostname 127.0.0.1', url: 'http://127.0.0.1:3000', reuseExistingServer: !process.env.CI, timeout: 30_000 },
});
