import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { CurvedHeader } from '@/components/layout/CurvedHeader'
import { Alert, Button, PasswordField, TextField } from '@/components/ui'
import { env } from '@/config/env'
import { ROUTES } from '@/constants/routes'
import { AuthFooter } from '../components/AuthFooter'
import { useAuth } from '../hooks/useAuth'
import { loginSchema } from '../schemas'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [submitError, setSubmitError] = useState(null)

  const redirectTo = location.state?.from?.pathname ?? ROUTES.home

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } })

  if (isAuthenticated) return <Navigate to={redirectTo} replace />

  const onSubmit = async (credentials) => {
    setSubmitError(null)
    try {
      await login(credentials)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setSubmitError(error.message)
    }
  }

  return (
    <>
      <CurvedHeader
        emoji="🔨"
        title="Maonamassa"
        subtitle="Entre e encontre os melhores profissionais"
        backTo={ROUTES.home}
      />

      <div className="px-5 pt-8">
        {location.state?.from && (
          <Alert variant="info" className="mb-4">
            Faça login para continuar a contratação.
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {submitError && <Alert variant="error">{submitError}</Alert>}

          <TextField
            label="E-mail"
            type="email"
            autoComplete="email"
            placeholder="seu@email.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <PasswordField
            autoComplete="current-password"
            placeholder="Sua senha"
            error={errors.password?.message}
            {...register('password')}
          />

          <div className="flex justify-end">
            {/* TODO(backend): fluxo de recuperação de senha */}
            <button type="button" className="text-primary text-[13px] font-medium hover:underline">
              Esqueci minha senha
            </button>
          </div>

          <Button type="submit" fullWidth loading={isSubmitting}>
            Entrar
          </Button>
        </form>

        <AuthFooter
          question="Ainda não tem conta?"
          linkLabel="Cadastre-se"
          linkTo={ROUTES.register}
        />

        {env.useMocks && (
          <div className="border-line text-muted mt-6 rounded-[8px] border-2 border-dashed bg-white p-4 text-xs">
            <p className="text-ink font-semibold">Modo demonstração</p>
            <p className="mt-1 leading-relaxed">
              Cliente: <code>cliente@maonamassa.dev</code>
              <br />
              Prestador: <code>prestador@maonamassa.dev</code>
              <br />
              Senha das duas contas: <code>123456</code>
            </p>
          </div>
        )}
      </div>
    </>
  )
}
