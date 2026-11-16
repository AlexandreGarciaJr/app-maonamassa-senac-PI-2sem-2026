import { describe, expect, it } from 'vitest'
import { maskCep, maskCpf, maskPhone } from './masks'

describe('máscaras', () => {
  it('formata CPF progressivamente', () => {
    expect(maskCpf('529')).toBe('529')
    expect(maskCpf('5299822')).toBe('529.982.2')
    expect(maskCpf('52998224725999')).toBe('529.982.247-25')
  })

  it('formata telefone fixo e celular', () => {
    expect(maskPhone('')).toBe('')
    expect(maskPhone('1134567890')).toBe('(11) 3456-7890')
    expect(maskPhone('11987654321')).toBe('(11) 98765-4321')
  })

  it('descarta o +55 colado ou digitado (BUG-006)', () => {
    expect(maskPhone('+55 11 98765-4321')).toBe('(11) 98765-4321')
    // digitando: no 12º dígito o 55 é descartado e o número se completa
    const digitado = maskPhone(maskPhone('551198765432') + '1')
    expect(digitado).toBe('(11) 98765-4321')
  })

  it('formata CEP', () => {
    expect(maskCep('04696000')).toBe('04696-000')
  })
})
