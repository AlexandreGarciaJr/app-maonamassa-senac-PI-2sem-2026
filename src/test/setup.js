import { vi } from 'vitest'

// localStorage em memória (os mocks persistem dados nele).
const store = new Map()
globalThis.localStorage = {
  getItem: (key) => (store.has(key) ? store.get(key) : null),
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key),
  clear: () => store.clear(),
}

// Sem a latência simulada nos testes unitários.
vi.mock('@/mocks/db', async (importOriginal) => ({
  ...(await importOriginal()),
  delay: () => Promise.resolve(),
}))
