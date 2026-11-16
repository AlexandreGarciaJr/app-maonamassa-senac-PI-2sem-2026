import { describe, expect, it } from 'vitest'
import { isValidCep, isValidCpf, isValidPhone } from './validators'

describe('isValidCpf', () => {
  it('aceita CPF válido com ou sem máscara', () => {
    expect(isValidCpf('529.982.247-25')).toBe(true)
    expect(isValidCpf('52998224725')).toBe(true)
  })

  it('rejeita CPF com dígito errado, repetido ou incompleto', () => {
    expect(isValidCpf('529.982.247-24')).toBe(false)
    expect(isValidCpf('111.111.111-11')).toBe(false)
    expect(isValidCpf('123')).toBe(false)
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
