/**
 * Contas de demonstração para testar o app sem backend.
 * Senha de todas: 123456 (apenas para o modo mock; nunca use em produção).
 */
export const DEMO_PASSWORD = '123456'

export const USERS = [
  {
    id: 'u1',
    role: 'cliente',
    name: 'Mariana Oliveira',
    email: 'cliente@maonamassa.dev',
    phone: '(11) 98765-4321',
    gender: 'feminino',
    password: DEMO_PASSWORD,
  },
  {
    id: 'p1',
    role: 'prestador',
    name: 'Adeilson da Silva',
    email: 'prestador@maonamassa.dev',
    phone: '(11) 91234-5678',
    gender: 'masculino',
    password: DEMO_PASSWORD,
  },
]
