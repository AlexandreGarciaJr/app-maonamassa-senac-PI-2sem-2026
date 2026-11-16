import { ApiError } from '@/lib/http'
import { jsonStorage } from '@/lib/storage'

/**
 * Banco de dados falso, persistido no localStorage do navegador.
 * Existe só enquanto o backend não fica pronto (VITE_USE_MOCKS=true).
 */
export function createCollection(name, seed = []) {
  const key = `mnm:mock:${name}`

  const all = () => jsonStorage.read(key) ?? seed
  const save = (items) => jsonStorage.write(key, items)

  return {
    all,
    find: (predicate) => all().find(predicate) ?? null,
    filter: (predicate) => all().filter(predicate),
    insert(item) {
      const items = all()
      save([item, ...items])
      return item
    },
    update(id, patch) {
      let updated = null
      save(
        all().map((item) => {
          if (item.id !== id) return item
          updated = { ...item, ...patch }
          return updated
        }),
      )
      return updated
    },
  }
}

/** Simula a latência da rede para que estados de carregamento apareçam. */
export const delay = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms))

export const notFound = (message = 'Registro não encontrado.') =>
  new ApiError(message, { status: 404 })

export const badRequest = (message) => new ApiError(message, { status: 400 })

export const unauthorized = (message) => new ApiError(message, { status: 401 })

export const newId = (prefix) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
