import { beforeEach, describe, expect, it } from 'vitest'
import { authMock, hiringMock, servicesMock } from '@/mocks/handlers'

beforeEach(() => localStorage.clear())

describe('regras de status da Agenda (contrato que o backend deve seguir)', () => {
  it('prestador aceita solicitação aguardando', async () => {
    const updated = await hiringMock.updateStatus('OS-100240', 'confirmado', { role: 'prestador' })
    expect(updated.status).toBe('confirmado')
  })

  it('cliente não pode aceitar no lugar do prestador', async () => {
    await expect(
      hiringMock.updateStatus('OS-100240', 'confirmado', { role: 'cliente' }),
    ).rejects.toMatchObject({ status: 400 })
  })

  it('não permite concluir algo que ainda aguarda o prestador', async () => {
    await expect(
      hiringMock.updateStatus('OS-100240', 'concluido', { role: 'cliente' }),
    ).rejects.toMatchObject({ status: 400 })
  })

  it('cliente conclui um serviço confirmado', async () => {
    const updated = await hiringMock.updateStatus('OS-100231', 'concluido', { role: 'cliente' })
    expect(updated.status).toBe('concluido')
  })

  it('não altera um serviço já concluído', async () => {
    await expect(
      hiringMock.updateStatus('OS-099870', 'cancelado', { role: 'cliente' }),
    ).rejects.toMatchObject({ status: 400 })
  })

  it('cada perfil vê só as próprias solicitações', async () => {
    const cliente = await hiringMock.listMine({ userId: 'u1', role: 'cliente' })
    const prestador = await hiringMock.listMine({ userId: 'p1', role: 'prestador' })
    expect(cliente.every((request) => request.clientId === 'u1')).toBe(true)
    expect(prestador.every((request) => request.service.providerId === 'p1')).toBe(true)
    expect(prestador.map((request) => request.id)).not.toContain('OS-100231')
  })

  it('só o cliente dono e o prestador do serviço veem a solicitação (BUG-001, IDOR)', async () => {
    // OS-100231: cliente u1, serviço s3 (prestadora p2)
    await expect(hiringMock.getById('OS-100231', { userId: 'u1' })).resolves.toBeTruthy()
    await expect(hiringMock.getById('OS-100231', { userId: 'p2' })).resolves.toBeTruthy()
    await expect(hiringMock.getById('OS-100231', { userId: 'p1' })).rejects.toMatchObject({
      status: 404,
    })
    await expect(hiringMock.getById('OS-100231', {})).rejects.toMatchObject({ status: 404 })
  })
})

describe('busca de serviços', () => {
  it('ignora acentos e maiúsculas na busca', async () => {
    const result = await servicesMock.list({ search: 'INSTALACAO' })
    expect(result.map((service) => service.id)).toContain('s1')
  })

  it('filtra só profissionais mulheres e só verificados', async () => {
    const mulheres = await servicesMock.list({ womenOnly: true })
    const verificados = await servicesMock.list({ verifiedOnly: true })
    expect(mulheres.every((service) => service.provider.gender === 'feminino')).toBe(true)
    expect(verificados.every((service) => service.provider.verified)).toBe(true)
    expect(verificados.length).toBeLessThan((await servicesMock.list()).length)
  })

  it('ordena por menor preço', async () => {
    const prices = (await servicesMock.list({ sort: 'price' })).map((service) => service.price)
    expect(prices).toEqual([...prices].sort((a, b) => a - b))
  })

  it('serviço inexistente retorna 404', async () => {
    await expect(servicesMock.getById('nao-existe')).rejects.toMatchObject({ status: 404 })
  })
})

describe('autenticação simulada', () => {
  it('não devolve a senha na sessão', async () => {
    const session = await authMock.login({ email: 'cliente@maonamassa.dev', password: '123456' })
    expect(session.user).not.toHaveProperty('password')
  })

  it('e-mail é comparado sem diferenciar maiúsculas', async () => {
    await expect(
      authMock.login({ email: 'CLIENTE@maonamassa.dev', password: '123456' }),
    ).resolves.toHaveProperty('token')
  })

  it('não permite cadastrar e-mail repetido', async () => {
    await expect(
      authMock.register({ role: 'cliente', email: 'cliente@maonamassa.dev', name: 'X Y' }),
    ).rejects.toMatchObject({ status: 400 })
  })

  it('não permite cadastrar CPF repetido (BUG-008)', async () => {
    const dados = {
      role: 'cliente',
      name: 'Ana Souza',
      cpf: '529.982.247-25',
      phone: '',
      gender: '',
    }
    await authMock.register({ ...dados, email: 'ana1@teste.com' })
    await expect(authMock.register({ ...dados, email: 'ana2@teste.com' })).rejects.toMatchObject({
      status: 400,
    })
  })

  it('perfil só altera campos permitidos', async () => {
    const user = await authMock.updateMe({ preferWomen: true, role: 'prestador' }, { userId: 'u1' })
    expect(user.preferWomen).toBe(true)
    expect(user.role).toBe('cliente')
  })
})
