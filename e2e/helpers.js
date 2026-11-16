import { expect } from '@playwright/test'

/** Contas de demonstração do seed (src/mocks/data/users.js). */
export const ACCOUNTS = {
  cliente: { email: 'cliente@maonamassa.dev', password: '123456' },
  prestador: { email: 'prestador@maonamassa.dev', password: '123456' },
}

export async function login(page, role) {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill(ACCOUNTS[role].email)
  await page.getByLabel('Senha', { exact: true }).fill(ACCOUNTS[role].password)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).not.toHaveURL(/\/login/)
}

/** Data de amanhã no formato do input type="date". */
export function tomorrowIso() {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date.toLocaleDateString('en-CA')
}
