import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/cn'

/** Bloco branco do protótipo (detail-info-block). */
export function Card({ as: Component = 'div', title, className, children, ...props }) {
  return (
    <Component className={cn('rounded-card shadow-card bg-white p-[18px]', className)} {...props}>
      {title && (
        <h3 className="text-muted mb-2.5 text-[13px] font-semibold tracking-[0.5px] uppercase">
          {title}
        </h3>
      )}
      {children}
    </Component>
  )
}

const BADGE_VARIANTS = {
  primary: 'bg-primary-light text-primary',
  success: 'bg-[#e8f5e9] text-[#2e7d32]',
  neutral: 'bg-line text-muted',
  violet: 'bg-[#f1ebff] text-[#6b3fd4]',
  light: 'bg-white/25 text-white',
}

/** Selo em pílula (service-badge / badge-hero do protótipo). */
export function Badge({ variant = 'primary', icon: Icon, className, children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-[3px] text-[11px] font-semibold whitespace-nowrap',
        BADGE_VARIANTS[variant],
        className,
      )}
    >
      {Icon && <Icon className="size-3.5" aria-hidden />}
      {children}
    </span>
  )
}

const ALERT_VARIANTS = {
  error: 'bg-primary-light border-[#ef9a9a] text-[#c62828]',
  success: 'bg-[#e8f5e9] border-[#a5d6a7] text-[#2e7d32]',
  info: 'bg-[#eef4ff] border-[#c5d7f7] text-[#28457a]',
}

/** Alerta do protótipo, com entrada animada. */
export function Alert({ variant = 'info', title, className, children }) {
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'animate-page rounded-field border px-4 py-3 text-[13px] font-medium',
        ALERT_VARIANTS[variant],
        className,
      )}
    >
      {title && <p className="font-semibold">{title}</p>}
      {children && <div className="leading-relaxed font-normal">{children}</div>}
    </div>
  )
}

export function Spinner({ label = 'Carregando...', className }) {
  return (
    <div
      role="status"
      className={cn('text-muted flex items-center justify-center gap-2 p-8 text-sm', className)}
    >
      <LoaderCircle className="text-primary size-5 animate-spin" aria-hidden />
      {label}
    </div>
  )
}

export function Skeleton({ className }) {
  return <div className={cn('skeleton rounded-card', className)} aria-hidden />
}

/** Estado vazio do protótipo (emoji grande + texto). */
export function EmptyState({ emoji, title, description, action, className }) {
  return (
    <div className={cn('animate-page px-5 py-12 text-center', className)}>
      {emoji && (
        <div className="mb-3 text-[52px] leading-none" aria-hidden>
          {emoji}
        </div>
      )}
      <p className="text-ink text-[15px] font-semibold">{title}</p>
      {description && <p className="text-muted mx-auto mt-1 max-w-xs text-sm">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  )
}

/** Avatar redondo com emoji (pro-avatar do protótipo). */
export function EmojiAvatar({ emoji, size = 54, className }) {
  return (
    <span
      className={cn(
        'bg-primary-light grid shrink-0 place-items-center rounded-full leading-none',
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.41 }}
      aria-hidden
    >
      {emoji}
    </span>
  )
}

export function Rating({ value, count, className }) {
  return (
    <span className={cn('text-star inline-flex items-center gap-1 text-xs font-medium', className)}>
      <span aria-hidden>⭐</span>
      {Number(value).toFixed(1).replace('.', ',')}
      {count !== undefined && <span className="text-muted">({count})</span>}
      <span className="sr-only">de 5 estrelas</span>
    </span>
  )
}
