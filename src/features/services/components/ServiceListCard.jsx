import { BadgeCheck, MapPin } from 'lucide-react'
import { Link } from 'react-router'
import { Rating } from '@/components/ui'
import { getCategory, PRICE_UNITS } from '@/constants/categories'
import { ROUTES } from '@/constants/routes'
import { formatCurrency } from '@/lib/format'

/** Card completo da listagem, no estilo "service-card" do protótipo. */
export function ServiceListCard({ service }) {
  const { provider } = service
  const category = getCategory(service.category)

  return (
    <Link
      to={ROUTES.serviceDetail(service.id)}
      className="group rounded-card shadow-card hover:border-primary-light hover:shadow-coral-lg block border-2 border-transparent bg-white p-4 transition-[transform,box-shadow,border-color] duration-300 ease-(--ease-out-expo) hover:-translate-y-0.5 active:scale-[0.98]"
    >
      <div className="flex items-start gap-3">
        <span className="bg-primary-light text-primary mt-0.5 rounded-full px-2.5 py-[3px] text-[10px] font-semibold tracking-[0.5px] whitespace-nowrap uppercase">
          <span aria-hidden>{category?.emoji}</span> {category?.area}
        </span>
        {provider?.gender === 'feminino' && (
          <span className="mt-0.5 ml-auto rounded-full bg-[#f1ebff] px-2 py-[3px] text-[10px] font-semibold text-[#6b3fd4]">
            💜 Mulher
          </span>
        )}
      </div>

      <p className="group-hover:text-primary mt-2.5 text-[15px] font-semibold transition-colors">
        {service.title}
      </p>
      <p className="text-muted mt-1 line-clamp-2 text-xs leading-relaxed">{service.description}</p>

      <div className="text-muted mt-2.5 flex items-center gap-3 text-xs">
        {provider?.rating > 0 ? (
          <Rating value={provider.rating} count={service.reviewsCount} />
        ) : (
          <span>Novo</span>
        )}
        <span className="inline-flex items-center gap-0.5">
          <MapPin className="size-3.5" aria-hidden />
          {provider?.distanceKm.toFixed(1).replace('.', ',')} km
        </span>
      </div>

      <div className="border-line mt-3 flex items-end justify-between border-t pt-3">
        <p>
          <span className="text-primary text-[17px] font-bold">
            {formatCurrency(service.price)}
          </span>{' '}
          <span className="text-muted text-[11px]">{PRICE_UNITS[service.priceUnit]}</span>
        </p>
        <p className="text-muted flex items-center gap-1 text-[11px]">
          por {provider?.name}
          {provider?.verified && (
            <BadgeCheck className="size-3.5 text-[#2e7d32]" aria-label="Verificado" />
          )}
        </p>
      </div>
    </Link>
  )
}
