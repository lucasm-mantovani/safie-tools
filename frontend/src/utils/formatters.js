// Formata número como moeda BRL
export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

// Formata número como percentual
export function formatPercent(value, decimals = 1) {
  return `${Number(value).toFixed(decimals)}%`
}

// Formata telefone brasileiro
export function formatPhone(phone) {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

// Formata CNPJ
export function formatCnpj(cnpj) {
  const cleaned = cnpj.replace(/\D/g, '')
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

// Capitaliza primeira letra de cada palavra
export function capitalizeWords(str) {
  return str.toLowerCase().replace(/(?:^|\s)\S/g, (a) => a.toUpperCase())
}
