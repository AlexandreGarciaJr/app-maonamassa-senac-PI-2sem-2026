import { currentUserId, getSupabase, unwrap } from '@/lib/supabase'
import { fromProtocol } from '@/features/hiring/api/hiringApi'

/** Envia a avaliação de um atendimento concluído. */
export async function createReview({ requestId, avaliadoId, nota, comentario }) {
  const avaliadorId = await currentUserId()

  unwrap(
    await getSupabase()
      .from('avaliacao')
      .insert({
        atendimento_id: fromProtocol(requestId),
        avaliador_id: avaliadorId,
        avaliado_id: avaliadoId,
        nota,
        comentario: comentario || null,
      }),
    'Não foi possível enviar sua avaliação.',
  )
  return { ok: true }
}

/** Ids dos atendimentos que o usuário logado já avaliou (pra esconder o botão). */
export async function listMyReviewedIds() {
  const userId = await currentUserId()
  const rows = unwrap(
    await getSupabase().from('avaliacao').select('atendimento_id').eq('avaliador_id', userId),
  )
  return rows.map((row) => row.atendimento_id)
}
