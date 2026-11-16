import { env } from '@/config/env'
import { sessionStore } from '@/lib/storage'

/** Erro padronizado de API, com status HTTP e corpo da resposta. */
export class ApiError extends Error {
  constructor(message, { status = 0, data = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

function buildUrl(path, params) {
  const base = env.apiUrl.endsWith('/') ? env.apiUrl : `${env.apiUrl}/`
  const url = new URL(path.replace(/^\//, ''), base)
  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value)
  })
  return url
}

async function request(path, { method = 'GET', body, params, headers, signal } = {}) {
  const token = sessionStore.getToken()
  const isFormData = body instanceof FormData

  let response
  try {
    response = await fetch(buildUrl(path, params), {
      method,
      signal,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && !isFormData && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
        ...headers,
      },
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError('Não foi possível conectar ao servidor. Verifique sua internet.')
  }

  const data = response.status === 204 ? null : await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status === 401) sessionStore.clear()
    throw new ApiError(data?.message ?? 'Não foi possível concluir a solicitação.', {
      status: response.status,
      data,
    })
  }
  return data
}

/** Cliente HTTP do app. Todas as chamadas reais ao backend passam por aqui. */
export const http = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
}
