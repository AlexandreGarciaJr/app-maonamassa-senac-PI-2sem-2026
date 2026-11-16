import { z } from 'zod'
import { onlyDigits } from '@/lib/masks'
import { isValidCep, isValidPhone, todayIso } from '@/lib/validators'

export const hireServiceSchema = z
  .object({
    date: z
      .string()
      .min(1, 'Escolha uma data.')
      .refine((date) => date >= todayIso(), 'A data não pode estar no passado.'),
    period: z.enum(['manha', 'tarde', 'noite'], { error: 'Escolha um período.' }),
    cep: z.string().refine(isValidCep, 'CEP inválido.'),
    street: z.string().trim().min(3, 'Informe a rua.'),
    number: z.string().trim().min(1, 'Informe o número.'),
    complement: z.string().trim().optional(),
    neighborhood: z.string().trim().min(2, 'Informe o bairro.'),
    details: z
      .string()
      .trim()
      .min(10, 'Descreva o que precisa com pelo menos 10 caracteres.')
      .max(500, 'Máximo de 500 caracteres.'),
    paymentMethod: z.enum(['pix', 'cartao'], { error: 'Escolha a forma de pagamento.' }),
    emergencyName: z.string().trim().optional(),
    emergencyPhone: z.string().optional(),
  })
  .refine((data) => !onlyDigits(data.emergencyPhone) || isValidPhone(data.emergencyPhone), {
    message: 'Telefone inválido.',
    path: ['emergencyPhone'],
  })
  .refine((data) => !onlyDigits(data.emergencyPhone) || data.emergencyName, {
    message: 'Informe o nome do contato.',
    path: ['emergencyName'],
  })

export const PERIODS = {
  manha: { label: 'Manhã', description: '8h às 12h' },
  tarde: { label: 'Tarde', description: '12h às 18h' },
  noite: { label: 'Noite', description: '18h às 21h' },
}

export const PAYMENT_METHODS = {
  pix: { label: 'Pix', description: 'Aprovação na hora' },
  cartao: { label: 'Cartão de crédito', description: 'Em até 3x sem juros' },
}
