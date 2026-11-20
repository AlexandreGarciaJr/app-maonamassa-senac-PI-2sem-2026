import { ApiError } from '@/lib/http'
import { currentUserId, getSupabase, toApiError, unwrap } from '@/lib/supabase'
import { withMock } from '@/mocks/withMock'

/**
 * Login, cadastro e perfil usando o Supabase (Auth + tabelas usuario, cliente e prestador).
 * O perfil (usuario + cliente/prestador) é criado pelo próprio banco quando a conta nasce,
 * a partir dos dados enviados em `options.data` (ver supabase/migrations).
 */

/** Monta o `user` no formato que as telas usam. */
async function loadUser(userId) {
  const supabase = getSupabase()
  const [usuario, cliente, prestador] = await Promise.all([
    supabase.from('usuario').select('*').eq('id', userId).maybeSingle(),
    supabase.from('cliente').select('prefere_mulheres').eq('usuario_id', userId).maybeSingle(),
    supabase
      .from('prestador')
      .select('atende_somente_mulheres')
      .eq('usuario_id', userId)
      .maybeSingle(),
  ])
  const row = unwrap(usuario, 'Não foi possível carregar seu perfil.')
  if (!row) throw new ApiError('Perfil não encontrado. Fale com o suporte.', { status: 404 })

  const isProvider = Boolean(prestador.data)
  return {
    id: row.id,
    role: isProvider ? 'prestador' : 'cliente',
    name: row.nome,
    email: row.email,
    phone: row.telefone,
    gender: row.genero,
    verified: row.status_verificacao === 'verificado',
    preferWomen: Boolean(cliente.data?.prefere_mulheres),
    womenOnly: Boolean(prestador.data?.atende_somente_mulheres),
    emergencyName: row.contato_emergencia1_nome ?? '',
    emergencyPhone: row.contato_emergencia1_telefone ?? '',
  }
}

const sessionFrom = async (session) => ({
  token: session.access_token,
  user: await loadUser(session.user.id),
})

/** Envia o documento do prestador para a pasta privada `documentos/<id do usuário>/`. */
async function uploadDocument(userId, file) {
  const supabase = getSupabase()
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${userId}/documento-${Date.now()}.${extension}`
  unwrap(await supabase.storage.from('documentos').upload(path, file))
  unwrap(
    await supabase.from('verificacao').insert({
      usuario_id: userId,
      tipo_documento: 'documento_com_foto',
      documento_url: path,
    }),
  )
}

const realAuthApi = {
  async login({ email, password }) {
    const { data, error } = await getSupabase().auth.signInWithPassword({ email, password })
    if (error) throw toApiError(error)
    return sessionFrom(data.session)
  },

  async register({ role, document, ...data }) {
    const isProvider = role === 'prestador'
    const { data: result, error } = await getSupabase().auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          papel: role,
          nome: data.name,
          cpf: data.cpf,
          telefone: data.phone,
          genero: data.gender,
          prefere_mulheres: Boolean(data.preferWomen),
          bio: isProvider ? data.bio : null,
          atende_somente_mulheres: Boolean(data.womenOnly),
        },
      },
    })
    if (error) throw toApiError(error)
    // Com confirmação de e-mail ligada, um e-mail repetido volta "sem identidades".
    if (result.user && result.user.identities?.length === 0) {
      throw new ApiError('Já existe uma conta com este e-mail.', { status: 400 })
    }
    if (!result.session) {
      throw new ApiError(
        'Conta criada! Enviamos um link de confirmação para o seu e-mail. Depois de confirmar, é só entrar.',
        { status: 202 },
      )
    }

    if (isProvider && document) {
      try {
        await uploadDocument(result.user.id, document)
      } catch (uploadError) {
        // A conta já existe; o documento pode ser reenviado depois.
        console.error('Falha ao enviar o documento:', uploadError)
      }
    }
    return sessionFrom(result.session)
  },

  async updateMe(patch) {
    const supabase = getSupabase()
    const userId = await currentUserId()

    const usuarioChanges = {}
    if ('name' in patch) usuarioChanges.nome = patch.name
    if ('phone' in patch) usuarioChanges.telefone = patch.phone
    if (Object.keys(usuarioChanges).length) {
      unwrap(await supabase.from('usuario').update(usuarioChanges).eq('id', userId))
    }
    if ('preferWomen' in patch) {
      unwrap(
        await supabase
          .from('cliente')
          .update({ prefere_mulheres: Boolean(patch.preferWomen) })
          .eq('usuario_id', userId),
      )
    }
    if ('womenOnly' in patch) {
      unwrap(
        await supabase
          .from('prestador')
          .update({ atende_somente_mulheres: Boolean(patch.womenOnly) })
          .eq('usuario_id', userId),
      )
    }
    return loadUser(userId)
  },

  async logout() {
    await getSupabase().auth.signOut()
  },

  /** Confere se a sessão salva no navegador ainda vale no Supabase. */
  async hasValidSession() {
    const { data } = await getSupabase().auth.getSession()
    return Boolean(data.session)
  },
}

export const authApi = withMock('authMock', realAuthApi)
