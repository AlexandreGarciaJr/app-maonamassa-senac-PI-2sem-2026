import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { CurvedHeader } from '@/components/layout/CurvedHeader'
import {
  Alert,
  Button,
  CheckboxField,
  ChoiceCards,
  EmptyState,
  SelectField,
  Skeleton,
  TextareaField,
  TextField,
} from '@/components/ui'
import { CATEGORIES, getCategory } from '@/constants/categories'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { firstName } from '@/lib/format'
import { useCreateService, useService, useUpdateService } from '../hooks/useServices'
import { createServiceSchema } from '../schemas'

const CATEGORY_OPTIONS = CATEGORIES.map(({ slug, area, emoji }) => ({
  value: slug,
  label: area,
  emoji,
}))

const EMPTY_FORM = {
  category: '',
  type: '',
  title: '',
  description: '',
  price: '',
  includes: '',
  active: true,
}

/** Serviço salvo → valores do formulário. */
const toFormValues = (service) => ({
  category: service.category,
  type: service.type,
  title: service.title,
  description: service.description,
  price: String(service.price),
  includes: (service.includes ?? []).join('\n'),
  active: service.active !== false,
})

/** Cadastro e edição de serviço (a rota com :serviceId abre em modo edição). */
export default function CreateServicePage() {
  const { serviceId } = useParams()
  const isEdit = Boolean(serviceId)
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const createService = useCreateService()
  const updateService = useUpdateService()
  const existing = useService(serviceId)
  const mutation = isEdit ? updateService : createService

  const {
    register,
    control,
    setValue,
    getValues,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createServiceSchema),
    defaultValues: EMPTY_FORM,
  })

  // Na edição, preenche o formulário quando o serviço chega.
  useEffect(() => {
    if (existing.data) reset(toFormValues(existing.data))
  }, [existing.data, reset])

  const category = getCategory(useWatch({ control, name: 'category' }))
  const typeOptions = (category?.types ?? []).map((type) => ({ value: type, label: type }))

  // As opções de tipo só aparecem depois que a área é preenchida; reaplica o tipo salvo nelas.
  useEffect(() => {
    const type = getValues('type')
    if (type) setValue('type', type)
  }, [category?.slug, getValues, setValue])

  const categoryField = register('category', {
    // Ao trocar a área, o tipo anterior deixa de fazer sentido.
    onChange: () => setValue('type', ''),
  })

  const goToService = (service) => navigate(ROUTES.serviceDetail(service.id), { replace: true })

  const onSubmit = (data) =>
    isEdit
      ? updateService.mutate({ serviceId, data }, { onSuccess: goToService })
      : createService.mutate(data, { onSuccess: goToService })

  const header = (
    <CurvedHeader
      emoji={isEdit ? '✏️' : '⚒️'}
      title={isEdit ? 'Editar Serviço' : 'Cadastrar Serviço'}
      subtitle={
        isEdit
          ? 'Atualize as informações do seu serviço.'
          : `Olá, ${firstName(user.name)}! Ofereça seu serviço.`
      }
      backTo={isEdit ? ROUTES.profile : ROUTES.home}
    />
  )

  if (isEdit && existing.isPending) {
    return (
      <>
        {header}
        <div className="space-y-4 px-5 pt-8">
          <Skeleton className="h-40" />
          <Skeleton className="h-64" />
        </div>
      </>
    )
  }

  if (isEdit && (existing.isError || existing.data?.providerId !== user.id)) {
    return (
      <>
        {header}
        <EmptyState
          emoji="🔍"
          title="Serviço não encontrado"
          description="Você só pode editar os serviços que você publicou."
          action={
            <Button as={Link} to={ROUTES.profile} variant="outline">
              Ver meus serviços
            </Button>
          }
        />
      </>
    )
  }

  return (
    <>
      {header}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 px-5 pt-8">
        {!isEdit && location.state?.firstService && (
          <Alert variant="success" title="Cadastro concluído!">
            Seu documento está em análise. Enquanto isso, já cadastre seu primeiro serviço.
          </Alert>
        )}
        {mutation.isError && <Alert variant="error">{mutation.error.message}</Alert>}

        <ChoiceCards
          legend="Área do serviço"
          columns={3}
          options={CATEGORY_OPTIONS}
          inputProps={categoryField}
          error={errors.category?.message}
        />

        <SelectField
          label="Tipo de serviço"
          placeholder={category ? 'Selecione o tipo...' : 'Selecione a área primeiro...'}
          options={typeOptions}
          disabled={!category}
          error={errors.type?.message}
          {...register('type')}
        />

        <TextField
          label="Título do serviço"
          placeholder="Ex: Instalação de tomadas e interruptores"
          error={errors.title?.message}
          {...register('title')}
        />

        <TextareaField
          label="Descrição"
          placeholder="Descreva o serviço que você oferece, sua experiência e o que está incluso..."
          error={errors.description?.message}
          {...register('description')}
        />

        <TextareaField
          label="O que está incluso"
          optional
          rows={3}
          placeholder={'Um item por linha. Ex:\nVisita técnica\nGarantia de 90 dias'}
          {...register('includes')}
        />

        <TextField
          label="Valor (R$)"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          placeholder="Ex: 150.00"
          error={errors.price?.message}
          {...register('price')}
        />

        <CheckboxField
          label="Serviço ativo"
          description="Desmarque para esconder o serviço das buscas sem apagá-lo."
          {...register('active')}
        />

        <div className="space-y-3 pt-2">
          <Button type="submit" fullWidth loading={mutation.isPending}>
            {isEdit ? 'Salvar alterações' : 'Publicar Serviço'}
          </Button>
          <Button as={Link} to={isEdit ? ROUTES.profile : ROUTES.home} variant="ghost" fullWidth>
            {isEdit ? 'Cancelar' : 'Ir para o início'}
          </Button>
        </div>
      </form>
    </>
  )
}
