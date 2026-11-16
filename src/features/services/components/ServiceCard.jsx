import { BadgeCheck } from 'lucide-react'
import { Link } from 'react-router'
import { EmojiAvatar, Rating, Skeleton } from '@/components/ui'
import { categoryEmoji, getCategory, PRICE_UNITS } from '@/constants/categories'
import { ROUTES } from '@/constants/routes'
import { formatCurrency } from '@/lib/format'

/** Card de serviço no estilo "pro-card" do protótipo. */
export function ServiceCard({ service }) {
  const { provider } = service

  return (
    <Link
      to={ROUTES.serviceDetail(service.id)}
      className="group rounded-card shadow-card hover:border-primary-light hover:shadow-coral-lg flex items-center gap-3.5 border-2 border-transparent bg-white px-4 py-3.5 transition-[transform,box-shadow,border-color] duration-300 ease-(--ease-out-expo) hover:-translate-y-0.5 active:scale-[0.98]"
    >
      <EmojiAvatar
        emoji={categoryEmoji(service.category)}
        className="transition-transform duration-300 ease-(--ease-spring) group-hover:scale-105 group-hover:rotate-[-4deg]"
      />

      <div className="min-w-0 flex-1">
        <p className="text-ink group-hover:text-primary-ink truncate text-[15px] font-semibold transition-colors">
          {service.title}
        </p>
        <p className="text-muted mb-1 flex items-center gap-1 truncate text-xs">
          <span className="truncate">{provider?.name}</span>
          {provider?.verified && (
            <BadgeCheck className="size-3.5 shrink-0 text-[#2e7d32]" aria-label="Verificado" />
          )}
          <span aria-hidden>·</span>
          <span className="truncate">{getCategory(service.category)?.area}</span>
        </p>
        <p className="flex items-center gap-2 text-xs">
          {provider?.rating > 0 ? (
            <Rating value={provider.rating} count={service.reviewsCount} />
          ) : (
            <span className="text-muted">Novo</span>
          )}
          {provider?.gender === 'feminino' && (
            <span className="rounded-full bg-[#f1ebff] px-2 py-px text-[10px] font-semibold text-[#6b3fd4]">
              Mulher
            </span>
          )}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-primary-ink text-[15px] font-bold whitespace-nowrap">
          {formatCurrency(service.price)}
        </p>
        <p className="text-muted text-[10px]">{PRICE_UNITS[service.priceUnit]}</p>
      </div>
    </Link>
  )
}

export function ServiceCardSkeleton() {
  return (
    <div className="rounded-card shadow-card flex items-center gap-3.5 bg-white px-4 py-3.5">
      <Skeleton className="size-[54px] rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-4/5" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-4 w-14" />
    </div>
  )
}
