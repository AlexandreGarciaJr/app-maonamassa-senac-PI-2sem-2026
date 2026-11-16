import { onlyDigits } from '@/lib/masks'

/** Valida CPF pelos dígitos verificadores. */
export function isValidCpf(value) {
  const cpf = onlyDigits(value)
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false

  const digitAt = (length) => {
    let sum = 0
    for (let i = 0; i < length; i++) sum += Number(cpf[i]) * (length + 1 - i)
    const rest = (sum * 10) % 11
    return rest === 10 ? 0 : rest
  }
  return digitAt(9) === Number(cpf[9]) && digitAt(10) === Number(cpf[10])
}

export const isValidPhone = (value) => [10, 11].includes(onlyDigits(value).length)

export const isValidCep = (value) => onlyDigits(value).length === 8

/** Data de hoje no formato YYYY-MM-DD (fuso local), para inputs type="date". */
export const todayIso = () => new Date().toLocaleDateString('en-CA')
