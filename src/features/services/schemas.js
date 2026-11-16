import { z } from 'zod'

export const createServiceSchema = z.object({
  category: z.string().min(1, 'Selecione a área do serviço.'),
  type: z.string().min(1, 'Selecione o tipo de serviço.'),
  title: z
    .string()
    .trim()
    .min(5, 'O título precisa ter pelo menos 5 caracteres.')
    .max(80, 'Máximo de 80 caracteres.'),
  description: z
    .string()
    .trim()
    .min(20, 'Descreva o serviço com pelo menos 20 caracteres.')
    .max(1000, 'Máximo de 1000 caracteres.'),
  price: z.coerce
    .number({ error: 'Informe um valor.' })
    .positive('Informe um valor maior que zero.')
    .max(100000, 'Valor muito alto.'),
  priceUnit: z.enum(['servico', 'hora', 'visita']),
  // Um item por linha no formulário; vira array antes de enviar.
  includes: z
    .string()
    .optional()
    .transform((text) =>
      (text ?? '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    ),
})
