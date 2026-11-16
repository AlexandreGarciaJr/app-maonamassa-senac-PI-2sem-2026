/**
 * Implementações simuladas das APIs. Cada objeto aqui tem exatamente a mesma
 * assinatura da API real correspondente (ver features/*\/api). Quando o backend
 * estiver pronto, basta definir VITE_USE_MOCKS=false.
 */
import { HIRE_REQUESTS } from './data/hireRequests'
import { PROVIDERS } from './data/providers'
import { REVIEWS } from './data/reviews'
import { SERVICES } from './data/services'
import { USERS } from './data/users'
import { badRequest, createCollection, delay, newId, notFound, unauthorized } from './db'

const users = createCollection('users', USERS)
const services = createCollection('services', SERVICES)
const providers = createCollection('providers', PROVIDERS)
const hireRequests = createCollection('hire-requests', HIRE_REQUESTS)

/** Transições de status permitidas: quem pode mudar para qual status. */
const STATUS_RULES = {
  cancelado: { role: 'cliente', from: ['aguardando_prestador', 'confirmado'] },
  confirmado: { role: 'prestador', from: ['aguardando_prestador'] },
  recusado: { role: 'prestador', from: ['aguardando_prestador'] },
  concluido: { role: 'cliente', from: ['confirmado'] },
}

const publicUser = ({ password: _password, ...user }) => user
const createSession = (user) => ({ token: `mock-token-${user.id}`, user: publicUser(user) })

function withProvider(service) {
  const provider = providers.find((item) => item.id === service.providerId)
  const reviews = REVIEWS.filter((review) => review.providerId === service.providerId)
  return { ...service, provider, reviewsCount: reviews.length }
}

const normalize = (text = '') => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export const authMock = {
  async login({ email, password }) {
    await delay()
    const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase())
    if (!user || user.password !== password) throw unauthorized('E-mail ou senha incorretos.')
    return createSession(user)
  },

  async register({ role, ...data }) {
    await delay(700)
    if (users.find((item) => item.email.toLowerCase() === data.email.toLowerCase())) {
      throw badRequest('Já existe uma conta com este e-mail.')
    }
    if (data.cpf && users.find((item) => item.cpf === data.cpf)) {
      throw badRequest('Já existe uma conta com este CPF.')
    }
    const user = users.insert({
      id: newId(role === 'prestador' ? 'p' : 'u'),
      role,
      name: data.name,
      email: data.email,
      cpf: data.cpf,
      phone: data.phone,
      gender: data.gender,
      preferWomen: Boolean(data.preferWomen),
      password: data.password,
    })

    if (role === 'prestador') {
      providers.insert({
        id: user.id,
        name: user.name,
        gender: user.gender,
        specialties: data.specialties,
        verified: false, // verificação de documento fica pendente até análise
        rating: 0,
        jobsDone: 0,
        neighborhood: data.neighborhood,
        city: 'São Paulo',
        distanceKm: 0,
        memberSince: new Date().toISOString(),
        bio: data.bio,
      })
    }
    return createSession(user)
  },

  async updateMe(patch, { userId }) {
    await delay(400)
    const allowed = ['name', 'phone', 'preferWomen', 'womenOnly']
    const changes = Object.fromEntries(
      Object.entries(patch).filter(([key]) => allowed.includes(key)),
    )
    const user = users.update(userId, changes)
    if (!user) throw notFound('Usuário não encontrado.')
    return publicUser(user)
  },
}

const SORTERS = {
  rating: (a, b) => (b.provider?.rating ?? 0) - (a.provider?.rating ?? 0),
  price: (a, b) => a.price - b.price,
  distance: (a, b) => (a.provider?.distanceKm ?? 99) - (b.provider?.distanceKm ?? 99),
}

export const servicesMock = {
  async list({ search, category, womenOnly, verifiedOnly, providerId, sort, limit } = {}) {
    await delay()
    const term = normalize(search)
    let result = services
      .all()
      .map(withProvider)
      .filter((service) => !providerId || service.providerId === providerId)
      .filter((service) => !category || service.category === category)
      .filter((service) => !womenOnly || service.provider?.gender === 'feminino')
      .filter((service) => !verifiedOnly || service.provider?.verified)
      .filter(
        (service) =>
          !term ||
          normalize(`${service.title} ${service.type} ${service.provider?.name}`).includes(term),
      )
      .sort(SORTERS[sort] ?? SORTERS.rating)

    if (limit) result = result.slice(0, limit)
    return result
  },

  async getById(serviceId) {
    await delay()
    const service = services.find((item) => item.id === serviceId)
    if (!service) throw notFound('Serviço não encontrado.')
    return {
      ...withProvider(service),
      reviews: REVIEWS.filter((review) => review.providerId === service.providerId),
    }
  },

  async create(data, { providerId }) {
    await delay(700)
    return services.insert({
      id: newId('s'),
      providerId,
      ...data,
      createdAt: new Date().toISOString(),
    })
  },
}

const withService = (request) => {
  const service = services.find((item) => item.id === request.serviceId)
  return { ...request, service: service && withProvider(service) }
}

export const hiringMock = {
  /** Cliente: solicitações que fez. Prestador: solicitações recebidas nos seus serviços. */
  async listMine({ userId, role }) {
    await delay()
    return hireRequests
      .all()
      .map(withService)
      .filter((request) =>
        role === 'prestador' ? request.service?.providerId === userId : request.clientId === userId,
      )
      .sort((a, b) => a.date.localeCompare(b.date))
  },

  async updateStatus(requestId, status, { role }) {
    await delay(500)
    const request = hireRequests.find((item) => item.id === requestId)
    if (!request) throw notFound('Solicitação não encontrada.')
    const rule = STATUS_RULES[status]
    if (!rule || rule.role !== role || !rule.from.includes(request.status)) {
      throw badRequest('Esta ação não está disponível para esta solicitação.')
    }
    return withService(hireRequests.update(requestId, { status }))
  },

  async create({ serviceId, ...data }, { clientId, clientName }) {
    await delay(900)
    const service = services.find((item) => item.id === serviceId)
    if (!service) throw notFound('Serviço não encontrado.')

    return hireRequests.insert({
      id: `OS-${Date.now().toString().slice(-6)}`,
      serviceId,
      clientId,
      clientName,
      status: 'aguardando_prestador',
      createdAt: new Date().toISOString(),
      ...data,
    })
  },

  /** Só o cliente dono e o prestador do serviço podem ver (outro usuário recebe 404). */
  async getById(requestId, { userId } = {}) {
    await delay(300)
    const request = hireRequests.find((item) => item.id === requestId)
    const result = request && withService(request)
    const canSee = result && (result.clientId === userId || result.service?.providerId === userId)
    if (!canSee) throw notFound('Solicitação não encontrada.')
    return result
  },
}
