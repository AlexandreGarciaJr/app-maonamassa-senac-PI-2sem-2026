import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'

/**
 * Painel que sobe do rodapé (padrão mobile para confirmações e ações rápidas).
 * Fecha com Esc ou tocando fora. Fica preso à coluna de 480px do app.
 */
export function Sheet({ open, onClose, emoji, title, children }) {
  const titleId = useId()
  const panelRef = useRef(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => event.key === 'Escape' && onCloseRef.current()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    panelRef.current?.querySelector('button, a')?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 mx-auto flex max-w-[480px] flex-col justify-end">
      <button
        type="button"
        aria-label="Fechar"
        onClick={onClose}
        className="bg-ink/50 absolute inset-0 [animation:fade-in_0.25s_ease_both]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative [animation:sheet-up_0.4s_var(--ease-out-expo)_both] rounded-t-3xl bg-white px-5 pt-3 pb-[calc(24px+env(safe-area-inset-bottom))] text-center shadow-[0_-10px_40px_rgb(0_0_0/0.2)]"
      >
        <span className="bg-line mx-auto mb-4 block h-1 w-10 rounded-full" aria-hidden />
        {emoji && (
          <div className="animate-pop mb-2 text-[44px] leading-none" aria-hidden>
            {emoji}
          </div>
        )}
        <h2 id={titleId} className="text-lg font-bold">
          {title}
        </h2>
        <div className="mt-2">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
