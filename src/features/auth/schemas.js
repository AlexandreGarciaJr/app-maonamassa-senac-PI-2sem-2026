import { z } from 'zod'
import { isValidCep, isValidCpf, isValidPhone } from '@/lib/validators'

const email = z
  .string()
  .trim()
  .min(1, 'Informe seu e-mail.')
  .pipe(z.email('Informe um e-mail válido.'))

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Informe sua senha.'),
})

const passwordsMatch = {
  check: (data) => data.password === data.confirmPassword,
  options: { message: 'As senhas não coincidem.', path: ['confirmPassword'] },
}

/** Campos comuns a cliente e prestador. */
const accountShape = {
  name: z
    .string()
    .trim()
    .min(3, 'Informe seu nome completo.')
    .refine((value) => value.split(/\s+/).length >= 2, 'Informe nome e sobrenome.'),
  email,
  cpf: z.string().refine(isValidCpf, 'CPF inválido.'),
  phone: z.string().refine(isValidPhone, 'Telefone inválido.'),
  gender: z.enum(['feminino', 'masculino', 'outro', 'nao_informado'], {
    error: 'Selecione uma opção.',
  }),
  password: z
    .string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres.')
    .regex(/[a-zA-Z]/, 'Use pelo menos uma letra.')
    .regex(/\d/, 'Use pelo menos um número.'),
  confirmPassword: z.string().min(1, 'Confirme sua senha.'),
}

export const accountDefaults = {
  name: '',
  email: '',
  cpf: '',
  phone: '',
  gender: '',
  password: '',
  confirmPassword: '',
}

const acceptTerms = z.literal(true, { error: 'Você precisa aceitar os termos para continuar.' })

export const clientRegisterSchema = z
  .object({
    ...accountShape,
    preferWomen: z.boolean().optional(),
    acceptTerms,
  })
  .refine(passwordsMatch.check, passwordsMatch.options)

/*
 * O cadastro de prestador é dividido em etapas. Cada etapa tem o próprio schema
 * para validar só os campos visíveis; a última valida o formulário inteiro.
 */
const providerWorkShape = {
  cep: z.string().refine(isValidCep, 'CEP inválido.'),
  neighborhood: z.string().trim().min(2, 'Informe seu bairro.'),
  bio: z
    .string()
    .trim()
    .min(20, 'Conte um pouco mais sobre você (mínimo de 20 caracteres).')
    .max(500, 'Máximo de 500 caracteres.'),
  womenOnly: z.boolean().optional(),
}

const providerVerificationShape = {
  document: z
    .any()
    .refine((files) => files?.length > 0, 'Envie uma foto do seu documento com foto.')
    .refine(
      (files) => !files?.[0] || files[0].size <= 5 * 1024 * 1024,
      'O arquivo deve ter até 5 MB.',
    ),
  acceptTerms,
}

export const providerRegisterSchema = z
  .object({ ...accountShape, ...providerWorkShape, ...providerVerificationShape })
  .refine(passwordsMatch.check, passwordsMatch.options)
