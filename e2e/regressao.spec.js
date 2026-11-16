import { expect, test } from '@playwright/test'
import { login } from './helpers'

// Testes de regressão dos bugs corrigidos (ver qa/bugs/).

test('BUG-002: título longo não causa rolagem lateral em 320 px', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 320, height: 640 } })
  const page = await context.newPage()
  await login(page, 'prestador')
  await page.goto('/prestador/servicos/novo')
  await page.getByText('Elétrica', { exact: true }).click()
  await page.getByLabel('Tipo de serviço').selectOption({ index: 1 })
  await page.getByLabel('Título do serviço').fill('Instalação' + 'x'.repeat(60))
  await page.getByLabel('Descrição').fill('Descrição suficientemente longa para passar.')
  await page.getByLabel('Valor (R$)').fill('100')
  await page.getByRole('button', { name: 'Publicar Serviço' }).click()
  await expect(page).toHaveURL(/\/servicos\/s-/)

  for (const path of ['/servicos', '/']) {
    await page.goto(path)
    await expect(page.getByText(/Instalaçãoxxx/).first()).toBeVisible()
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    )
    expect(overflow, `rolagem lateral em ${path}`).toBe(false)
  }
  await context.close()
})

test('BUG-003: falha de rede mostra erro de conexão, não "página não encontrada"', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Categorias' })).toBeVisible()
  await page.route(/AgendaPage/, (route) => route.abort())
  await page.getByRole('link', { name: 'Agenda' }).click()
  await expect(page.getByText('Não foi possível abrir esta tela.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Tentar novamente' })).toBeVisible()
  await expect(page.getByText('Página não encontrada.')).toHaveCount(0)
})

test('BUG-003: endereço inexistente continua mostrando "página não encontrada"', async ({
  page,
}) => {
  await page.goto('/rota-que-nao-existe')
  await expect(page.getByText('Página não encontrada.')).toBeVisible()
})

test('BUG-005: painel prende o foco e devolve ao botão que abriu', async ({ page }) => {
  await login(page, 'cliente')
  await page.goto('/agenda')
  const opener = page.getByRole('button', { name: /Botão de segurança/ })
  await opener.focus()
  await page.keyboard.press('Enter')
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()

  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab')
    const inside = await dialog.evaluate((node) => node.contains(document.activeElement))
    expect(inside, `foco saiu do painel no Tab ${i + 1}`).toBe(true)
  }

  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(opener).toBeFocused()
})

test('BUG-001: prestador não vê a confirmação de solicitação de outro cliente', async ({
  page,
}) => {
  await login(page, 'prestador')
  await page.goto('/contratacoes/OS-100231/confirmacao')
  await expect(page.getByText('Solicitação não encontrada.')).toBeVisible()
})
