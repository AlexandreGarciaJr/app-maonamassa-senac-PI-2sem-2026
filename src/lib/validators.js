import { onlyDigits } from '@/lib/masks'

/**
 * Confere só se o CPF tem 11 dígitos.
 * No MVP não validamos os dígitos verificadores, para facilitar os testes com CPFs fictícios.
 */
export const isValidCpf = (value) => onlyDigits(value).length === 11

export const isValidPhone = (value) => [10, 11].includes(onlyDigits(value).length)

export const isValidCep = (value) => onlyDigits(value).length === 8

/** Data de hoje no formato YYYY-MM-DD (fuso local), para inputs type="date". */
export const todayIso = () => new Date().toLocaleDateString('en-CA')
