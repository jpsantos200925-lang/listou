import { describe, it, expect } from 'vitest'
import { listSchema } from './list.schema'

describe('listSchema', () => {
  const valid = {
    name: 'Minha Lista',
    slug: 'minha-lista',
    primary_color: '#22c55e',
    secondary_color: '#16a34a',
    bg_color: '#0f0f0f',
    font_color: '#f0f0f0',
    title_color: '#f5f5f5',
    label_color: '#888888',
    item_bg_color: '#1e1e1e',
  }

  it('aceita lista válida', () => {
    expect(listSchema.safeParse(valid).success).toBe(true)
  })

  it('rejeita nome vazio', () => {
    expect(listSchema.safeParse({ ...valid, name: '' }).success).toBe(false)
  })

  it('rejeita nome ausente', () => {
    const { name: _n, ...rest } = valid
    expect(listSchema.safeParse(rest).success).toBe(false)
  })

  it('rejeita nome com mais de 200 caracteres', () => {
    expect(listSchema.safeParse({ ...valid, name: 'a'.repeat(201) }).success).toBe(false)
  })

  it('rejeita slug vazio', () => {
    expect(listSchema.safeParse({ ...valid, slug: '' }).success).toBe(false)
  })

  it('rejeita slug com caracteres inválidos (maiúsculas e espaços)', () => {
    expect(listSchema.safeParse({ ...valid, slug: 'Minha Lista' }).success).toBe(false)
  })

  it('rejeita slug com mais de 100 caracteres', () => {
    expect(listSchema.safeParse({ ...valid, slug: 'a'.repeat(101) }).success).toBe(false)
  })

  it('aceita slug com hífen e números', () => {
    expect(listSchema.safeParse({ ...valid, slug: 'lista-2024' }).success).toBe(true)
  })
})
