export const MONTHS: string[] = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export function parseMonth(month: string): { year: number; m: number } {
  const [year, m] = month.split('-').map(Number)
  return { year, m }
}

export function formatMonth(month: string): { name: string; year: number } {
  const { year, m } = parseMonth(month)
  return { name: MONTHS[m - 1], year }
}

export function addMonths(month: string, delta: number): string {
  const { year, m } = parseMonth(month)
  const d = new Date(year, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function currentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}
