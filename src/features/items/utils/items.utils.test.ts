import { describe, it, expect } from 'vitest'
import { parseMonth, formatMonth, addMonths, currentMonth, MONTHS } from './items.utils'

describe('MONTHS', () => {
  it('tem 12 meses', () => {
    expect(MONTHS).toHaveLength(12)
  })

  it('começa em Janeiro', () => {
    expect(MONTHS[0]).toBe('Janeiro')
  })

  it('termina em Dezembro', () => {
    expect(MONTHS[11]).toBe('Dezembro')
  })
})

describe('parseMonth', () => {
  it('retorna year e m corretos para março', () => {
    expect(parseMonth('2024-03')).toEqual({ year: 2024, m: 3 })
  })

  it('retorna year e m corretos para janeiro', () => {
    expect(parseMonth('2024-01')).toEqual({ year: 2024, m: 1 })
  })

  it('retorna year e m corretos para dezembro', () => {
    expect(parseMonth('2023-12')).toEqual({ year: 2023, m: 12 })
  })
})

describe('formatMonth', () => {
  it('retorna nome e ano para março', () => {
    expect(formatMonth('2024-03')).toEqual({ name: 'Março', year: 2024 })
  })

  it('retorna Janeiro para mês 01', () => {
    expect(formatMonth('2024-01')).toEqual({ name: 'Janeiro', year: 2024 })
  })

  it('retorna Dezembro para mês 12', () => {
    expect(formatMonth('2023-12')).toEqual({ name: 'Dezembro', year: 2023 })
  })
})

describe('addMonths', () => {
  it('avança um mês', () => {
    expect(addMonths('2024-01', 1)).toBe('2024-02')
  })

  it('volta um mês', () => {
    expect(addMonths('2024-03', -1)).toBe('2024-02')
  })

  it('avança com wrap de ano: dezembro → janeiro', () => {
    expect(addMonths('2024-12', 1)).toBe('2025-01')
  })

  it('volta com wrap de ano: janeiro → dezembro', () => {
    expect(addMonths('2024-01', -1)).toBe('2023-12')
  })

  it('avança vários meses', () => {
    expect(addMonths('2024-01', 6)).toBe('2024-07')
  })

  it('formata mês com zero à esquerda', () => {
    expect(addMonths('2024-08', 1)).toBe('2024-09')
  })
})

describe('currentMonth', () => {
  it('retorna string no formato YYYY-MM', () => {
    expect(currentMonth()).toMatch(/^\d{4}-\d{2}$/)
  })

  it('retorna o mês atual', () => {
    const now = new Date()
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    expect(currentMonth()).toBe(expected)
  })
})
