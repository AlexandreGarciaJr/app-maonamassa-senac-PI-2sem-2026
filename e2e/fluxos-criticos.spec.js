import { expect, test } from '@playwright/test'
import { login, tomorrowIso } from './helpers'

// Cada teste roda num contexto novo do navegador: localStorage limpo, dados do seed.

test('1. home filtra serviços por categoria', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Encanador(a)' }).click()
  await expect(page.getByRole('heading', { name: 'Hidráulica' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Conserto de vazamentos/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /tomadas/i })).toHaveCount(0)
})

test('2. contratar sem login leva ao login e volta para a contratação', async ({ page }) => {
  await page.goto('/servicos/s3')
  await page.getByRole('link', { name: /Contratar Serviço/ }).click()
  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByText('Faça login para continuar a contratação.')).toBeVisible()

  await page.getByLabel('E-mail').fill('cliente@maonamassa.dev')
  await page.getByLabel('Senha', { exact: true }).fill('123456')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/servicos\/s3\/contratar/)
})

test('3. contratação valida campos e chega na confirmação', async ({ page }) => {
  await login(page, 'cliente')
  await page.goto('/servicos/s3/contratar')

  await page.getByRole('button', { name: /Enviar solicitação/ }).click()
  await expect(page.getByText('Escolha uma data.')).toBeVisible()
  await expect(page.getByText('Escolha a forma de pagamento.')).toBeVisible()

  await page.getByLabel('Data').fill(tomorrowIso())
  await page.getByText('Tarde', { exact: true }).click()
  await page.getByLabel('CEP').fill('04696000')
  await expect(page.getByLabel('CEP')).toHaveValue('04696-000')
  await page.getByLabel('Rua').fill('Av. Eng. Eusébio Stevaux')
  await page.getByLabel('Número').fill('823')
  await page.getByLabel('Bairro').fill('Santo Amaro')
  await page.getByLabel('Descreva o problema').fill('Torneira da cozinha pingando sem parar.')
  await page.getByText('Pix', { exact: true }).click()
  await page.getByRole('button', { name: /Enviar solicitação/ }).click()

  await expect(page).toHaveURL(/\/contratacoes\/OS-\d+\/confirmacao/)
  await expect(page.getByRole('heading', { name: 'Solicitação Enviada!' })).toBeVisible()
  await expect(page.getByText(/nenhum valor foi cobrado/)).toBeVisible()
})

test('4. cadastro de cliente bloqueia CPF inválido e aceita dados válidos', async ({ page }) => {
  await page.goto('/cadastro')
  await page.getByLabel('Nome completo').fill('Mariana da Conceição')
  await page.getByLabel('E-mail').fill('mariana.e2e@teste.com.br')
  await page.getByLabel('CPF').fill('11111111111')
  await page.getByLabel('Telefone').fill('11987654321')
  await page.getByLabel('Gênero').selectOption('feminino')
  await page.getByLabel('Senha', { exact: true }).fill('senhaForte1')
  await page.getByLabel('Confirmar senha').fill('senhaForte1')
  await page.getByLabel(/Li e aceito/).check()
  await page.getByRole('button', { name: 'Criar Conta' }).click()
  await expect(page.getByText('CPF inválido.')).toBeVisible()

  await page.getByLabel('CPF').fill('52998224725')
  await page.getByRole('button', { name: 'Criar Conta' }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByText('Conta criada com sucesso!')).toBeVisible()
  await expect(page.getByText('Mariana', { exact: true })).toBeVisible()
})

test('5. cadastro de prestador exige especialidade e documento', async ({ page }) => {
  await page.goto('/cadastro')
  await page.getByRole('radio', { name: 'Sou Prestador' }).click()
  await expect(page).toHaveURL(/tipo=prestador/)
  await page.getByRole('button', { name: 'Criar Conta' }).click()
  await expect(page.getByText('Selecione pelo menos uma especialidade.')).toBeVisible()
  await expect(page.getByText('Envie uma foto do seu documento com foto.')).toBeVisible()

  // Voltar para cliente limpa os erros do prestador
  await page.getByRole('radio', { name: 'Sou Cliente' }).click()
  await expect(page.getByText('Selecione pelo menos uma especialidade.')).toHaveCount(0)
})

test('6. agenda do cliente: botão de segurança e confirmar conclusão', async ({ page }) => {
  await login(page, 'cliente')
  await page.goto('/agenda')
  await expect(page.getByRole('tab', { name: 'Próximos (1)' })).toBeVisible()

  await page.getByRole('button', { name: /Botão de segurança/ }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByText(/Ana \(irmã\)/)).toBeVisible()
  await dialog.getByRole('button', { name: 'Avisar contato de confiança' }).click()
  await expect(dialog.getByRole('heading', { name: 'Contato avisado!' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)

  await page.getByRole('button', { name: 'Confirmar conclusão' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Confirmar conclusão' }).click()
  await expect(page.getByRole('tab', { name: 'Histórico (2)' })).toBeVisible()
})

test('7. agenda do prestador: aceitar solicitação recebida', async ({ page }) => {
  await login(page, 'prestador')
  await page.goto('/agenda')
  await expect(page.getByText('Cliente: Carlos Menezes')).toBeVisible()
  await page.getByRole('button', { name: 'Aceitar', exact: true }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Aceitar' }).click()
  await expect(page.getByText('Confirmado', { exact: true })).toBeVisible()
})

test('8. cliente não acessa o cadastro de serviço', async ({ page }) => {
  await login(page, 'cliente')
  await page.goto('/prestador/servicos/novo')
  await expect(page.getByText('Acesso restrito')).toBeVisible()
})

test('9. profissionais: filtros na URL e ordenação por preço', async ({ page }) => {
  await page.goto('/servicos?ordem=price')
  await expect(page.getByText('5 serviços encontrados')).toBeVisible()
  // Seleciona pelo texto do preço (não por classe CSS, que muda com o visual).
  const prices = await page.locator('section li').getByText(/^R\$/).allInnerTexts()
  const values = prices.map((text) => Number(text.replace(/[^\d,]/g, '').replace(',', '.')))
  expect(values.length).toBeGreaterThan(1)
  expect(values).toEqual([...values].sort((a, b) => a - b))

  await page.getByRole('button', { name: /Verificados/ }).click()
  await expect(page).toHaveURL(/verificados=1/)
  await expect(page.getByText('Roberto Alves')).toHaveCount(0)
})

test('10. perfil: preferência de gênero liga o filtro da home', async ({ page }) => {
  await login(page, 'cliente')
  await page.goto('/perfil')
  const toggle = page.getByRole('switch')
  await expect(toggle).toHaveAttribute('aria-checked', 'false')
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-checked', 'true')

  await page.getByRole('link', { name: 'Home' }).click()
  await expect(page.getByRole('button', { name: /Só profissionais mulheres/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})
