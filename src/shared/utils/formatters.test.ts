import { describe, it, expect } from 'vitest'
import { formatCurrency, formatShortDate, formatDateWithTime } from './formatters'

describe('formatCurrency', () => {
  it('formata valor inteiro em BRL', () => {
    expect(formatCurrency(10)).toMatch(/R\$/)
    expect(formatCurrency(10)).toContain('10')
  })

  it('formata zero corretamente', () => {
    expect(formatCurrency(0)).toMatch(/0,00/)
  })

  it('formata decimal em BRL', () => {
    expect(formatCurrency(19.99)).toContain('19,99')
  })

  it('formata valores grandes com separador de milhar', () => {
    expect(formatCurrency(1000)).toContain('1.000')
  })
})

describe('formatShortDate', () => {
  it('retorna o dia no resultado', () => {
    const result = formatShortDate('2024-03-15T12:00:00Z')
    expect(result).toMatch(/15/)
  })

  it('retorna o mês abreviado', () => {
    const result = formatShortDate('2024-03-15T12:00:00Z')
    expect(result.toLowerCase()).toMatch(/mar/)
  })
})

describe('formatDateWithTime', () => {
  it('inclui dia e mês', () => {
    const result = formatDateWithTime('2024-03-15T12:00:00Z')
    expect(result).toMatch(/15/)
    expect(result.toLowerCase()).toMatch(/mar/)
  })

  it('inclui hora e minuto', () => {
    const result = formatDateWithTime('2024-03-15T14:30:00Z')
    expect(result).toMatch(/\d{2}:\d{2}/)
  })
})
