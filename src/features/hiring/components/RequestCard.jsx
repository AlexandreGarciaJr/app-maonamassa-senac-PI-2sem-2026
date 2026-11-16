import { Link } from 'react-router'
import { Badge, Button } from '@/components/ui'
import { categoryEmoji } from '@/constants/categories'
import { ROUTES } from '@/constants/routes'
import { formatCurrency } from '@/lib/format'
import { PERIODS } from '../schemas'
import { HIRE_STATUS } from '../status'

const MONTHS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']

/** Ações disponíveis por perfil e status. */
function actionsFor(role, status) {
  if (role === 'prestador') {
    if (status === 'aguardando_prestador') return ['accept', 'decline']
    if (status === 'confirmado') return ['safety']
    return []
  }
  if (status === 'aguardando_prestador') return ['cancel']
  if (status === 'confirmado') return ['safety', 'complete', 'cancel']
  return []
}

/** Card de uma solicitação na Agenda. */
export function RequestCard({ request, role, onAction, busy }) {
  const [, month, day] = request.date.split('-')
  const status = HIRE_STATUS[request.status]
  const service = request.service
  const actions = actionsFor(role, request.status)
  const isInactive = !status?.active

  return (
    <article
      className={`rounded-card shadow-card bg-white p-4 transition-opacity ${isInactive ? 'opacity-75' : ''}`}
    >
      <div className="flex gap-3.5">
        <div className="bg-primary-light text-primary-ink flex w-14 shrink-0 flex-col items-center justify-center rounded-xl py-2 leading-none">
          <span className="text-xl font-bold">{day}</span>
          <span className="mt-1 text-[10px] font-semibold tracking-wide">
            {MONTHS[Number(month) - 1]}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link
              to={service ? ROUTES.serviceDetail(service.id) : '#'}
              className="hover:text-primary-ink line-clamp-2 text-sm font-semibold transition-colors"
            >
              <span aria-hidden>{categoryEmoji(service?.category)}</span> {service?.title}
            </Link>
            <Badge variant={status?.badge}>{status?.label}</Badge>
          </div>
          <p className="text-muted mt-0.5 text-xs">
            {role === 'prestador'
              ? `Cliente: ${request.clientName ?? 'Cliente'}`
              : service?.provider?.name}
          </p>
          <p className="text-muted mt-1.5 text-xs">
            🕐 {PERIODS[request.period]?.label} ({PERIODS[request.period]?.description})
          </p>
          <p className="text-muted mt-0.5 truncate text-xs">
            📍 {request.street}, {request.number} · {request.neighborhood}
          </p>
          <p className="mt-1.5 text-xs">
            <span className="text-primary-ink font-bold">
              {formatCurrency(request.estimatedPrice)}
            </span>
            <span className="text-muted"> · {request.id}</span>
          </p>
        </div>
      </div>

      {actions.length > 0 && (
        <div className="border-line mt-3.5 flex flex-wrap gap-2 border-t pt-3.5">
          {actions.includes('safety') && (
            <Button size="sm" variant="danger" onClick={() => onAction('safety', request)}>
              🚨 Botão de segurança
            </Button>
          )}
          {actions.includes('accept') && (
            <Button size="sm" loading={busy} onClick={() => onAction('confirmado', request)}>
              Aceitar
            </Button>
          )}
          {actions.includes('complete') && (
            <Button size="sm" variant="outline" onClick={() => onAction('concluido', request)}>
              Confirmar conclusão
            </Button>
          )}
          {actions.includes('decline') && (
            <Button size="sm" variant="ghost" onClick={() => onAction('recusado', request)}>
              Recusar
            </Button>
          )}
          {actions.includes('cancel') && (
            <Button size="sm" variant="ghost" onClick={() => onAction('cancelado', request)}>
              Cancelar
            </Button>
          )}
        </div>
      )}
    </article>
  )
}
