import { createClient } from '@supabase/supabase-js'
import { env } from '@/config/env'
import { ApiError } from '@/lib/http'

let client = null

/**
 * Cliente do Supabase, criado só quando o app usa o backend real (VITE_USE_MOCKS=false).
 * A chave publicável pode ficar no navegador: quem protege os dados são as regras de
 * acesso (RLS) do banco, em supabase/migrations.
 */
export function getSupabase() {
  if (client) return client
  if (!env.supabaseUrl || !env.supabaseKey) {
    throw new ApiError(
      'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no .env.local.',
    )
  }
  client = createClient(env.supabaseUrl, env.supabaseKey)
  return client
}

/** Mensagens do Supabase/Postgres traduzidas para o usuário. */
const KNOWN_ERRORS = [
  [/invalid login credentials/i, 'E-mail ou senha incorretos.', 401],
  [/email not confirmed/i, 'Confirme seu e-mail pelo link que enviamos antes de entrar.', 401],
  [/user already registered/i, 'Já existe uma conta com este e-mail.', 400],
  [/database error saving new user/i, 'Já existe uma conta com este CPF.', 400],
  [/password should be at least/i, 'A senha é muito curta.', 400],
  [/rate limit/i, 'Muitas tentativas seguidas. Aguarde um minuto e tente de novo.', 429],
  [/failed to fetch|network/i, 'Não foi possível conectar ao servidor. Verifique sua internet.', 0],
]

/** Converte um erro do Supabase em ApiError, que é o que as telas já sabem exibir. */
export function toApiError(error, fallback = 'Não foi possível concluir a solicitação.') {
  if (error instanceof ApiError) return error
  const message = error?.message ?? ''
  const known = KNOWN_ERRORS.find(([pattern]) => pattern.test(message))
  if (known) return new ApiError(known[1], { status: known[2], data: error })
  // Erros levantados pelas regras do banco (ex.: mudança de status não permitida) já vêm em português.
  if (error?.code === 'P0001') return new ApiError(message, { status: 400, data: error })
  return new ApiError(fallback, { status: Number(error?.status) || 0, data: error })
}

/** Lança o erro do Supabase (se houver) e devolve os dados. */
export function unwrap({ data, error }, fallback) {
  if (error) throw toApiError(error, fallback)
  return data
}

/** Id do usuário logado no Supabase (ou erro 401 se a sessão expirou). */
export async function currentUserId() {
  const { data } = await getSupabase().auth.getSession()
  const id = data.session?.user?.id
  if (!id) throw new ApiError('Sua sessão expirou. Entre novamente.', { status: 401 })
  return id
}
