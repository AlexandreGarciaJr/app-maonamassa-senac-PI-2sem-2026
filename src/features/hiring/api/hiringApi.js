import { http } from '@/lib/http'
import { withMock } from '@/mocks/withMock'

/**
 * Contrato esperado do backend (ver docs/API.md):
 *   GET   /hire-requests       -> HireRequest[] (cliente: as que fez; prestador: as recebidas)
 *   POST  /hire-requests       -> HireRequest   (cliente logado, via token)
 *   GET   /hire-requests/:id   -> HireRequest   (com service)
 *   PATCH /hire-requests/:id   { status }       -> HireRequest
 *
 * Nesta fase o fluxo é demonstrativo: a solicitação é registrada,
 * mas nenhum pagamento é processado.
 *
 * O último argumento de cada função ({ userId, role, ... }) só é usado pelo mock;
 * o backend real identifica o usuário pelo token.
 */
const realHiringApi = {
  listMine: () => http.get('/hire-requests'),
  create: (data) => http.post('/hire-requests', data),
  getById: (requestId) => http.get(`/hire-requests/${requestId}`),
  updateStatus: (requestId, status) => http.patch(`/hire-requests/${requestId}`, { status }),
}

export const hiringApi = withMock('hiringMock', realHiringApi)
