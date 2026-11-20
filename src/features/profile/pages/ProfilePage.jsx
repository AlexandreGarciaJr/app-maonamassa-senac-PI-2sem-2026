import { useState } from 'react'
import { ChevronRight, LogOut } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { CurvedHeader } from '@/components/layout/CurvedHeader'
import { Alert, Badge, Button, Card, EmptyState, Skeleton, Switch } from '@/components/ui'
import { GENDERS } from '@/constants/categories'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ServiceCard } from '@/features/services/components/ServiceCard'
import { useServices, useUpdateService } from '@/features/services/hooks/useServices'

function avatarEmoji(user) {
  const isWoman = user.gender === 'feminino'
  if (user.role === 'prestador') return isWoman ? '👩‍🔧' : '👷'
  return isWoman ? '👩' : '🧑'
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
      <dt className="text-muted text-xs font-medium">{label}</dt>
      <dd className="truncate text-right text-sm">{value || '—'}</dd>
    </div>
  )
}

function MenuItem({ to, emoji, label, soon }) {
  const content = (
    <>
      <span
        className="bg-primary-light grid size-9 place-items-center rounded-xl text-base"
        aria-hidden
      >
        {emoji}
      </span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {soon ? (
        <Badge variant="neutral">Em breve</Badge>
      ) : (
        <ChevronRight
          className="text-muted size-4 transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden
        />
      )}
    </>
  )

  const classes = 'group flex items-center gap-3 py-2.5 first:pt-0 last:pb-0'
  return soon ? (
    <li className={`${classes} opacity-70`}>{content}</li>
  ) : (
    <li>
      <Link to={to} className={`${classes} hover:text-primary-ink transition-colors`}>
        {content}
      </Link>
    </li>
  )
}

/** Preferência de gênero: diferencial de segurança do Maonamassa. */
function SafetyPreferences({ user }) {
  const { updateProfile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const isProvider = user.role === 'prestador'
  const field = isProvider ? 'womenOnly' : 'preferWomen'

  const toggle = async (value) => {
    setSaving(true)
    setError(null)
    try {
      await updateProfile({ [field]: value })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card title="Segurança e preferências">
      {user.gender === 'feminino' ? (
        <Switch
          checked={Boolean(user[field])}
          onChange={toggle}
          disabled={saving}
          label={
            isProvider
              ? '💜 Atender preferencialmente mulheres'
              : '💜 Prefiro ser atendida por mulheres'
          }
          description={
            isProvider
              ? 'Seu perfil aparece em destaque para clientes que usam esse filtro.'
              : 'O filtro "Só profissionais mulheres" já vem ligado nas suas buscas.'
          }
        />
      ) : (
        <p className="text-muted text-[13px] leading-relaxed">
          💜 O filtro de preferência de gênero é voltado a clientes e prestadoras mulheres. Você
          pode usar os filtros de profissionais verificados nas buscas.
        </p>
      )}
      {error && (
        <Alert variant="error" className="mt-3">
          {error}
        </Alert>
      )}
      <p className="text-muted border-line mt-4 border-t pt-3 text-xs leading-relaxed">
        🚨 O contato de confiança é informado em cada contratação e pode ser avisado pelo botão de
        segurança durante o atendimento.
      </p>
    </Card>
  )
}

/** Liga/desliga o serviço e leva para a edição. */
function MyServiceControls({ service, updateService }) {
  const savedActive = service.active !== false
  // Mostra a mudança na hora, antes de a lista recarregar; volta atrás se o salvamento falhar.
  const [pending, setPending] = useState(null)
  const active = pending ?? savedActive
  const saving = updateService.isPending && updateService.variables?.serviceId === service.id

  const toggle = (checked) => {
    setPending(checked)
    updateService.mutate(
      { serviceId: service.id, data: { active: checked } },
      { onError: () => setPending(null) },
    )
  }

  return (
    <div className="mt-1.5 flex items-center justify-between px-1">
      <label className="flex cursor-pointer items-center gap-2 text-xs font-medium">
        <input
          type="checkbox"
          className="accent-primary size-4 cursor-pointer"
          checked={active}
          disabled={saving}
          onChange={(event) => toggle(event.target.checked)}
        />
        {active ? 'Ativo' : 'Inativo (não aparece nas buscas)'}
      </label>
      <Link
        to={ROUTES.editService(service.id)}
        className="text-primary-ink text-xs font-semibold hover:underline"
      >
        ✏️ Editar
      </Link>
    </div>
  )
}

function MyServices({ userId }) {
  const { data: services, isPending } = useServices({ providerId: userId })
  const updateService = useUpdateService()

  return (
    <Card title="Meus serviços">
      {updateService.isError && (
        <Alert variant="error" className="mb-3">
          {updateService.error.message}
        </Alert>
      )}
      {isPending ? (
        <Skeleton className="h-20" />
      ) : services?.length ? (
        <ul className="space-y-3">
          {services.map((service) => (
            <li key={service.id}>
              <div className={service.active === false ? 'opacity-60' : undefined}>
                <ServiceCard service={service} />
              </div>
              <MyServiceControls service={service} updateService={updateService} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-muted text-sm">Você ainda não publicou nenhum serviço.</p>
      )}
      <Button as={Link} to={ROUTES.createService} variant="outline" fullWidth className="mt-4">
        + Cadastrar serviço
      </Button>
    </Card>
  )
}

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  if (!isAuthenticated) {
    return (
      <>
        <CurvedHeader emoji="👤" title="Meu Perfil" subtitle="Seus dados e preferências" />
        <EmptyState
          emoji="🔐"
          title="Você ainda não entrou"
          description="Entre ou crie sua conta para contratar serviços com segurança."
          action={
            <div className="flex w-full max-w-xs flex-col gap-2.5">
              <Button as={Link} to={ROUTES.login} fullWidth>
                Entrar
              </Button>
              <Button as={Link} to={ROUTES.register} variant="outline" fullWidth>
                Criar conta
              </Button>
            </div>
          }
        />
      </>
    )
  }

  const isProvider = user.role === 'prestador'
  const gender = GENDERS.find((option) => option.value === user.gender)?.label

  const handleLogout = () => {
    logout()
    navigate(ROUTES.home, { replace: true })
  }

  return (
    <>
      <header className="curved-header px-5 pt-12 pb-16 text-center">
        <span
          className="animate-pop mx-auto mb-3 grid size-20 place-items-center rounded-full border-2 border-white/50 bg-white/30 text-4xl"
          aria-hidden
        >
          {avatarEmoji(user)}
        </span>
        <h1 className="text-xl font-bold">{user.name}</h1>
        <p className="mt-0.5 text-[13px] font-light opacity-85">{user.email}</p>
        <Badge variant="light" className="mt-2.5 px-3.5 py-1 text-xs font-medium">
          {isProvider ? '🔧 Prestador' : '👤 Cliente'}
        </Badge>
      </header>

      <div className="stagger space-y-4 px-5 pt-8">
        <Card title="Meus dados">
          <dl className="divide-line divide-y">
            <InfoRow label="Nome" value={user.name} />
            <InfoRow label="E-mail" value={user.email} />
            <InfoRow label="Telefone" value={user.phone} />
            <InfoRow label="Gênero" value={gender} />
          </dl>
          {/* TODO(backend): edição de dados pessoais (PATCH /users/me) */}
        </Card>

        <SafetyPreferences user={user} />

        {isProvider && <MyServices userId={user.id} />}

        <Card>
          <ul className="divide-line divide-y">
            <MenuItem to={ROUTES.schedule} emoji="📅" label="Minha agenda" />
            <MenuItem to={ROUTES.services} emoji="🔍" label="Encontrar profissionais" />
            <MenuItem emoji="💬" label="Ajuda e suporte" soon />
            <MenuItem emoji="📄" label="Termos de uso e privacidade" soon />
          </ul>
        </Card>

        <Button variant="outline" fullWidth leftIcon={LogOut} onClick={handleLogout}>
          Sair da conta
        </Button>
      </div>
    </>
  )
}
