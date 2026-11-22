import { useState } from 'react'
import { Alert, Button, Sheet } from '@/components/ui'
import { createReview } from '../api/reviewsApi'

/** Painel para avaliar um atendimento concluído (estrelas + comentário). */
export function ReviewSheet({ request, role, onClose, onDone }) {
  const [nota, setNota] = useState(0)
  const [comentario, setComentario] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  const isProvider = role === 'prestador'
  const avaliadoId = isProvider ? request?.clientId : request?.providerId
  const avaliadoNome = isProvider ? request?.clientName : request?.service?.provider?.name

  const submit = async () => {
    if (sending) return
    if (nota < 1) {
      setError('Escolha de 1 a 5 estrelas.')
      return
    }
    setSending(true)
    setError(null)
    try {
      await createReview({
        requestId: request.id,
        avaliadoId,
        nota,
        comentario: comentario.trim(),
      })
      onDone(request)
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <Sheet open={Boolean(request)} onClose={onClose} emoji="⭐" title="Avaliar atendimento">
      <p className="text-muted text-sm">
        Como foi o atendimento com {avaliadoNome ?? 'esta pessoa'}?
      </p>

      <div className="mt-4 flex justify-center gap-1" role="radiogroup" aria-label="Nota">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setNota(n)}
            aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
            className={`text-4xl transition-transform active:scale-90 ${
              n <= nota ? '' : 'opacity-30 grayscale'
            }`}
          >
            ⭐
          </button>
        ))}
      </div>

      <textarea
        value={comentario}
        onChange={(event) => setComentario(event.target.value)}
        maxLength={500}
        rows={3}
        placeholder="Conte como foi (opcional)"
        className="border-line mt-4 w-full rounded-xl border p-3 text-sm"
      />

      {error && (
        <Alert variant="error" className="mt-3 text-left">
          {error}
        </Alert>
      )}

      <div className="mt-5 space-y-2.5">
        <Button fullWidth loading={sending} onClick={submit}>
          Enviar avaliação
        </Button>
        <Button variant="ghost" fullWidth onClick={onClose}>
          Agora não
        </Button>
      </div>
    </Sheet>
  )
}
