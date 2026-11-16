import { describe, expect, it } from 'vitest'
import { clientRegisterSchema, loginSchema, providerRegisterSchema } from '@/features/auth/schemas'
import { hireServiceSchema } from '@/features/hiring/schemas'
import { createServiceSchema } from '@/features/services/schemas'
import { todayIso } from '@/lib/validators'

const errorPaths = (result) => result.error?.issues.map((issue) => issue.path.join('.')) ?? []

const validClient = {
  name: 'João da Conceição',
  email: 'joao@teste.com.br',
  cpf: '529.982.247-25',
  phone: '(11) 98765-4321',
  gender: 'masculino',
  password: 'senhaForte1',
  confirmPassword: 'senhaForte1',
  acceptTerms: true,
}

describe('login', () => {
  it('exige e-mail válido e senha', () => {
    const result = loginSchema.safeParse({ email: 'joao', password: '' })
    expect(errorPaths(result)).toEqual(['email', 'password'])
  })

  it('remove espaços do e-mail', () => {
    const result = loginSchema.safeParse({ email: '  joao@teste.com ', password: 'x' })
    expect(result.data.email).toBe('joao@teste.com')
  })
})

describe('cadastro de cliente', () => {
  it('aceita dados válidos com acento', () => {
    expect(clientRegisterSchema.safeParse(validClient).success).toBe(true)
  })

  it('exige nome e sobrenome', () => {
    const result = clientRegisterSchema.safeParse({ ...validClient, name: 'João' })
    expect(errorPaths(result)).toContain('name')
  })

  it('rejeita CPF com dígito errado', () => {
    const result = clientRegisterSchema.safeParse({ ...validClient, cpf: '529.982.247-24' })
    expect(errorPaths(result)).toContain('cpf')
  })

  it('exige senha com 8+ caracteres, letra e número', () => {
    for (const password of ['abc123', 'somenteletras', '12345678']) {
      const result = clientRegisterSchema.safeParse({
        ...validClient,
        password,
        confirmPassword: password,
      })
      expect(errorPaths(result)).toContain('password')
    }
  })

  it('aponta senhas diferentes no campo de confirmação', () => {
    const result = clientRegisterSchema.safeParse({
      ...validClient,
      confirmPassword: 'outraSenha1',
    })
    expect(errorPaths(result)).toEqual(['confirmPassword'])
  })

  it('exige aceitar os termos', () => {
    const result = clientRegisterSchema.safeParse({ ...validClient, acceptTerms: false })
    expect(errorPaths(result)).toContain('acceptTerms')
  })
})

describe('cadastro de prestador', () => {
  const file = { size: 1024 }
  const validProvider = {
    ...validClient,
    specialties: ['eletrica'],
    experience: '5_10',
    serviceRadiusKm: '10',
    cep: '04696-000',
    neighborhood: 'Santo Amaro',
    bio: 'Eletricista com 10 anos de experiência.',
    document: [file],
  }

  it('aceita dados válidos', () => {
    expect(providerRegisterSchema.safeParse(validProvider).success).toBe(true)
  })

  it('exige especialidade, CEP válido e documento', () => {
    const result = providerRegisterSchema.safeParse({
      ...validProvider,
      specialties: [],
      cep: '0469',
      document: [],
    })
    expect(errorPaths(result)).toEqual(expect.arrayContaining(['specialties', 'cep', 'document']))
  })

  it('rejeita documento acima de 5 MB', () => {
    const result = providerRegisterSchema.safeParse({
      ...validProvider,
      document: [{ size: 5 * 1024 * 1024 + 1 }],
    })
    expect(errorPaths(result)).toContain('document')
  })
})

describe('contratação', () => {
  const valid = {
    date: todayIso(),
    period: 'tarde',
    cep: '04696-000',
    street: 'Rua Ação',
    number: '10',
    neighborhood: 'Santo Amaro',
    details: 'Torneira pingando na cozinha.',
    paymentMethod: 'pix',
  }

  it('aceita a data de hoje', () => {
    expect(hireServiceSchema.safeParse(valid).success).toBe(true)
  })

  it('rejeita data no passado', () => {
    const result = hireServiceSchema.safeParse({ ...valid, date: '2020-01-01' })
    expect(errorPaths(result)).toContain('date')
  })

  it('contato de confiança: telefone exige nome e formato válido', () => {
    const semNome = hireServiceSchema.safeParse({ ...valid, emergencyPhone: '(11) 98765-4321' })
    expect(errorPaths(semNome)).toContain('emergencyName')

    const telefoneCurto = hireServiceSchema.safeParse({
      ...valid,
      emergencyName: 'Ana',
      emergencyPhone: '(11) 9',
    })
    expect(errorPaths(telefoneCurto)).toContain('emergencyPhone')
  })
})

describe('cadastro de serviço', () => {
  const valid = {
    category: 'eletrica',
    type: 'Instalação de tomadas',
    title: 'Tomadas novas',
    description: 'Instalação de tomadas no padrão novo.',
    price: '150.50',
    priceUnit: 'servico',
    includes: 'Visita\n\n  Garantia  ',
  }

  it('converte valor para número e itens inclusos para lista', () => {
    const result = createServiceSchema.safeParse(valid)
    expect(result.data.price).toBe(150.5)
    expect(result.data.includes).toEqual(['Visita', 'Garantia'])
  })

  it('rejeita valor zero, negativo ou vazio', () => {
    for (const price of ['0', '-10', '']) {
      expect(errorPaths(createServiceSchema.safeParse({ ...valid, price }))).toContain('price')
    }
  })
})
