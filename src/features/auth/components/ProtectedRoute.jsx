import { Link, Navigate, Outlet, useLocation } from 'react-router'
import { Button, EmptyState } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '../hooks/useAuth'

/**
 * Protege rotas que exigem login. Se `roles` for informado, também confere o perfil.
 * Depois do login, o usuário volta para a página que tentou acessar.
 */
export function ProtectedRoute({ roles }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <EmptyState
        emoji="🔒"
        title="Acesso restrito"
        description="Esta área é exclusiva para prestadores de serviço."
        className="py-24"
        action={
          <Button as={Link} to={ROUTES.home}>
            Voltar para o início
          </Button>
        }
      />
    )
  }

  return <Outlet />
}
