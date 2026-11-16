import { CATEGORIES } from '@/constants/categories'
import { cn } from '@/lib/cn'

/**
 * Grade de categorias do protótipo (3 colunas, ícone em caixa rosada).
 * Funciona como filtro: clicar de novo na categoria ativa limpa o filtro.
 */
export function CategoryGrid({ selected, onSelect, showAll }) {
  const categories = showAll ? CATEGORIES : CATEGORIES.filter((category) => category.featured)

  return (
    <ul className="stagger grid grid-cols-3 gap-2.5">
      {categories.map(({ slug, label, emoji }, index) => {
        const isActive = selected === slug
        return (
          <li key={slug} style={{ '--i': index }}>
            <button
              type="button"
              onClick={() => onSelect(isActive ? '' : slug)}
              aria-pressed={isActive}
              className={cn(
                'group rounded-card shadow-card flex w-full flex-col items-center gap-2 border-2 bg-white px-2 py-4',
                'transition-[transform,box-shadow,border-color] duration-300 ease-(--ease-out-expo)',
                'hover:border-primary hover:shadow-coral hover:-translate-y-0.5 active:scale-[0.96]',
                isActive ? 'border-primary shadow-coral -translate-y-0.5' : 'border-transparent',
              )}
            >
              <span
                key={isActive ? 'on' : 'off'}
                className={cn(
                  'grid size-12 place-items-center rounded-xl text-[22px] leading-none transition-colors duration-300',
                  isActive ? 'bg-primary animate-pop' : 'bg-primary-light',
                )}
                aria-hidden
              >
                <span className="transition-transform duration-300 ease-(--ease-spring) group-hover:scale-115 group-hover:-rotate-6">
                  {emoji}
                </span>
              </span>
              <span className="text-ink text-[11px] font-medium">{label}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
