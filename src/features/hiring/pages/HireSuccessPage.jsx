import { Link, useParams } from 'react-router'
import { Alert, Badge, Button, Card, EmptyState, Spinner } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { formatCurrency, formatDate } from '@/lib/format'
import { useHireRequest } from '../hooks/useHiring'
import { PAYMENT_METHODS, PERIODS } from '../schemas'

const NEXT_STEPS = [
  'O prestador analisa sua solicitação e confirma o horário.',
  'Vocês alinham os detalhes e o valor final pelo chat.',
  'O pagamento fica retido até você confirmar a conclusão.',
  'Depois do serviço, você avalia o profissional.',
]

export default function HireSuccessPage() {
  const { requestId } = useParams()
  const { data: request, isPending, isError } = useHireRequest(requestId)

  if (isPending) return <Spinner label="Carregando solicitação..." className="py-24" />

  if (isError) {
    return (
      <EmptyState
        emoji="😕"
        title="Solicitação não encontrada."
        className="py-24"
        action={
          <Button as={Link} to={ROUTES.home}>
            Voltar para o início
          </Button>
        }
      />
    )
  }

  const { service } = request
  const period = PERIODS[request.period]

  return (
    <div className="space-y-4 px-5 pt-12">
      <div className="text-center">
        <div
          className="mb-3 inline-block [animation:check-draw_0.6s_var(--ease-spring)_both] text-[64px] leading-none"
          aria-hidden
        >
          🎉
        </div>
        <h1 className="text-xl font-bold">Solicitação Enviada!</h1>
        <p className="text-muted mt-1 text-[13px]">
          Protocolo <strong className="text-ink">{request.id}</strong>
        </p>
      </div>

      <Alert variant="info">
        Esta é uma demonstração do fluxo de contratação: nenhum serviço foi contratado e nenhum
        valor foi cobrado.
      </Alert>

      <div className="stagger space-y-4">
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[15px] font-semibold">{service?.title}</p>
              <p className="text-muted text-xs">{service?.provider?.name}</p>
            </div>
            <Badge>Aguardando</Badge>
          </div>
          <ul className="border-line mt-3 space-y-1.5 border-t pt-3 text-[13px]">
            <li>
              📅 {formatDate(request.date, { weekday: 'long', day: '2-digit', month: 'long' })} ·{' '}
              {period?.label} ({period?.description})
            </li>
            <li>
              📍 {request.street}, {request.number} · {request.neighborhood}
            </li>
            <li>
              💰 {PAYMENT_METHODS[request.paymentMethod]?.label} · estimado em{' '}
              {formatCurrency(request.estimatedPrice)}
            </li>
          </ul>
        </Card>

        <Card title="Próximos passos">
          <ol className="space-y-2.5">
            {NEXT_STEPS.map((step, index) => (
              <li key={step} className="flex gap-3 text-[13px]">
                <span className="bg-primary-light text-primary grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <div className="space-y-3 pt-2">
        <Button as={Link} to={ROUTES.home} fullWidth>
          Entendido!
        </Button>
        <Link
          to={ROUTES.home}
          className="text-primary block text-center text-[13px] font-medium hover:underline"
        >
          Ver outros serviços
        </Link>
      </div>
    </div>
  )
}
