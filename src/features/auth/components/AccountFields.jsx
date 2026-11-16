import { MaskedTextField, PasswordField, SelectField, TextField } from '@/components/ui'
import { GENDERS } from '@/constants/categories'
import { maskCpf, maskPhone } from '@/lib/masks'

/** Dados pessoais, na ordem do protótipo (nome, e-mail, CPF, telefone) + gênero. */
export function PersonalFields({ form }) {
  const {
    register,
    control,
    formState: { errors },
  } = form

  return (
    <div className="space-y-4">
      <TextField
        label="Nome completo"
        autoComplete="name"
        placeholder="Ex: João da Silva"
        error={errors.name?.message}
        {...register('name')}
      />
      <TextField
        label="E-mail"
        type="email"
        autoComplete="email"
        placeholder="seu@email.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <MaskedTextField
        control={control}
        name="cpf"
        mask={maskCpf}
        label="CPF"
        placeholder="000.000.000-00"
      />
      <MaskedTextField
        control={control}
        name="phone"
        mask={maskPhone}
        label="Telefone"
        type="tel"
        autoComplete="tel"
        placeholder="(11) 99999-9999"
      />
      <SelectField
        label="Gênero"
        placeholder="Selecione..."
        options={GENDERS}
        hint="Usado no filtro opcional de preferência de gênero."
        error={errors.gender?.message}
        {...register('gender')}
      />
    </div>
  )
}

export function PasswordFields({ form }) {
  const {
    register,
    formState: { errors },
  } = form

  return (
    <div className="space-y-4">
      <PasswordField
        autoComplete="new-password"
        placeholder="Mínimo 8 caracteres, com letras e números"
        error={errors.password?.message}
        {...register('password')}
      />
      <PasswordField
        label="Confirmar senha"
        autoComplete="new-password"
        placeholder="Repita a senha"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
    </div>
  )
}

export function TermsLabel() {
  return (
    <>
      Li e aceito os {/* TODO: páginas de termos e privacidade */}
      <a href="#termos" className="text-primary font-semibold underline">
        Termos de Uso
      </a>{' '}
      e a{' '}
      <a href="#privacidade" className="text-primary font-semibold underline">
        Política de Privacidade
      </a>{' '}
      (LGPD).
    </>
  )
}
