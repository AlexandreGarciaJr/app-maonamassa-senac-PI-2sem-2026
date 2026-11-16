/** Status de uma solicitação de contratação (Ordem de Serviço). */
export const HIRE_STATUS = {
  aguardando_prestador: { label: 'Aguardando', badge: 'primary', active: true },
  confirmado: { label: 'Confirmado', badge: 'success', active: true },
  concluido: { label: 'Concluído', badge: 'neutral', active: false },
  cancelado: { label: 'Cancelado', badge: 'neutral', active: false },
  recusado: { label: 'Recusado', badge: 'neutral', active: false },
}

export const isActiveRequest = (request) => HIRE_STATUS[request.status]?.active ?? false
