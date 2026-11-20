import { describe, expect, it } from 'vitest'
import { isValidCep, isValidCpf, isValidPhone } from './validators'

describe('isValidCpf', () => {
  it('aceita qualquer CPF com 11 dígitos, com ou sem máscara (MVP)', () => {
    expect(isValidCpf('529.982.247-25')).toBe(true)
    expect(isValidCpf('52998224725')).toBe(true)
    expect(isValidCpf('111.111.111-11')).toBe(true)
  })

  it('rejeita CPF incompleto', () => {
    expect(isValidCpf('123')).toBe(false)
    expect(isValidCpf('529.982.247-2')).toBe(false)
  })
})

describe('telefone e CEP', () => {
  it('valida a quantidade de dígitos', () => {
    expect(isValidPhone('(11) 98765-4321')).toBe(true)
    expect(isValidPhone('(11) 3456-7890')).toBe(true)
    expect(isValidPhone('1199')).toBe(false)
    expect(isValidCep('04696-000')).toBe(true)
    expect(isValidCep('0469')).toBe(false)
  })
})
