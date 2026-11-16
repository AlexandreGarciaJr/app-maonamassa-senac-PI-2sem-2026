import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/cn'

const VARIANTS = {
  primary:
    'bg-primary text-white shadow-button hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-button-hover disabled:opacity-60 disabled:hover:translate-y-0',
  outline:
    'border-2 border-primary text-primary-ink bg-transparent hover:bg-primary-light hover:-translate-y-0.5',
  ghost: 'bg-line text-muted hover:bg-[#dedeea] hover:text-ink',
  light: 'bg-white/20 text-white border border-white/40 hover:bg-white/35',
  danger:
    'bg-[#c62828] text-white shadow-[0_4px_16px_rgb(198_40_40/0.35)] hover:bg-[#a31f1f] hover:-translate-y-0.5',
}

const SIZES = {
  sm: 'h-8 gap-1.5 px-3 text-xs',
  md: 'h-[50px] gap-2 px-6 text-[15px]',
}

/**
 * Botão em pílula do protótipo. Use `as={Link}` para renderizar como link.
 */
export function Button({
  as: Component = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className,
  children,
  ...props
}) {
  const isButton = Component === 'button'

  return (
    <Component
      type={isButton ? (props.type ?? 'button') : undefined}
      disabled={isButton ? disabled || loading : undefined}
      aria-busy={loading || undefined}
      className={cn(
        'group/btn inline-flex items-center justify-center rounded-full font-semibold tracking-[0.3px] whitespace-nowrap',
        'transition-[background-color,box-shadow,transform,color] duration-300 ease-(--ease-out-expo) active:scale-[0.97] disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading ? (
        <LoaderCircle className="size-5 animate-spin" aria-hidden />
      ) : (
        LeftIcon && <LeftIcon className="size-[1.15em]" aria-hidden />
      )}
      {children}
      {RightIcon && !loading && (
        <RightIcon
          className="size-[1.15em] transition-transform duration-300 group-hover/btn:translate-x-1"
          aria-hidden
        />
      )}
    </Component>
  )
}
