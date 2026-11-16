const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export const formatCurrency = (value) => currency.format(Number(value) || 0)

export function formatDate(value, options = { day: '2-digit', month: 'long', year: 'numeric' }) {
  if (!value) return ''
  // Datas "YYYY-MM-DD" são tratadas como locais, não UTC.
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value)
  return date.toLocaleDateString('pt-BR', options)
}

export const firstName = (fullName = '') => fullName.trim().split(/\s+/)[0] ?? ''

export function initials(fullName = '') {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return (parts[0][0] + (parts.length > 1 ? parts.at(-1)[0] : '')).toUpperCase()
}
