import { useState } from 'react'
import { Search } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { Button, EmptyState, Skeleton } from '@/components/ui'
import { CATEGORIES } from '@/constants/categories'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { cn } from '@/lib/cn'
import { ServiceListCard } from '../components/ServiceListCard'
import { useServices } from '../hooks/useServices'

const SORT_OPTIONS = [
  { value: 'rating', label: 'Melhor avaliados' },
  { value: 'distance', label: 'Mais próximos' },
  { value: 'price', label: 'Menor preço' },
]

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'shrink-0 rounded-full border-2 px-4 py-2 text-[13px] font-medium whitespace-nowrap transition-all duration-200 active:scale-95',
        active
          ? 'border-primary bg-primary-light text-primary-ink'
          : 'border-line text-muted hover:border-primary hover:text-primary-ink bg-white',
      )}
    >
      {children}
    </button>
  )
}

/**
 * Listagem completa de serviços/profissionais (servicos.html do protótipo).
 * Os filtros ficam na URL (?categoria=&busca=&mulheres=1&verificados=1&ordem=),
 * então dá para compartilhar o link e voltar mantendo a busca.
 */
export default function ServicesPage() {
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState(params.get('busca') ?? '')

  const category = params.get('categoria') ?? ''
  const womenOnly = params.get('mulheres') === '1'
  const verifiedOnly = params.get('verificados') === '1'
  const sort = params.get('ordem') ?? 'rating'

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const debouncedSearch = useDebouncedValue(search.trim())
  const filters = { search: debouncedSearch, category, womenOnly, verifiedOnly, sort }
  const { data: services, isPending, isError, isFetching, refetch } = useServices(filters)

  const clearFilters = () => {
    setSearch('')
    setParams({}, { replace: true })
  }

  return (
    <>
      <header className="curved-header px-5 pt-12 pb-7 [&::after]:-bottom-10 [&::after]:h-20">
        <div className="mb-5 flex items-center gap-3">
          <span
            className="grid size-[46px] place-items-center rounded-full border-2 border-white/50 bg-white/30 text-xl"
            aria-hidden
          >
            🔍
          </span>
          <div className="leading-tight">
            <small className="text-xs font-light opacity-80">Explorar</small>
            <h1 className="text-base font-semibold">Todos os Serviços</h1>
          </div>
        </div>
        <div className="relative mx-5">
          <label htmlFor="services-search" className="sr-only">
            Buscar serviço ou profissional
          </label>
          <input
            id="services-search"
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              updateParam('busca', event.target.value.trim())
            }}
            placeholder="Buscar serviço..."
            className="text-ink placeholder:text-muted shadow-search w-full rounded-full bg-white py-[13px] pr-12 pl-[18px] text-sm transition-shadow duration-300 outline-none focus:shadow-[0_8px_28px_rgb(0_0_0/0.18)] [&::-webkit-search-cancel-button]:hidden"
          />
          <Search
            className="text-primary-ink pointer-events-none absolute top-1/2 right-4 size-[18px] -translate-y-1/2"
            aria-hidden
          />
        </div>
      </header>

      <div className="pt-7">
        {/* Filtros de categoria (filtro-btn do protótipo) */}
        <div
          className="flex [scrollbar-width:none] gap-2 overflow-x-auto px-5 pb-1"
          role="group"
          aria-label="Categorias"
        >
          <Chip active={!category} onClick={() => updateParam('categoria', '')}>
            Todos
          </Chip>
          {CATEGORIES.map(({ slug, area, emoji }) => (
            <Chip
              key={slug}
              active={category === slug}
              onClick={() => updateParam('categoria', category === slug ? '' : slug)}
            >
              <span aria-hidden>{emoji}</span> {area}
            </Chip>
          ))}
        </div>

        <div className="mt-2.5 flex [scrollbar-width:none] gap-2 overflow-x-auto px-5 pb-1">
          <Chip active={womenOnly} onClick={() => updateParam('mulheres', womenOnly ? '' : '1')}>
            💜 Só mulheres
          </Chip>
          <Chip
            active={verifiedOnly}
            onClick={() => updateParam('verificados', verifiedOnly ? '' : '1')}
          >
            ✅ Verificados
          </Chip>
        </div>

        <div className="mt-5 flex items-center justify-between px-5">
          <p className="text-muted text-xs" aria-live="polite">
            {services && !isPending
              ? `${services.length} ${services.length === 1 ? 'serviço encontrado' : 'serviços encontrados'}`
              : 'Buscando...'}
          </p>
          <label className="text-muted flex items-center gap-1.5 text-xs">
            Ordenar:
            <select
              value={sort}
              onChange={(event) =>
                updateParam('ordem', event.target.value === 'rating' ? '' : event.target.value)
              }
              className="text-primary-ink cursor-pointer bg-transparent font-semibold outline-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <section className="px-5 pt-3" aria-label="Resultados">
          {isError ? (
            <EmptyState
              emoji="😕"
              title="Erro ao carregar serviços."
              action={<Button onClick={() => refetch()}>Tentar novamente</Button>}
            />
          ) : isPending ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-44" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <EmptyState
              emoji="😕"
              title="Nenhum serviço encontrado."
              description="Tente outra busca ou remova os filtros."
              action={
                <Button variant="outline" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              }
            />
          ) : (
            <ul
              key={JSON.stringify(filters)}
              className={cn('stagger space-y-3 transition-opacity', isFetching && 'opacity-60')}
              aria-busy={isFetching}
            >
              {services.map((service, index) => (
                <li key={service.id} style={{ '--i': Math.min(index, 8) }}>
                  <ServiceListCard service={service} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}
