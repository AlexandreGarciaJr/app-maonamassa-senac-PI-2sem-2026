import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { CurvedHeader } from '@/components/layout/CurvedHeader'
import { Alert, Button, EmptyState, Sheet, Skeleton } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { cn } from '@/lib/cn'
import { fromProtocol, hiringApi } from '../api/hiringApi'
import { listMyReviewedIds } from '@/features/reviews/api/reviewsApi'
import { ReviewSheet } from '@/features/reviews/components/ReviewSheet'
import { RequestCard } from '../components/RequestCard'
import { useMyHireRequests, useUpdateHireStatus } from '../hooks/useHiring'
import { isActiveRequest } from '../status'

const TABS = [
  { value: 'proximos', label: 'Próximos' },
  { value: 'historico', label: 'Histórico' },
]

/** Textos das confirmações de cada ação. */
const CONFIRMATIONS = {
  cancelado: {
    emoji: '🗓️',
    title: 'Cancelar solicitação?',
    text: 'O prestador será avisado. Cancelamentos em cima da hora podem ter taxa de deslocamento.',
    confirm: 'Sim, cancelar',
  },
  recusado: {
    emoji: '🙅',
    title: 'Recusar solicitação?',
    text: 'O cliente será avisado e poderá procurar outro profissional.',
    confirm: 'Recusar',
  },
  confirmado: {
    emoji: '🤝',
    title: 'Aceitar solicitação?',
    text: 'Você se compromete com a data e o período escolhidos pelo cliente.',
    confirm: 'Aceitar',
  },
  concluido: {
    emoji: '✅',
    title: 'O serviço foi concluído?',
    text: 'Ao confirmar, o pagamento retido é liberado para o prestador.',
    confirm: 'Confirmar conclusão',
  },
}

function Tabs({ value, onChange, counts }) {
  const index = TABS.findIndex((tab) => tab.value === value)
  return (
    <div role="tablist" className="shadow-card relative grid grid-cols-2 rounded-full bg-white p-1">
      <span
        className="bg-primary absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full shadow-[0_2px_8px_rgb(232_93_93/0.4)] transition-transform duration-400 ease-(--ease-out-expo)"
        style={{ transform: `translateX(${index * 100}%)` }}
        aria-hidden
      />
      {TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={tab.value === value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'relative z-10 rounded-full py-2.5 text-[13px] font-medium transition-colors duration-300',
            tab.value === value ? 'text-white' : 'text-muted hover:text-ink',
          )}
        >
          {tab.label} ({counts[tab.value]})
        </button>
      ))}
    </div>
  )
}

/** Botão de segurança (diferencial do Maonamassa). Nesta fase é demonstrativo. */
function SafetySheet({ request, onClose }) {
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const hasContact = Boolean(request?.emergencyPhone)

  // Registra o alerta no banco (tabela alerta_seguranca) antes de mostrar a confirmação.
  const notifyContact = async () => {
    setSending(true)
    setError(null)
    try {
      await hiringApi.sendSafetyAlert(request.id)
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <Sheet
      open={Boolean(request)}
      onClose={onClose}
      emoji={sent ? '✅' : '🚨'}
      title={sent ? 'Contato avisado!' : 'Botão de segurança'}
    >
      {sent ? (
        <p className="text-muted text-sm">
          {request?.emergencyName} recebeu os dados do atendimento {request?.id}, com endereço e
          horário. (Demonstração: nenhuma mensagem foi enviada.)
        </p>
      ) : (
        <p className="text-muted text-sm">
          {hasContact
            ? `Vamos avisar ${request.emergencyName}, no ${request.emergencyPhone}, e compartilhar os dados deste atendimento.`
            : 'Você não cadastrou um contato de confiança nesta contratação. Em caso de emergência, ligue para a polícia.'}
        </p>
      )}
      {error && (
        <Alert variant="error" className="mt-3 text-left">
          {error}
        </Alert>
      )}
      <div className="mt-5 space-y-2.5">
        {!sent && hasContact && (
          <Button variant="danger" fullWidth loading={sending} onClick={notifyContact}>
            Avisar contato de confiança
          </Button>
        )}
        <Button as="a" href="tel:190" variant="outline" fullWidth>
          📞 Ligar para 190
        </Button>
        <Button variant="ghost" fullWidth onClick={onClose}>
          Fechar
        </Button>
      </div>
    </Sheet>
  )
}

export default function AgendaPage() {
  const { user, isAuthenticated } = useAuth()
  const [tab, setTab] = useState('proximos')
  const [pending, setPending] = useState(null) // { status, request }
  const [safetyRequest, setSafetyRequest] = useState(null)
  const { data: requests, isPending, isError, refetch } = useMyHireRequests()
  const updateStatus = useUpdateHireStatus()
  const [reviewRequest, setReviewRequest] = useState(null)
  const [reviewedIds, setReviewedIds] = useState(() => new Set())

  // Descobre quais atendimentos o usuário já avaliou (pra esconder o botão "Avaliar").
  useEffect(() => {
    if (!isAuthenticated) return
    listMyReviewedIds()
      .then((ids) => setReviewedIds(new Set(ids)))
      .catch(() => {})
  }, [isAuthenticated])

  const isProvider = user?.role === 'prestador'

  if (!isAuthenticated) {
    return (
      <>
        <CurvedHeader emoji="📅" title="Minha Agenda" subtitle="Acompanhe suas contratações" />
        <EmptyState
          emoji="🔐"
          title="Entre para ver sua agenda"
          description="Suas solicitações e serviços agendados aparecem aqui."
          action={
            <Button as={Link} to={ROUTES.login} state={{ from: { pathname: ROUTES.schedule } }}>
              Entrar
            </Button>
          }
        />
      </>
    )
  }

  const upcoming = (requests ?? []).filter(isActiveRequest)
  const history = (requests ?? []).filter((request) => !isActiveRequest(request)).reverse()
  const visible = tab === 'proximos' ? upcoming : history

  const handleAction = (action, request) => {
    if (action === 'safety') setSafetyRequest(request)
    else if (action === 'review') setReviewRequest(request)
    else setPending({ status: action, request })
  }

  const confirmAction = () =>
    updateStatus.mutate(
      { requestId: pending.request.id, status: pending.status },
      { onSuccess: () => setPending(null) },
    )

  const closeConfirmation = () => {
    setPending(null)
    updateStatus.reset()
  }

  const confirmation = pending && CONFIRMATIONS[pending.status]

  return (
    <>
      <CurvedHeader
        emoji="📅"
        title="Minha Agenda"
        subtitle={
          isProvider ? 'Solicitações recebidas nos seus serviços' : 'Acompanhe suas contratações'
        }
      />

      <div className="space-y-4 px-5 pt-7">
        <Tabs
          value={tab}
          onChange={setTab}
          counts={{ proximos: upcoming.length, historico: history.length }}
        />

        {isError ? (
          <EmptyState
            emoji="😕"
            title="Não foi possível carregar sua agenda."
            action={<Button onClick={() => refetch()}>Tentar novamente</Button>}
          />
        ) : isPending ? (
          <div className="space-y-3">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        ) : visible.length === 0 ? (
          <EmptyState
            emoji={tab === 'proximos' ? '🗓️' : '📭'}
            title={tab === 'proximos' ? 'Nada agendado por aqui.' : 'Nenhum serviço no histórico.'}
            description={
              isProvider
                ? 'Quando um cliente contratar um serviço seu, ele aparece aqui.'
                : 'Encontre um profissional e faça sua primeira contratação.'
            }
            action={
              !isProvider &&
              tab === 'proximos' && (
                <Button as={Link} to={ROUTES.services}>
                  Encontrar profissionais
                </Button>
              )
            }
          />
        ) : (
          <ul key={tab} className="stagger space-y-3">
            {visible.map((request, index) => (
              <li key={request.id} style={{ '--i': index }}>
                <RequestCard
                  request={request}
                  role={user.role}
                  onAction={handleAction}
                  reviewed={reviewedIds.has(fromProtocol(request.id))}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <Sheet
        open={Boolean(pending)}
        onClose={closeConfirmation}
        emoji={confirmation?.emoji}
        title={confirmation?.title}
      >
        <p className="text-muted text-sm">{confirmation?.text}</p>
        {updateStatus.isError && (
          <Alert variant="error" className="mt-3 text-left">
            {updateStatus.error.message}
          </Alert>
        )}
        <div className="mt-5 space-y-2.5">
          <Button
            fullWidth
            variant={
              pending?.status === 'cancelado' || pending?.status === 'recusado'
                ? 'danger'
                : 'primary'
            }
            loading={updateStatus.isPending}
            onClick={confirmAction}
          >
            {confirmation?.confirm}
          </Button>
          <Button variant="ghost" fullWidth onClick={closeConfirmation}>
            Voltar
          </Button>
        </div>
      </Sheet>

      {/* A key reinicia o estado "avisado" a cada abertura. */}
      <ReviewSheet
        key={reviewRequest?.id ?? 'none'}
        request={reviewRequest}
        role={user.role}
        onClose={() => setReviewRequest(null)}
        onDone={(request) => {
          setReviewedIds((prev) => new Set(prev).add(fromProtocol(request.id)))
          setReviewRequest(null)
        }}
      />
    </>
  )
}
