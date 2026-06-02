import { describe, it, expect } from 'vitest'
import { expenseSchema } from './expense.schema'

describe('expenseSchema', () => {
  const valid = { description: 'Supermercado', amount: 150.75 }

  it('aceita gasto válido com descrição', () => {
    expect(expenseSchema.safeParse(valid).success).toBe(true)
  })

  it('aceita gasto sem descrição (null)', () => {
    expect(expenseSchema.safeParse({ ...valid, description: null }).success).toBe(true)
  })

  it('aceita gasto sem campo description', () => {
    expect(expenseSchema.safeParse({ amount: 10 }).success).toBe(true)
  })

  it('rejeita amount zero', () => {
    expect(expenseSchema.safeParse({ ...valid, amount: 0 }).success).toBe(false)
  })

  it('rejeita amount negativo', () => {
    expect(expenseSchema.safeParse({ ...valid, amount: -10 }).success).toBe(false)
  })

  it('rejeita amount ausente', () => {
    expect(expenseSchema.safeParse({ description: 'teste' }).success).toBe(false)
  })

  it('rejeita amount string', () => {
    expect(expenseSchema.safeParse({ ...valid, amount: '150' }).success).toBe(false)
  })

  it('rejeita descrição com mais de 200 caracteres', () => {
    expect(
      expenseSchema.safeParse({ ...valid, description: 'd'.repeat(201) }).success
    ).toBe(false)
  })
})
