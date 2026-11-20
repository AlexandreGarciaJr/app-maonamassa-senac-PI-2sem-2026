import { ApiError } from '@/lib/http'
import { currentUserId, getSupabase, unwrap } from '@/lib/supabase'
import { withMock } from '@/mocks/withMock'

/**
 * Serviços usando o Supabase.
 * A vitrine (lista e detalhe) vem da função `servicos_publicos`, que junta o serviço com os
 * dados públicos do prestador (nome, gênero, verificação, nota). Dados pessoais como CPF e
 * telefone nunca saem do banco.
 */

/** Linha de `servicos_publicos` no formato `Service` que as telas usam. */
export function toService(row) {
  return {
    id: String(row.id),
    providerId: row.prestador_id,
    category: row.categoria,
    type: row.tipo ?? '',
    title: row.titulo,
    description: row.descricao ?? '',
    includes: row.inclui ?? [],
    price: Number(row.preco),
    active: row.ativo !== false,
    createdAt: row.criado_em,
    reviewsCount: row.total_avaliacoes ?? 0,
    provider: {
      id: row.prestador_id,
      name: row.prestador_nome,
      gender: row.prestador_genero,
      verified: Boolean(row.verificado),
      rating: Number(row.nota_media) || 0,
      jobsDone: row.servicos_concluidos ?? 0,
      // Nesta versão o app é regional: não há localização do prestador, então sem distância.
      neighborhood: null,
      city: null,
      distanceKm: null,
      memberSince: row.membro_desde,
      bio: row.bio ?? '',
    },
  }
}

const normalize = (text = '') => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const SORTERS = {
  rating: (a, b) => b.provider.rating - a.provider.rating,
  price: (a, b) => a.price - b.price,
  distance: (a, b) => (a.provider.distanceKm ?? 99) - (b.provider.distanceKm ?? 99),
}

/** Mesmos filtros e ordenação dos dados de exemplo (feitos no app: o volume é pequeno). */
export function applyServiceFilters(
  services,
  { search, category, womenOnly, verifiedOnly, providerId, sort, limit } = {},
) {
  const term = normalize(search)
  let result = services
    // Serviço inativo só aparece na lista do próprio prestador ("Meus serviços").
    .filter((service) => service.active !== false || Boolean(providerId))
    .filter((service) => !providerId || service.providerId === providerId)
    .filter((service) => !category || service.category === category)
    .filter((service) => !womenOnly || service.provider.gender === 'feminino')
    .filter((service) => !verifiedOnly || service.provider.verified)
    .filter(
      (service) =>
        !term ||
        normalize(`${service.title} ${service.type} ${service.provider.name}`).includes(term),
    )
    .sort(SORTERS[sort] ?? SORTERS.rating)

  if (limit) result = result.slice(0, limit)
  return result
}

/** Converte os campos do formulário para as colunas de prestador_servico. */
async function toServiceRow(data) {
  const row = {}
  if ('category' in data) {
    const category = unwrap(
      await getSupabase()
        .from('categoria_servico')
        .select('id')
        .eq('slug', data.category)
        .maybeSingle(),
    )
    if (!category) throw new ApiError('Área do serviço inválida.', { status: 400 })
    row.categoria_id = category.id
  }
  if ('type' in data) row.tipo = data.type
  if ('title' in data) row.titulo = data.title
  if ('description' in data) row.descricao = data.description
  if ('price' in data) row.preco = data.price
  if ('includes' in data) row.inclui = data.includes ?? []
  if ('active' in data) row.ativo = Boolean(data.active)
  return row
}

async function fetchPublicServices() {
  const rows = unwrap(
    await getSupabase().rpc('servicos_publicos'),
    'Não foi possível carregar os serviços.',
  )
  return rows.map(toService)
}

const realServicesApi = {
  list: async (filters = {}) => applyServiceFilters(await fetchPublicServices(), filters),

  async getById(serviceId) {
    const service = (await fetchPublicServices()).find((item) => item.id === String(serviceId))
    if (!service) throw new ApiError('Serviço não encontrado.', { status: 404 })

    const reviews = unwrap(
      await getSupabase().rpc('avaliacoes_do_prestador', { p_prestador_id: service.providerId }),
    )
    return {
      ...service,
      reviews: reviews.map((review) => ({
        id: String(review.id),
        authorName: review.autor_nome,
        rating: review.nota,
        comment: review.comentario ?? '',
        date: review.criado_em,
      })),
    }
  },

  async create(data) {
    const providerId = await currentUserId()
    const created = unwrap(
      await getSupabase()
        .from('prestador_servico')
        .insert({ prestador_id: providerId, ativo: true, ...(await toServiceRow(data)) })
        .select('id')
        .single(),
      'Não foi possível publicar o serviço.',
    )
    return realServicesApi.getById(created.id)
  },

  /** Edita um serviço (ou só liga/desliga `active`). O banco só deixa o dono alterar. */
  async update(serviceId, data) {
    const updated = unwrap(
      await getSupabase()
        .from('prestador_servico')
        .update(await toServiceRow(data))
        .eq('id', Number(serviceId))
        .select('id')
        .maybeSingle(),
      'Não foi possível salvar o serviço.',
    )
    if (!updated) throw new ApiError('Serviço não encontrado.', { status: 404 })
    return realServicesApi.getById(updated.id)
  },
}

export const servicesApi = withMock('servicesMock', realServicesApi)
