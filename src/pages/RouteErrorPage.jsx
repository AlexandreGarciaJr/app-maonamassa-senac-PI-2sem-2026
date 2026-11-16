import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import { Button, EmptyState } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import NotFoundPage from './NotFoundPage'

/**
 * Erro inesperado ao abrir uma rota (ex.: sem internet ao carregar o código da tela).
 * "Página não encontrada" fica só para endereço inexistente (BUG-003).
 */
export default function RouteErrorPage() {
  const error = useRouteError()

  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />

  const offline = typeof navigator !== 'undefined' && !navigator.onLine

  return (
    <div className="app-shell grid place-items-center">
      <EmptyState
        emoji="📡"
        title={offline ? 'Você está sem internet.' : 'Não foi possível abrir esta tela.'}
        description="Verifique sua conexão e tente de novo."
        action={
          <div className="flex w-full max-w-xs flex-col gap-2.5">
            <Button fullWidth onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
            <Button as={Link} to={ROUTES.home} variant="outline" fullWidth reloadDocument>
              Ir para o início
            </Button>
          </div>
        }
      />
    </div>
  )
}
