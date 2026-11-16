import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router'
import { BottomAction } from '@/components/layout/BottomAction'
import { CurvedHeader } from '@/components/layout/CurvedHeader'
import {
  Alert,
  Button,
  Card,
  ChoiceCards,
  EmojiAvatar,
  EmptyState,
  MaskedTextField,
  Skeleton,
  TextareaField,
  TextField,
} from '@/components/ui'
import { categoryEmoji, PRICE_UNITS } from '@/constants/categories'
import { ROUTES } from '@/constants/routes'
import { useService } from '@/features/services/hooks/useServices'
import { formatCurrency } from '@/lib/format'
import { maskCep, maskPhone } from '@/lib/masks'
import { todayIso } from '@/lib/validators'
import { useCreateHireRequest } from '../hooks/useHiring'
import { hireServiceSchema, PAYMENT_METHODS, PERIODS } from '../schemas'

const PERIOD_EMOJIS = { manha: '🌅', tarde: '☀️', noite: '🌙' }
const PAYMENT_EMOJIS = { pix: '💠', cartao: '💳' }

const toOptions = (map, emojis) =>
  Object.entries(map).map(([value, option]) => ({ value, ...option, emoji: emojis[value] }))

function Step({ number, title, children }) {
  return (
    <Card as="section" aria-labelledby={`step-${number}`}>
      <h2
        id={`step-${number}`}
        className="mb-4 flex items-center gap-2.5 text-[15px] font-semibold"
      >
        <span className="bg-primary-light text-primary grid size-7 place-items-center rounded-full text-xs font-bold">
          {number}
        </span>
        {title}
      </h2>
      {children}
    </Card>
  )
}

export default function HireServicePage() {
  const { serviceId } = useParams()
  const navigate = useNavigate()
  const { data: service, isPending, isError } = useService(serviceId)
  const createRequest = useCreateHireRequest()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(hireServiceSchema),
    defaultValues: {
      date: '',
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      details: '',
      emergencyName: '',
      emergencyPhone: '',
    },
  })

  if (isPending) {
    return (
      <>
        <CurvedHeader emoji="📝" title="Contratar Serviço" backTo={ROUTES.home} />
        <div className="space-y-4 px-5 pt-6">
          <Skeleton className="h-20" />
          <Skeleton className="h-60" />
        </div>
      </>
    )
  }

  if (isError) {
    return (
      <>
        <CurvedHeader emoji="📝" title="Contratar Serviço" backTo={ROUTES.home} />
        <EmptyState
          emoji="😕"
          title="Serviço não encontrado."
          action={
            <Button as={Link} to={ROUTES.home}>
              Voltar para o início
            </Button>
          }
        />
      </>
    )
  }

  const onSubmit = (data) =>
    createRequest.mutate(
      { ...data, serviceId: service.id, estimatedPrice: service.price },
      { onSuccess: (request) => navigate(ROUTES.hireConfirmation(request.id), { replace: true }) },
    )

  return (
    <>
      <CurvedHeader
        emoji="📝"
        title="Contratar Serviço"
        subtitle="Preencha os detalhes da sua solicitação"
        backTo={ROUTES.serviceDetail(service.id)}
      />

      <form
        id="hire-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-4 px-5 pt-6 pb-36"
      >
        {/* Resumo do serviço (pro-card) */}
        <div className="rounded-card shadow-card flex items-center gap-3.5 bg-white px-4 py-3.5">
          <EmojiAvatar emoji={categoryEmoji(service.category)} size={48} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{service.title}</p>
            <p className="text-muted text-xs">{service.provider.name}</p>
          </div>
          <div className="text-right">
            <p className="text-primary text-[15px] font-bold">{formatCurrency(service.price)}</p>
            <p className="text-muted text-[10px]">{PRICE_UNITS[service.priceUnit]}</p>
          </div>
        </div>

        {createRequest.isError && <Alert variant="error">{createRequest.error.message}</Alert>}

        <Step number={1} title="Quando?">
          <div className="space-y-4">
            <TextField
              label="Data"
              type="date"
              min={todayIso()}
              error={errors.date?.message}
              {...register('date')}
            />
            <ChoiceCards
              legend="Período"
              columns={3}
              options={toOptions(PERIODS, PERIOD_EMOJIS)}
              inputProps={register('period')}
              error={errors.period?.message}
            />
          </div>
        </Step>

        <Step number={2} title="Onde?">
          <div className="space-y-4">
            <MaskedTextField
              control={control}
              name="cep"
              mask={maskCep}
              label="CEP"
              placeholder="00000-000"
              autoComplete="postal-code"
            />
            <TextField
              label="Rua"
              autoComplete="address-line1"
              placeholder="Ex: Av. Paulista"
              error={errors.street?.message}
              {...register('street')}
            />
            <div className="grid grid-cols-[2fr_3fr] gap-3">
              <TextField
                label="Número"
                inputMode="numeric"
                error={errors.number?.message}
                {...register('number')}
              />
              <TextField
                label="Complemento"
                optional
                placeholder="Apto, bloco..."
                {...register('complement')}
              />
            </div>
            <TextField
              label="Bairro"
              error={errors.neighborhood?.message}
              {...register('neighborhood')}
            />
          </div>
        </Step>

        <Step number={3} title="O que você precisa?">
          <TextareaField
            label="Descreva o problema"
            placeholder="Ex: A tomada da cozinha parou de funcionar e está com cheiro de queimado."
            hint="Quanto mais detalhes, mais preciso fica o orçamento."
            error={errors.details?.message}
            {...register('details')}
          />
        </Step>

        <Step number={4} title="Pagamento">
          <ChoiceCards
            options={toOptions(PAYMENT_METHODS, PAYMENT_EMOJIS)}
            inputProps={register('paymentMethod')}
            error={errors.paymentMethod?.message}
          />
          <p className="text-muted mt-3 text-xs leading-relaxed">
            🔒 O valor fica retido com segurança e só é liberado ao prestador depois que você
            confirmar que o serviço foi concluído.
          </p>
        </Step>

        <Step number={5} title="Segurança (opcional)">
          <p className="text-muted mb-4 text-xs leading-relaxed">
            🚨 Durante a visita, o botão de segurança avisa este contato e compartilha os dados do
            atendimento.
          </p>
          <div className="space-y-4">
            <TextField
              label="Contato de confiança"
              optional
              placeholder="Nome"
              error={errors.emergencyName?.message}
              {...register('emergencyName')}
            />
            <MaskedTextField
              control={control}
              name="emergencyPhone"
              mask={maskPhone}
              label="Telefone do contato"
              optional
              type="tel"
              placeholder="(11) 99999-9999"
            />
          </div>
        </Step>

        <BottomAction>
          <Button type="submit" form="hire-form" fullWidth loading={createRequest.isPending}>
            Enviar solicitação · {formatCurrency(service.price)}
          </Button>
          <p className="text-muted mt-2 text-center text-[11px]">
            Nada é cobrado agora. O valor final é confirmado com o prestador.
          </p>
        </BottomAction>
      </form>
    </>
  )
}
