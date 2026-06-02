import { describe, it, expect } from 'vitest'
import { loginSchema } from './auth.schema'

describe('loginSchema', () => {
  const valid = { email: 'user@example.com', password: 'senha123' }

  it('aceita credenciais válidas', () => {
    expect(loginSchema.safeParse(valid).success).toBe(true)
  })

  it('rejeita email inválido', () => {
    expect(loginSchema.safeParse({ ...valid, email: 'nao-e-email' }).success).toBe(false)
  })

  it('rejeita email vazio', () => {
    expect(loginSchema.safeParse({ ...valid, email: '' }).success).toBe(false)
  })

  it('rejeita senha vazia', () => {
    expect(loginSchema.safeParse({ ...valid, password: '' }).success).toBe(false)
  })

  it('rejeita campos ausentes', () => {
    expect(loginSchema.safeParse({}).success).toBe(false)
  })

  it('aceita email com subdomínio', () => {
    expect(loginSchema.safeParse({ ...valid, email: 'user@mail.company.com' }).success).toBe(true)
  })
})
