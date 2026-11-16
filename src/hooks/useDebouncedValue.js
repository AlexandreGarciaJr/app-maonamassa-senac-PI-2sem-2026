import { useEffect, useState } from 'react'

/** Atrasa a atualização de um valor (ex.: busca enquanto o usuário digita). */
export function useDebouncedValue(value, delayMs = 350) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
