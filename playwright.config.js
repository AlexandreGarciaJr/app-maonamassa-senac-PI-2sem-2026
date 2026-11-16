import { defineConfig, devices } from '@playwright/test'

/**
 * Testes E2E dos fluxos críticos (ver qa/PLANO-DE-TESTES.md).
 * Usa o Microsoft Edge instalado no sistema (channel: 'msedge'), sem baixar navegadores.
 * Rode com: npm run test:e2e
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never', outputFolder: 'qa/playwright-report' }], ['list']],
  outputDir: 'qa/test-results',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  },
  projects: [
    {
      name: 'celular',
      use: { ...devices['Pixel 7'], channel: 'msedge' },
    },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'npm run dev -- --port 5173 --strictPort',
        url: 'http://localhost:5173',
        reuseExistingServer: !process.env.CI,
      },
})
