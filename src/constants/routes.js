/** Rotas do app em um único lugar. Use sempre estas funções em vez de strings soltas. */
export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/cadastro',
  registerProvider: '/cadastro?tipo=prestador',
  services: '/servicos',
  serviceDetail: (serviceId) => `/servicos/${serviceId}`,
  hireService: (serviceId) => `/servicos/${serviceId}/contratar`,
  hireConfirmation: (requestId) => `/contratacoes/${requestId}/confirmacao`,
  createService: '/prestador/servicos/novo',
  schedule: '/agenda',
  profile: '/perfil',
}
