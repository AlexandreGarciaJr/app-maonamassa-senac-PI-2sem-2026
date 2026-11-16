import { useId } from 'react'
import { cn } from '@/lib/cn'

/** Interruptor liga/desliga acessível (role="switch"). */
export function Switch({ checked, onChange, label, description, disabled }) {
  const id = useId()
  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className="block cursor-pointer text-sm font-medium">
          {label}
        </label>
        {description && <p className="text-muted mt-0.5 text-xs">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 disabled:opacity-60',
          checked ? 'bg-primary' : 'bg-line',
        )}
      >
        <span
          className={cn(
            'absolute top-1 left-1 size-5 rounded-full bg-white shadow-[0_2px_6px_rgb(0_0_0/0.2)] transition-transform duration-300 ease-(--ease-spring)',
            checked && 'translate-x-5',
          )}
        />
      </button>
    </div>
  )
}
