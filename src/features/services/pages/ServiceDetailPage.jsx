import { BadgeCheck, CircleCheck, MapPin } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { BottomAction } from '@/components/layout/BottomAction'
import { BackPill, CurvedHeader } from '@/components/layout/CurvedHeader'
import { Badge, Button, Card, EmojiAvatar, EmptyState, Rating, Skeleton } from '@/components/ui'
import { categoryEmoji, getCategory, PRICE_UNITS } from '@/constants/categories'
import { ROUTES } from '@/constants/routes'
import { formatCurrency, formatDate } from '@/lib/format'
import { useService } from '../hooks/useServices'

const providerEmoji = (gender) => (gender === 'feminino' ? '👩‍🔧' : '👷')

function ProviderBlock({ provider }) {
  const specialties = provider.specialties.map((slug) => getCategory(slug)?.area).join(', ')

  return (
    <Card title="Prestador">
      <div className="flex items-center gap-3">
        <EmojiAvatar emoji={providerEmoji(provider.gender)} size={48} />
        <div className="min-w-0">
          <p className="text-[15px] font-semibold">{provider.name}</p>
          <p className="text-muted text-xs">{specialties}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {provider.verified ? (
          <Badge variant="success" icon={BadgeCheck}>
            Identidade verificada
          </Badge>
        ) : (
          <Badge variant="neutral">Verificação pendente</Badge>
        )}
        {provider.gender === 'feminino' && <Badge variant="violet">💜 Profissional mulher</Badge>}
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          ['Avaliação', provider.rating > 0 ? <Rating value={provider.rating} /> : 'Nova'],
          ['Serviços', provider.jobsDone],
          ['Distância', `${provider.distanceKm.toFixed(1).replace('.', ',')} km`],
        ].map(([label, value]) => (
          <div key={label} className="bg-canvas rounded-[10px] px-2 py-2.5">
            <dt className="text-muted text-[10px] font-medium uppercase">{label}</dt>
            <dd className="mt-0.5 text-[13px] font-semibold">{value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-3.5 text-sm leading-relaxed">{provider.bio}</p>
      <p className="text-muted mt-2 flex items-center gap-1 text-xs">
        <MapPin className="size-3.5" aria-hidden />
        {provider.neighborhood}, {provider.city} · desde{' '}
        {formatDate(provider.memberSince, { month: 'short', year: 'numeric' })}
      </p>
    </Card>
  )
}

function ReviewsBlock({ reviews }) {
  return (
    <Card title={`Avaliações (${reviews.length})`}>
      {reviews.length === 0 ? (
        <p className="text-muted text-sm">Este prestador ainda não recebeu avaliações.</p>
      ) : (
        <ul className="divide-line divide-y">
          {reviews.map((review) => (
            <li key={review.id} className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold">{review.authorName}</p>
                <Rating value={review.rating} />
              </div>
              <p className="mt-1 text-sm leading-relaxed">{review.comment}</p>
              <p className="text-muted mt-0.5 text-[11px]">{formatDate(review.date)}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export default function ServiceDetailPage() {
  const { serviceId } = useParams()
  const { data: service, isPending, isError } = useService(serviceId)

  if (isPending) {
    return (
      <>
        <CurvedHeader title="Carregando..." backTo={ROUTES.home} className="pb-16" />
        <div className="space-y-4 px-5 pt-8">
          <Skeleton className="h-20" />
          <Skeleton className="h-32" />
          <Skeleton className="h-48" />
        </div>
      </>
    )
  }

  if (isError) {
    return (
      <>
        <CurvedHeader title="Serviço" backTo={ROUTES.home} />
        <EmptyState
          emoji="😕"
          title="Serviço não encontrado."
          action={
            <Button as={Link} to={ROUTES.home}>
              Ver outros serviços
            </Button>
          }
        />
      </>
    )
  }

  const category = getCategory(service.category)

  return (
    <>
      <header className="curved-header px-5 pt-10 pb-16 text-center">
        <div className="mb-3 text-left">
          <BackPill fallback={ROUTES.home} />
        </div>
        <div
          className="animate-pop mb-3 text-[52px] leading-none drop-shadow-[0_6px_14px_rgb(0_0_0/0.18)]"
          aria-hidden
        >
          {categoryEmoji(service.category)}
        </div>
        <h1 className="mb-2 text-xl leading-tight font-bold text-balance">{service.title}</h1>
        <Badge variant="light" className="px-3.5 py-1 text-xs font-medium">
          {category?.area}
        </Badge>
      </header>

      <div className="stagger space-y-4 px-5 pt-8 pb-28">
        <div className="rounded-card shadow-card flex items-center justify-between bg-white p-[18px]">
          <div>
            <p className="text-muted text-xs font-medium">Valor {PRICE_UNITS[service.priceUnit]}</p>
            <p className="text-primary text-2xl font-bold">{formatCurrency(service.price)}</p>
          </div>
          <span className="text-[32px]" aria-hidden>
            💰
          </span>
        </div>

        <Card title="Tipo de serviço">
          <p className="text-sm">{service.type}</p>
        </Card>

        <Card title="Descrição">
          <p className="text-sm leading-relaxed">{service.description}</p>
          {service.includes?.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {service.includes.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[13px]">
                  <CircleCheck className="mt-0.5 size-4 shrink-0 text-[#2e7d32]" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <ProviderBlock provider={service.provider} />
        <ReviewsBlock reviews={service.reviews} />

        <p className="text-muted text-center text-[11px]">
          🔒 O pagamento fica protegido e só é liberado após você confirmar a conclusão.
        </p>
      </div>

      <BottomAction>
        <Button as={Link} to={ROUTES.hireService(service.id)} fullWidth>
          ✅ Contratar Serviço
        </Button>
      </BottomAction>
    </>
  )
}
