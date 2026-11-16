import { http } from '@/lib/http'
import { withMock } from '@/mocks/withMock'

/**
 * Contrato esperado do backend (ver docs/API.md):
 *   GET  /services?search=&category=&womenOnly=&limit=  -> Service[] (com provider)
 *   GET  /services/:id                                  -> Service (com provider e reviews)
 *   POST /services                                      -> Service  (prestador logado, via token)
 */
const realServicesApi = {
  list: (filters = {}) => http.get('/services', { params: filters }),
  getById: (serviceId) => http.get(`/services/${serviceId}`),
  create: (data) => http.post('/services', data),
}

export const servicesApi = withMock('servicesMock', realServicesApi)
