import { ApiError } from '@/lib/http'
import { currentUserId, getSupabase, toApiError, unwrap } from '@/lib/supabase'
import { withMock } from '@/mocks/withMock'
import { toService } from '@/features/services/api/servicesApi'

/**
 * Contratações (tabela `atendimento`) usando o Supabase.
 * Quem vê e quem muda cada status é garantido pelo banco (regras de acesso e trigger
 * de validação de status), não só pelo app.
 *
 * Nesta fase o fluxo é demonstrativo: a solicitação é registrada,
 * mas nenhum pagamento é processado.
 */

const TIME_ZONE = 'America/Sao_Paulo'

/** O app escolhe um período; o banco guarda data e hora (início do período). */
const PERIOD_START = { manha: '08', tarde: '12', noite: '18' }

const toScheduledAt = (date, period) => `${date}T${PERIOD_START[period] ?? '08'}:00:00-03:00`

function fromScheduledAt(value) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(new Date(value))
      .map(({ type, value: part }) => [type, part]),
  )
  const hour = Number(parts.hour)
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    period: hour < 12 ? 'manha' : hour < 18 ? 'tarde' : 'noite',
  }
}

/** O número do atendimento aparece como protocolo "OS-000123". */
const toProtocol = (id) => `OS-${String(id).padStart(6, '0')}`

function fromProtocol(requestId) {
  const id = Number(String(requestId).replace(/^OS-/i, ''))
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError('Solicitação não encontrada.', { status: 404 })
  }
  return id
}

const SELECT_REQUEST = '*, endereco(logradouro, numero, complemento, bairro, cep)'

/** Junta atendimento + serviço + nomes no formato `HireRequest` que a Agenda usa. */
async function toHireRequests(rows) {
  if (rows.length === 0) return []
  const supabase = getSupabase()
  const userId = await currentUserId()

  const clientIds = [...new Set(rows.map((row) => row.cliente_id))]
  const [services, clients, me] = await Promise.all([
    supabase.rpc('servicos_publicos'),
    supabase.rpc('perfil_publico', { p_ids: clientIds }),
    supabase
      .from('usuario')
      .select('contato_emergencia1_nome, contato_emergencia1_telefone')
      .eq('id', userId)
      .maybeSingle(),
  ])
  const servicesById = new Map(unwrap(services).map((row) => [String(row.id), toService(row)]))
  const namesById = new Map(unwrap(clients).map((client) => [client.id, client.nome]))
  const contact = unwrap(me) ?? {}

  return rows.map((row) => {
    const { date, period } = fromScheduledAt(row.agendado_para)
    return {
      id: toProtocol(row.id),
      serviceId: String(row.prestador_servico_id),
      clientId: row.cliente_id,
      clientName: namesById.get(row.cliente_id) ?? 'Cliente',
      status: row.status,
      date,
      period,
      cep: row.endereco?.cep ?? '',
      street: row.endereco?.logradouro ?? '',
      number: row.endereco?.numero ?? '',
      complement: row.endereco?.complemento ?? '',
      neighborhood: row.endereco?.bairro ?? '',
      paymentMethod: row.forma_pagamento,
      estimatedPrice: Number(row.valor_acordado) || 0,
      createdAt: row.criado_em,
      // O botão de segurança avisa o contato de confiança de quem está usando o app.
      emergencyName: contact.contato_emergencia1_nome ?? '',
      emergencyPhone: contact.contato_emergencia1_telefone ?? '',
      service: servicesById.get(String(row.prestador_servico_id)),
    }
  })
}

const realHiringApi = {
  /** Cliente: as que fez. Prestador: as recebidas. (O banco só devolve as do usuário logado.) */
  async listMine() {
    const rows = unwrap(
      await getSupabase().from('atendimento').select(SELECT_REQUEST).order('agendado_para'),
      'Não foi possível carregar sua agenda.',
    )
    return toHireRequests(rows)
  },

  async create({ serviceId, ...data }) {
    const supabase = getSupabase()
    const clientId = await currentUserId()

    const service = unwrap(
      await supabase
        .from('prestador_servico')
        .select('id, prestador_id, preco')
        .eq('id', Number(serviceId))
        .maybeSingle(),
    )
    if (!service) throw new ApiError('Serviço não encontrado.', { status: 404 })

    const isClient = unwrap(
      await supabase.from('cliente').select('usuario_id').eq('usuario_id', clientId).maybeSingle(),
    )
    if (!isClient) {
      throw new ApiError('Só contas de cliente podem contratar serviços.', { status: 403 })
    }

    const address = unwrap(
      await supabase
        .from('endereco')
        .insert({
          cliente_id: clientId,
          logradouro: data.street,
          numero: data.number,
          complemento: data.complement || null,
          bairro: data.neighborhood,
          cep: data.cep,
        })
        .select('id')
        .single(),
      'Não foi possível salvar o endereço.',
    )

    const created = unwrap(
      await supabase
        .from('atendimento')
        .insert({
          cliente_id: clientId,
          prestador_id: service.prestador_id,
          prestador_servico_id: service.id,
          endereco_id: address.id,
          valor_acordado: data.estimatedPrice ?? service.preco,
          agendado_para: toScheduledAt(data.date, data.period),
          forma_pagamento: data.paymentMethod,
        })
        .select(SELECT_REQUEST)
        .single(),
      'Não foi possível enviar a solicitação.',
    )

    // O contato de confiança fica no cadastro do usuário (vale para as próximas contratações).
    if (data.emergencyName && data.emergencyPhone) {
      const { error } = await supabase
        .from('usuario')
        .update({
          contato_emergencia1_nome: data.emergencyName,
          contato_emergencia1_telefone: data.emergencyPhone,
        })
        .eq('id', clientId)
      if (error) console.error('Falha ao salvar o contato de confiança:', error)
    }

    const [request] = await toHireRequests([created])
    return request
  },

  async getById(requestId) {
    const row = unwrap(
      await getSupabase()
        .from('atendimento')
        .select(SELECT_REQUEST)
        .eq('id', fromProtocol(requestId))
        .maybeSingle(),
    )
    // Quem não participa do atendimento não recebe a linha (regra do banco): vira 404.
    if (!row) throw new ApiError('Solicitação não encontrada.', { status: 404 })
    const [request] = await toHireRequests([row])
    return request
  },

  async updateStatus(requestId, status) {
    const { data, error } = await getSupabase()
      .from('atendimento')
      .update({ status })
      .eq('id', fromProtocol(requestId))
      .select(SELECT_REQUEST)
      .maybeSingle()
    if (error) throw toApiError(error, 'Esta ação não está disponível para esta solicitação.')
    if (!data) throw new ApiError('Solicitação não encontrada.', { status: 404 })
    const [request] = await toHireRequests([data])
    return request
  },

  /** Registra o acionamento do botão de segurança (tabela alerta_seguranca). */
  async sendSafetyAlert(requestId) {
    const userId = await currentUserId()
    unwrap(
      await getSupabase()
        .from('alerta_seguranca')
        .insert({ atendimento_id: fromProtocol(requestId), usuario_id: userId }),
      'Não foi possível registrar o alerta.',
    )
    return { ok: true }
  },
}

export const hiringApi = withMock('hiringMock', realHiringApi)
