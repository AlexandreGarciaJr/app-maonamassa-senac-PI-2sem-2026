import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router'
import { CurvedHeader } from '@/components/layout/CurvedHeader'
import { Alert, Button, ChoiceCards, SelectField, TextareaField, TextField } from '@/components/ui'
import { CATEGORIES, getCategory, PRICE_UNITS } from '@/constants/categories'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { firstName } from '@/lib/format'
import { useCreateService } from '../hooks/useServices'
import { createServiceSchema } from '../schemas'

const CATEGORY_OPTIONS = CATEGORIES.map(({ slug, area, emoji }) => ({
  value: slug,
  label: area,
  emoji,
}))
const PRICE_UNIT_OPTIONS = Object.entries(PRICE_UNITS).map(([value, label]) => ({ value, label }))

export default function CreateServicePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const createService = useCreateService()

  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createServiceSchema),
    defaultValues: {
      category: '',
      type: '',
      title: '',
      description: '',
      price: '',
      priceUnit: 'servico',
      includes: '',
    },
  })

  const category = getCategory(useWatch({ control, name: 'category' }))
  const typeOptions = (category?.types ?? []).map((type) => ({ value: type, label: type }))

  const categoryField = register('category', {
    // Ao trocar a área, o tipo anterior deixa de fazer sentido.
    onChange: () => setValue('type', ''),
  })

  const onSubmit = (data) =>
    createService.mutate(data, {
      onSuccess: (service) => navigate(ROUTES.serviceDetail(service.id), { replace: true }),
    })

  return (
    <>
      <CurvedHeader
        emoji="⚒️"
        title="Cadastrar Serviço"
        subtitle={`Olá, ${firstName(user.name)}! Ofereça seu serviço.`}
        backTo={ROUTES.home}
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 px-5 pt-8">
        {location.state?.firstService && (
          <Alert variant="success" title="Cadastro concluído!">
            Seu documento está em análise. Enquanto isso, já cadastre seu primeiro serviço.
          </Alert>
        )}
        {createService.isError && <Alert variant="error">{createService.error.message}</Alert>}

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

        <div className="grid grid-cols-2 gap-3">
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
          <SelectField label="Cobrança" options={PRICE_UNIT_OPTIONS} {...register('priceUnit')} />
        </div>

        <div className="space-y-3 pt-2">
          <Button type="submit" fullWidth loading={createService.isPending}>
            Publicar Serviço
          </Button>
          <Button as={Link} to={ROUTES.home} variant="ghost" fullWidth>
            Ir para o início
          </Button>
        </div>
      </form>
    </>
  )
}
