import { describe, it, expect } from 'vitest'
import { itemSchema } from './item.schema'

describe('itemSchema', () => {
  const valid = { name: 'Arroz', quantity: '2 kg', is_online_purchase: false }

  it('aceita item válido', () => {
    expect(itemSchema.safeParse(valid).success).toBe(true)
  })

  it('aceita compra online', () => {
    expect(itemSchema.safeParse({ ...valid, is_online_purchase: true }).success).toBe(true)
  })

  it('aceita quantidade vazia (default será "1" no handler)', () => {
    expect(itemSchema.safeParse({ ...valid, quantity: '' }).success).toBe(true)
  })

  it('rejeita nome vazio', () => {
    const result = itemSchema.safeParse({ ...valid, name: '' })
    expect(result.success).toBe(false)
  })

  it('rejeita nome ausente', () => {
    const { name: _n, ...rest } = valid
    expect(itemSchema.safeParse(rest).success).toBe(false)
  })

  it('rejeita nome com mais de 200 caracteres', () => {
    const result = itemSchema.safeParse({ ...valid, name: 'a'.repeat(201) })
    expect(result.success).toBe(false)
  })

  it('rejeita quantidade com mais de 50 caracteres', () => {
    const result = itemSchema.safeParse({ ...valid, quantity: 'x'.repeat(51) })
    expect(result.success).toBe(false)
  })

  it('rejeita is_online_purchase não-boolean', () => {
    const result = itemSchema.safeParse({ ...valid, is_online_purchase: 'sim' })
    expect(result.success).toBe(false)
  })
})
