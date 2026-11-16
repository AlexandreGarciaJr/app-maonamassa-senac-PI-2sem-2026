import { http } from '@/lib/http'
import { withMock } from '@/mocks/withMock'

/**
 * Contrato esperado do backend (ver docs/API.md):
 *   POST /auth/login     { email, password }      -> { token, user }
 *   POST  /auth/register multipart/form-data      -> { token, user }
 *   PATCH /users/me      { preferWomen, ... }     -> user
 */
const realAuthApi = {
  login: (credentials) => http.post('/auth/login', credentials),

  // O segundo argumento ({ userId }) só é usado pelo mock; o backend usa o token.
  updateMe: (patch) => http.patch('/users/me', patch),

  register: (data) => {
    // O documento do prestador é um arquivo, então o cadastro vai como multipart.
    const form = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return
      if (value instanceof File) form.append(key, value)
      else if (Array.isArray(value)) value.forEach((item) => form.append(`${key}[]`, item))
      else form.append(key, String(value))
    })
    return http.post('/auth/register', form)
  },
}

export const authApi = withMock('authMock', realAuthApi)
