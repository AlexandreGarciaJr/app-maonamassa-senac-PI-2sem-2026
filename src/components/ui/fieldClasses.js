import { cn } from '@/lib/cn'

/** Visual dos campos do protótipo: borda 2px, raio 8px, foco coral. */
export const fieldClasses = (hasError, hasIcon) =>
  cn(
    'w-full rounded-field border-2 bg-white px-4 text-sm text-ink outline-none placeholder:text-muted',
    'transition-[border-color,box-shadow] duration-200 focus:border-primary focus:shadow-[0_0_0_4px_rgb(232_93_93/0.12)]',
    'disabled:bg-canvas disabled:text-muted',
    hasError ? 'border-primary' : 'border-line hover:border-[#d6d6e2]',
    hasIcon && 'pl-11',
  )

/** Rótulo em caixa alta do protótipo. */
export const labelClasses = 'text-xs font-semibold tracking-[0.5px] text-muted uppercase'
