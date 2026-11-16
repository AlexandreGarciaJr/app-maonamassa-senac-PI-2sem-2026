import { Link } from 'react-router'
import { Button, EmptyState } from '@/components/ui'
import { ROUTES } from '@/constants/routes'

export default function NotFoundPage() {
  return (
    <div className="app-shell grid place-items-center">
      <EmptyState
        emoji="😕"
        title="Página não encontrada."
        description="O endereço pode estar errado ou a página foi removida."
        action={
          <Button as={Link} to={ROUTES.home}>
            Ir para o início
          </Button>
        }
      />
    </div>
  )
}
