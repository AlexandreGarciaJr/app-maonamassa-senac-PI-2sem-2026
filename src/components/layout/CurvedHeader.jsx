import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router'
import { cn } from '@/lib/cn'

/** Botão "Voltar" translúcido do protótipo (btn-back). */
export function BackPill({ fallback = '/', className }) {
  const navigate = useNavigate()

  const goBack = () => {
    // Se o usuário chegou direto pela URL, não há histórico: usa o destino padrão.
    if (window.history.state?.idx > 0) navigate(-1)
    else navigate(fallback)
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className={cn(
        'group inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-[13px] font-medium text-white transition-colors duration-200 hover:bg-white/35',
        className,
      )}
    >
      <ArrowLeft
        className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5"
        aria-hidden
      />
      Voltar
    </button>
  )
}

/**
 * Cabeçalho coral centralizado com curva inferior
 * (form-header / detail-hero / prestador-header do protótipo).
 */
export function CurvedHeader({ emoji, title, subtitle, backTo, children, className }) {
  return (
    <header className={cn('curved-header px-5 pt-10 pb-14 text-center', className)}>
      {backTo && (
        <div className="mb-3 text-left">
          <BackPill fallback={backTo} />
        </div>
      )}
      {emoji && (
        <div
          className="animate-pop mb-2.5 text-[32px] leading-none drop-shadow-[0_4px_10px_rgb(0_0_0/0.15)]"
          aria-hidden
        >
          {emoji}
        </div>
      )}
      <h1 className="text-[22px] leading-tight font-bold text-balance">{title}</h1>
      {subtitle && <p className="mt-1.5 text-[13px] font-light opacity-85">{subtitle}</p>}
      {children}
    </header>
  )
}
