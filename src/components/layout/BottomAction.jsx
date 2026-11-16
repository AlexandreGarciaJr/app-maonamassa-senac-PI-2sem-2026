import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'

/**
 * Barra de ação fixa no rodapé, presa à coluna mobile de 480px
 * (evolução do "sticky-btn" do protótipo).
 * Renderizada via portal no <body> para não ser afetada pelas animações de
 * entrada da página (transform em um ancestral quebra position: fixed).
 */
export function BottomAction({ children, className }) {
  return createPortal(
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[480px] px-5 pt-6 pb-[calc(16px+env(safe-area-inset-bottom))]',
        'from-canvas via-canvas/95 bg-gradient-to-t to-transparent',
        className,
      )}
    >
      {children}
    </div>,
    document.body,
  )
}
