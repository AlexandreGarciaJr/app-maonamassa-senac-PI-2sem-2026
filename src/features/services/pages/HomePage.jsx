import { useState } from 'react'
import { BadgeCheck, HeartHandshake, Search, ShieldCheck, Siren } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { Alert, Button, EmptyState } from '@/components/ui'
import { getCategory } from '@/constants/categories'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { cn } from '@/lib/cn'
import { firstName } from '@/lib/format'
import { CategoryGrid } from '../components/CategoryGrid'
import { ServiceCard, ServiceCardSkeleton } from '../components/ServiceCard'
import { useServices } from '../hooks/useServices'

const SAFETY_ITEMS = [
  {
    icon: BadgeCheck,
    title: 'Perfis verificados',
    text: 'Conferimos a identidade de cada prestador.',
  },
  {
    icon: HeartHandshake,
    title: 'Preferência de gênero',
    text: 'Escolha ser atendida por mulheres.',
  },
  {
    icon: Siren,
    title: 'Botão de segurança',
    text: 'Avise contatos de confiança durante a visita.',
  },
]

function HomeHeader({ search, onSearchChange }) {
  const { user, isAuthenticated, logout } = useAuth()

  return (
    <header className="curved-header px-5 pt-12 pb-7 [&::after]:-bottom-10 [&::after]:h-20">
      <div className="mb-5 flex items-center gap-3">
        <span
          className="grid size-[46px] place-items-center rounded-full border-2 border-white/50 bg-white/30 text-xl"
          aria-hidden
        >
          👤
        </span>
        <div className="min-w-0 leading-tight">
          <small className="text-xs font-light opacity-80">Bem-vindo(a)</small>
          <strong className="block truncate text-base font-semibold">
            {isAuthenticated ? firstName(user.name) : 'Visitante'}
          </strong>
        </div>
        <div className="ml-auto">
          {isAuthenticated ? (
            <Button variant="light" size="sm" onClick={logout}>
              Sair
            </Button>
          ) : (
            <Button as={Link} to={ROUTES.register} variant="light" size="sm">
              Cadastrar
            </Button>
          )}
        </div>
      </div>

      <div className="relative mx-5">
        <label htmlFor="home-search" className="sr-only">
          Pesquisar serviço ou profissional
        </label>
        <input
          id="home-search"
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Pesquisar profissional..."
          className="text-ink placeholder:text-muted shadow-search w-full rounded-full bg-white py-[13px] pr-12 pl-[18px] text-sm transition-shadow duration-300 outline-none focus:shadow-[0_8px_28px_rgb(0_0_0/0.18)] [&::-webkit-search-cancel-button]:hidden"
        />
        <Search
          className="text-primary pointer-events-none absolute top-1/2 right-4 size-[18px] -translate-y-1/2"
          aria-hidden
        />
      </div>
    </header>
  )
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full border-2 px-4 py-2 text-[13px] font-medium whitespace-nowrap transition-all duration-200 active:scale-95',
        active
          ? 'border-primary bg-primary-light text-primary'
          : 'border-line text-muted hover:border-primary hover:text-primary bg-white',
      )}
    >
      {children}
    </button>
  )
}

export default function HomePage() {
  const { user } = useAuth()
  const location = useLocation()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [womenOnly, setWomenOnly] = useState(Boolean(user?.preferWomen))
  const [verifiedOnly, setVerifiedOnly] = useState(false)

  const debouncedSearch = useDebouncedValue(search)
  const filters = { search: debouncedSearch.trim(), category, womenOnly, verifiedOnly, limit: 6 }
  const { data: services, isPending, isError, isFetching, refetch } = useServices(filters)

  const hasFilters = Boolean(filters.search || category || womenOnly || verifiedOnly)
  const clearFilters = () => {
    setSearch('')
    setCategory('')
    setWomenOnly(false)
    setVerifiedOnly(false)
  }

  return (
    <>
      <HomeHeader search={search} onSearchChange={setSearch} />

      <div className="space-y-7 px-5 pt-7">
        {location.state?.welcome && (
          <Alert variant="success" title="Conta criada com sucesso!">
            Agora é só encontrar o profissional ideal.
          </Alert>
        )}

        {user?.role === 'prestador' && (
          <Link
            to={ROUTES.createService}
            className="group rounded-card shadow-card hover:border-primary-light hover:shadow-coral flex items-center gap-3 border-2 border-transparent bg-white p-4 transition-all duration-300 hover:-translate-y-0.5"
          >
            <span
              className="bg-primary-light grid size-11 place-items-center rounded-xl text-xl"
              aria-hidden
            >
              ⚒️
            </span>
            <span className="flex-1 text-[13px]">
              <strong className="block font-semibold">Área do prestador</strong>
              <span className="text-muted">Ofereça um novo serviço</span>
            </span>
            <span
              className="text-primary text-lg transition-transform group-hover:translate-x-1"
              aria-hidden
            >
              →
            </span>
          </Link>
        )}

        <section aria-labelledby="categories-title">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="categories-title" className="text-[17px] font-semibold">
              Categorias
            </h2>
            <button
              type="button"
              onClick={() => setShowAllCategories((value) => !value)}
              className="text-primary text-[13px] font-medium hover:underline"
              aria-expanded={showAllCategories}
            >
              {showAllCategories ? 'Mostrar menos' : 'Mostrar todos'}
            </button>
          </div>
          <CategoryGrid selected={category} onSelect={setCategory} showAll={showAllCategories} />
        </section>

        <section aria-labelledby="services-title">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="services-title" className="text-[17px] font-semibold">
              {category ? getCategory(category).area : 'Serviços Disponíveis'}
            </h2>
            <Link
              to={category ? `${ROUTES.services}?categoria=${category}` : ROUTES.services}
              className="text-primary text-[13px] font-medium hover:underline"
            >
              Ver todos
            </Link>
          </div>

          <div className="-mx-5 mb-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-5 pb-1">
            <FilterChip active={womenOnly} onClick={() => setWomenOnly((value) => !value)}>
              💜 Só profissionais mulheres
            </FilterChip>
            <FilterChip active={verifiedOnly} onClick={() => setVerifiedOnly((value) => !value)}>
              ✅ Verificados
            </FilterChip>
          </div>

          {isError ? (
            <EmptyState
              emoji="😕"
              title="Não foi possível carregar os serviços."
              action={<Button onClick={() => refetch()}>Tentar novamente</Button>}
            />
          ) : isPending ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }, (_, index) => (
                <ServiceCardSkeleton key={index} />
              ))}
            </div>
          ) : services.length === 0 ? (
            <EmptyState
              emoji="🔍"
              title="Nenhum serviço encontrado."
              description="Tente outra busca ou remova os filtros."
              action={
                hasFilters && (
                  <Button variant="outline" onClick={clearFilters}>
                    Limpar filtros
                  </Button>
                )
              }
            />
          ) : (
            <ul
              key={JSON.stringify(filters)}
              className={cn(
                'stagger flex flex-col gap-3 transition-opacity',
                isFetching && 'opacity-60',
              )}
              aria-busy={isFetching}
            >
              {services.map((service, index) => (
                <li key={service.id} style={{ '--i': index }}>
                  <ServiceCard service={service} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="safety-title" className="rounded-card bg-ink p-5 text-white">
          <h2 id="safety-title" className="flex items-center gap-2 text-[15px] font-semibold">
            <ShieldCheck className="size-5 text-[#f3a7a7]" aria-hidden />
            Sua segurança vem primeiro
          </h2>
          <ul className="mt-4 space-y-3.5">
            {SAFETY_ITEMS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10">
                  <Icon className="size-5 text-[#f3a7a7]" aria-hidden />
                </span>
                <span>
                  <span className="block text-[13px] font-semibold">{title}</span>
                  <span className="text-xs text-white/70">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  )
}
