import { cn } from '@/lib/cn'
import { labelClasses } from './fieldClasses'

/**
 * Chips selecionáveis no estilo "type-chip" do protótipo (radio ou checkbox).
 * Recebe o `register` do React Hook Form via `inputProps`.
 * Cada opção aceita `emoji` ou `icon` (componente).
 */
export function ChoiceCards({
  legend,
  options,
  inputProps,
  type = 'radio',
  error,
  columns = 2,
  className,
}) {
  return (
    <fieldset className={className}>
      {legend && <legend className={cn(labelClasses, 'mb-2.5')}>{legend}</legend>}
      <div
        className={cn(
          'grid gap-2.5',
          columns === 2 && 'grid-cols-2',
          columns === 3 && 'grid-cols-3',
        )}
      >
        {options.map(({ value, label, description, emoji, icon: Icon }) => (
          <label key={value} className="group relative cursor-pointer">
            <input type={type} value={value} className="peer sr-only" {...inputProps} />
            <span
              className={cn(
                'rounded-field border-line text-muted flex h-full flex-col items-center justify-center gap-1 border-2 bg-white px-2.5 py-3.5 text-center',
                'transition-[border-color,background-color,color,transform] duration-200 ease-(--ease-out-expo)',
                'group-hover:border-primary group-hover:text-primary group-active:scale-[0.97]',
                'peer-checked:border-primary peer-checked:bg-primary-light peer-checked:text-primary',
                'peer-focus-visible:shadow-[0_0_0_4px_rgb(232_93_93/0.18)]',
              )}
            >
              {emoji && (
                <span
                  className="text-[22px] leading-none transition-transform duration-300 ease-(--ease-spring) group-hover:-translate-y-0.5 group-hover:scale-110"
                  aria-hidden
                >
                  {emoji}
                </span>
              )}
              {Icon && <Icon className="size-[22px]" aria-hidden />}
              <span className="text-[13px] font-medium">{label}</span>
              {description && <span className="text-[11px] opacity-80">{description}</span>}
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p role="alert" className="animate-page mt-1.5 text-xs font-medium text-[#c62828]">
          {error}
        </p>
      )}
    </fieldset>
  )
}
