import { Link } from 'react-router'
import { Button } from '@/components/ui'
import { ROUTES } from '@/constants/routes'

/** Rodapé dos formulários do protótipo: divisor "ou", voltar ao início e link alternativo. */
export function AuthFooter({ question, linkLabel, linkTo }) {
  return (
    <>
      <div className="text-muted my-4 flex items-center gap-3 text-[13px]" aria-hidden>
        <span className="bg-line h-px flex-1" />
        ou
        <span className="bg-line h-px flex-1" />
      </div>
      <Button as={Link} to={ROUTES.home} variant="outline" fullWidth>
        Voltar para o início
      </Button>
      <p className="text-muted mt-5 text-center text-[13px]">
        {question}{' '}
        <Link to={linkTo} className="text-primary-ink font-semibold hover:underline">
          {linkLabel}
        </Link>
      </p>
    </>
  )
}
