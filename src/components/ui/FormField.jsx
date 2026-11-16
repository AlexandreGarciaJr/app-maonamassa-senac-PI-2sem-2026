import { cn } from '@/lib/cn'
import { labelClasses } from './fieldClasses'

/**
 * Envolve um campo com rótulo, dica e mensagem de erro acessíveis.
 * `children` recebe as props de acessibilidade que devem ir no input.
 */
export function FormField({ id, label, hint, error, optional, className, children }) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={id} className={labelClasses}>
          {label}
          {optional && <span className="font-normal normal-case"> (opcional)</span>}
        </label>
      )}
      {children({
        id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': [hintId, errorId].filter(Boolean).join(' ') || undefined,
      })}
      {hint && !error && (
        <p id={hintId} className="text-muted text-xs">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="animate-page text-xs font-medium text-[#c62828]">
          {error}
        </p>
      )}
    </div>
  )
}
