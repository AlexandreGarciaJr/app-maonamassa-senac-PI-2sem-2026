import { useEffect, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router'
import { CurvedHeader } from '@/components/layout/CurvedHeader'
import {
  Alert,
  Button,
  CheckboxField,
  ChoiceCards,
  MaskedTextField,
  SelectField,
  TextareaField,
  TextField,
} from '@/components/ui'
import { labelClasses } from '@/components/ui/fieldClasses'
import { CATEGORIES } from '@/constants/categories'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/cn'
import { maskCep } from '@/lib/masks'
import { PasswordFields, PersonalFields, TermsLabel } from '../components/AccountFields'
import { AuthFooter } from '../components/AuthFooter'
import { useAuth } from '../hooks/useAuth'
import { accountDefaults, clientRegisterSchema, providerRegisterSchema } from '../schemas'

const ROLES = [
  { value: 'cliente', label: 'Sou Cliente', emoji: '👤' },
  { value: 'prestador', label: 'Sou Prestador', emoji: '🔧' },
]

const SCHEMAS = { cliente: clientRegisterSchema, prestador: providerRegisterSchema }

const EXPERIENCE_OPTIONS = [
  { value: 'menos_1', label: 'Menos de 1 ano' },
  { value: '1_3', label: '1 a 3 anos' },
  { value: '3_5', label: '3 a 5 anos' },
  { value: '5_10', label: '5 a 10 anos' },
  { value: 'mais_10', label: 'Mais de 10 anos' },
]

const RADIUS_OPTIONS = [5, 10, 20, 30].map((km) => ({ value: String(km), label: `Até ${km} km` }))

const SPECIALTY_OPTIONS = CATEGORIES.map(({ slug, label, emoji }) => ({
  value: slug,
  label,
  emoji,
}))

/** Alternador "Sou Cliente / Sou Prestador" com indicador deslizante. */
function RoleToggle({ value, onChange }) {
  const isProvider = value === 'prestador'
  return (
    <div
      role="radiogroup"
      aria-label="Tipo de conta"
      className="shadow-card relative mb-6 grid grid-cols-2 rounded-full bg-white p-1"
    >
      <span
        className={cn(
          'bg-primary absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full shadow-[0_2px_8px_rgb(232_93_93/0.4)]',
          'transition-transform duration-400 ease-(--ease-out-expo)',
          isProvider && 'translate-x-full',
        )}
        aria-hidden
      />
      {ROLES.map((role) => {
        const checked = role.value === value
        return (
          <button
            key={role.value}
            type="button"
            role="radio"
            aria-checked={checked}
            onClick={() => onChange(role.value)}
            className={cn(
              'relative z-10 rounded-full py-2.5 text-[13px] font-medium transition-colors duration-300',
              checked ? 'text-white' : 'text-muted hover:text-ink',
            )}
          >
            <span aria-hidden>{role.emoji}</span> {role.label}
          </button>
        )
      })}
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <h2 className="text-ink flex items-center gap-2 pt-2 text-sm font-semibold">
      {children}
      <span className="bg-line h-px flex-1" aria-hidden />
    </h2>
  )
}

export default function RegisterPage() {
  const { register: registerAccount } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [submitError, setSubmitError] = useState(null)

  const role = searchParams.get('tipo') === 'prestador' ? 'prestador' : 'cliente'
  const isProvider = role === 'prestador'

  // O resolver consulta o tipo de conta atual, que muda sem recriar o formulário.
  const roleRef = useRef(role)
  useEffect(() => {
    roleRef.current = role
  }, [role])

  const form = useForm({
    resolver: (values, context, options) =>
      zodResolver(SCHEMAS[roleRef.current])(values, context, options),
    defaultValues: {
      ...accountDefaults,
      preferWomen: false,
      specialties: [],
      experience: '',
      serviceRadiusKm: '10',
      cep: '',
      neighborhood: '',
      bio: '',
      womenOnly: false,
      acceptTerms: false,
    },
  })
  const {
    register,
    control,
    clearErrors,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form

  const isWoman = useWatch({ control, name: 'gender' }) === 'feminino'
  const documentFile = useWatch({ control, name: 'document' })?.[0]

  const changeRole = (newRole) => {
    clearErrors()
    setSubmitError(null)
    setSearchParams(newRole === 'prestador' ? { tipo: 'prestador' } : {}, { replace: true })
  }

  const onSubmit = async (values) => {
    setSubmitError(null)
    const { confirmPassword: _confirm, acceptTerms: _terms, ...data } = values

    const payload = isProvider
      ? {
          role,
          name: data.name,
          email: data.email,
          cpf: data.cpf,
          phone: data.phone,
          gender: data.gender,
          password: data.password,
          specialties: data.specialties,
          experience: data.experience,
          serviceRadiusKm: Number(data.serviceRadiusKm),
          cep: data.cep,
          neighborhood: data.neighborhood,
          bio: data.bio,
          womenOnly: isWoman && data.womenOnly,
          document: data.document[0],
        }
      : {
          role,
          name: data.name,
          email: data.email,
          cpf: data.cpf,
          phone: data.phone,
          gender: data.gender,
          password: data.password,
          preferWomen: isWoman && data.preferWomen,
        }

    try {
      await registerAccount(payload)
      if (isProvider) {
        navigate(ROUTES.createService, { replace: true, state: { firstService: true } })
      } else {
        navigate(ROUTES.home, { replace: true, state: { welcome: true } })
      }
    } catch (error) {
      setSubmitError(error.message)
    }
  }

  return (
    <>
      <CurvedHeader
        emoji="🔨"
        title="Maonamassa"
        subtitle={
          isProvider
            ? 'Divulgue seu trabalho e receba chamados na sua região'
            : 'Crie sua conta e encontre os melhores profissionais'
        }
        backTo={ROUTES.home}
      />

      <div className="px-5 pt-8">
        <RoleToggle value={role} onChange={changeRole} />

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {submitError && <Alert variant="error">{submitError}</Alert>}

          <PersonalFields form={form} />

          {isProvider && (
            <div key="provider" className="animate-page space-y-4">
              <SectionTitle>Sua atuação</SectionTitle>
              <ChoiceCards
                legend="Especialidades"
                type="checkbox"
                options={SPECIALTY_OPTIONS}
                inputProps={register('specialties')}
                error={errors.specialties?.message}
              />
              <div className="grid grid-cols-2 gap-3">
                <SelectField
                  label="Experiência"
                  placeholder="Selecione..."
                  options={EXPERIENCE_OPTIONS}
                  error={errors.experience?.message}
                  {...register('experience')}
                />
                <SelectField
                  label="Atendo até"
                  options={RADIUS_OPTIONS}
                  {...register('serviceRadiusKm')}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <MaskedTextField
                  control={control}
                  name="cep"
                  mask={maskCep}
                  label="CEP"
                  placeholder="00000-000"
                  autoComplete="postal-code"
                />
                <TextField
                  label="Bairro"
                  placeholder="Ex: Santo Amaro"
                  error={errors.neighborhood?.message}
                  {...register('neighborhood')}
                />
              </div>
              <TextareaField
                label="Sobre você"
                placeholder="Conte sua experiência e os serviços que você faz."
                error={errors.bio?.message}
                {...register('bio')}
              />
              {isWoman && (
                <div className="animate-page rounded-[8px] bg-[#f6f1ff] p-3.5">
                  <CheckboxField
                    label="💜 Quero atender preferencialmente mulheres"
                    description="Seu perfil será destacado para quem usa o filtro de preferência de gênero."
                    {...register('womenOnly')}
                  />
                </div>
              )}

              <SectionTitle>Verificação de identidade</SectionTitle>
              <div>
                <span className={labelClasses}>Documento com foto (RG ou CNH)</span>
                <label
                  className={cn(
                    'group mt-1.5 flex cursor-pointer flex-col items-center gap-1 rounded-[8px] border-2 border-dashed bg-white px-4 py-6 text-center transition-colors duration-200',
                    'hover:border-primary hover:bg-primary-light/40',
                    errors.document ? 'border-primary' : 'border-line',
                  )}
                >
                  <span
                    className="text-[28px] leading-none transition-transform duration-300 ease-(--ease-spring) group-hover:-translate-y-1"
                    aria-hidden
                  >
                    {documentFile ? '📄' : '🪪'}
                  </span>
                  <span className="text-ink text-[13px] font-semibold">
                    {documentFile ? documentFile.name : 'Enviar foto ou PDF'}
                  </span>
                  <span className="text-muted text-[11px]">
                    {documentFile ? 'Clique para trocar o arquivo' : 'JPG, PNG ou PDF de até 5 MB'}
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    className="sr-only"
                    {...register('document')}
                  />
                </label>
                {errors.document && (
                  <p
                    role="alert"
                    className="animate-page mt-1.5 text-xs font-medium text-[#c62828]"
                  >
                    {errors.document.message}
                  </p>
                )}
                <p className="text-muted mt-1.5 text-[11px]">
                  Perfis verificados recebem o selo ✅ e passam mais confiança aos clientes.
                </p>
              </div>
              <SectionTitle>Acesso</SectionTitle>
            </div>
          )}

          <PasswordFields form={form} />

          {!isProvider && isWoman && (
            <div className="animate-page rounded-[8px] bg-[#f6f1ff] p-3.5">
              <CheckboxField
                label="💜 Prefiro ser atendida por mulheres"
                description="Vamos destacar prestadoras mulheres nas suas buscas."
                {...register('preferWomen')}
              />
            </div>
          )}

          <CheckboxField
            label={<TermsLabel />}
            error={errors.acceptTerms?.message}
            {...register('acceptTerms')}
          />

          <Button type="submit" fullWidth loading={isSubmitting}>
            Criar Conta
          </Button>
        </form>

        <AuthFooter question="Já tem conta?" linkLabel="Entrar" linkTo={ROUTES.login} />
      </div>
    </>
  )
}
