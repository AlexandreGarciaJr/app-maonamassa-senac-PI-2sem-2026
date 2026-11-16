import { useId, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Controller } from 'react-hook-form'
import { cn } from '@/lib/cn'
import { fieldClasses } from './fieldClasses'
import { FormField } from './FormField'

const SELECT_ARROW =
  "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")] bg-[right_16px_center] bg-no-repeat"

export function TextField({ label, hint, error, optional, icon: Icon, className, id, ...props }) {
  const generatedId = useId()
  return (
    <FormField
      id={id ?? generatedId}
      label={label}
      hint={hint}
      error={error}
      optional={optional}
      className={className}
    >
      {(a11y) => (
        <div className="relative">
          {Icon && (
            <Icon
              className="text-muted pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2"
              aria-hidden
            />
          )}
          <input className={cn(fieldClasses(error, Icon), 'h-12')} {...a11y} {...props} />
        </div>
      )}
    </FormField>
  )
}

export function PasswordField({ label = 'Senha', ...props }) {
  const [visible, setVisible] = useState(false)
  const ToggleIcon = visible ? EyeOff : Eye

  return (
    <div className="relative">
      <TextField
        label={label}
        type={visible ? 'text' : 'password'}
        className="[&_input]:pr-12"
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((value) => !value)}
        className="text-muted hover:text-primary-ink absolute top-[26px] right-1 grid size-11 place-items-center rounded-full transition-colors"
        aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        aria-pressed={visible}
      >
        <ToggleIcon className="size-[18px]" aria-hidden />
      </button>
    </div>
  )
}

/** Campo com máscara (CPF, telefone, CEP) integrado ao React Hook Form. */
export function MaskedTextField({ control, name, mask, ...props }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          {...props}
          {...field}
          value={field.value ?? ''}
          onChange={(event) => field.onChange(mask(event.target.value))}
          error={fieldState.error?.message}
          inputMode="numeric"
        />
      )}
    />
  )
}

export function SelectField({
  label,
  hint,
  error,
  optional,
  options,
  placeholder,
  className,
  ...props
}) {
  const id = useId()
  return (
    <FormField
      id={id}
      label={label}
      hint={hint}
      error={error}
      optional={optional}
      className={className}
    >
      {(a11y) => (
        <select
          className={cn(
            fieldClasses(error),
            SELECT_ARROW,
            'h-12 cursor-pointer appearance-none pr-10',
          )}
          {...a11y}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </FormField>
  )
}

export function TextareaField({ label, hint, error, optional, className, rows = 4, ...props }) {
  const id = useId()
  return (
    <FormField
      id={id}
      label={label}
      hint={hint}
      error={error}
      optional={optional}
      className={className}
    >
      {(a11y) => (
        <textarea
          rows={rows}
          className={cn(fieldClasses(error), 'min-h-[90px] resize-y py-3')}
          {...a11y}
          {...props}
        />
      )}
    </FormField>
  )
}

export function CheckboxField({ label, description, error, className, ...props }) {
  const id = useId()
  return (
    <div className={className}>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
        <input
          id={id}
          type="checkbox"
          className="accent-primary mt-0.5 size-[18px] shrink-0 cursor-pointer"
          aria-invalid={error ? true : undefined}
          {...props}
        />
        <span className="text-[13px] leading-snug">
          <span className="text-ink">{label}</span>
          {description && <span className="text-muted mt-0.5 block text-xs">{description}</span>}
        </span>
      </label>
      {error && (
        <p role="alert" className="animate-page mt-1 ml-8 text-xs font-medium text-[#c62828]">
          {error}
        </p>
      )}
    </div>
  )
}
