export function formatCurrency(amount) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)
}

export function formatShortDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
}

export function formatDateWithTime(dateStr) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}
