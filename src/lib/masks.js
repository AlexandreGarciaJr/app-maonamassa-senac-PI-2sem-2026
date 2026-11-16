export const onlyDigits = (value = '') => String(value).replace(/\D/g, '')

export function maskCpf(value) {
  return onlyDigits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export function maskPhone(value) {
  const digits = onlyDigits(value).slice(0, 11)
  if (digits.length === 0) return ''
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) return digits.replace(/(\d{2})(\d+)/, '($1) $2')
  if (digits.length <= 10) return digits.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3')
  return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
}

export function maskCep(value) {
  return onlyDigits(value)
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, '$1-$2')
}
