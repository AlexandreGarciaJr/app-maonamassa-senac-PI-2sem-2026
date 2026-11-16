import { env } from '@/config/env'

/**
 * Devolve a API real ou, se VITE_USE_MOCKS=true, uma versão com a mesma
 * assinatura que delega para src/mocks/handlers.js.
 * O import é dinâmico: em produção com backend real, os mocks nem entram no bundle principal.
 */
export function withMock(handlerName, realApi) {
  if (!env.useMocks) return realApi

  return Object.fromEntries(
    Object.keys(realApi).map((method) => [
      method,
      async (...args) => {
        const handlers = await import('./handlers')
        return handlers[handlerName][method](...args)
      },
    ]),
  )
}
