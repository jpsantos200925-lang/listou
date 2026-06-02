import { test, expect } from '@playwright/test'

test.describe('Autenticação', () => {
  test('redireciona para /login quando não autenticado', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/login')
  })

  test('exibe erros de validação com campos vazios', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page.getByText('E-mail inválido')).toBeVisible()
    await expect(page.getByText('Senha obrigatória')).toBeVisible()
  })

  test('exibe erro de formato de e-mail inválido', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/e-mail/i).fill('nao-e-email')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page.getByText('E-mail inválido')).toBeVisible()
  })

  test('exibe erro de credenciais inválidas', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/e-mail/i).fill('invalido@example.com')
    await page.getByLabel(/senha/i).fill('senhaerrada')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page.getByText('E-mail ou senha inválidos.')).toBeVisible({ timeout: 5000 })
  })
})
