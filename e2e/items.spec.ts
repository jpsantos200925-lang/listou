import { test, expect } from '@playwright/test'

// Requer usuário autenticado — configure as variáveis abaixo
const TEST_EMAIL = process.env.E2E_EMAIL ?? ''
const TEST_PASSWORD = process.env.E2E_PASSWORD ?? ''
const TEST_LIST_SLUG = process.env.E2E_LIST_SLUG ?? 'lista-teste'

async function login(page: Parameters<typeof test>[1] extends infer P ? P extends { page: infer Q } ? Q : never : never) {
  await page.goto('/login')
  await page.getByLabel(/e-mail/i).fill(TEST_EMAIL)
  await page.getByLabel(/senha/i).fill(TEST_PASSWORD)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL('/')
}

test.describe('Gerenciamento de Itens', () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, 'E2E_EMAIL e E2E_PASSWORD não configurados')

  test.beforeEach(async ({ page }) => {
    await login(page)
    await page.goto(`/${TEST_LIST_SLUG}`)
  })

  test('formulário de novo item aparece ao clicar no botão +', async ({ page }) => {
    await page.getByRole('button', { name: 'Adicionar item' }).click()
    await expect(page.getByText('Novo item')).toBeVisible()
  })

  test('valida nome obrigatório ao adicionar', async ({ page }) => {
    await page.getByRole('button', { name: 'Adicionar item' }).click()
    await page.getByRole('button', { name: 'Adicionar' }).click()
    await expect(page.getByText('Nome obrigatório')).toBeVisible()
  })

  test('adiciona item e aparece na lista', async ({ page }) => {
    const itemName = `Item E2E ${Date.now()}`
    await page.getByRole('button', { name: 'Adicionar item' }).click()
    await page.getByPlaceholder('O que adicionar?').fill(itemName)
    await page.getByRole('button', { name: 'Adicionar' }).click()
    await expect(page.getByText(itemName)).toBeVisible({ timeout: 5000 })
  })

  test('fecha formulário com Escape', async ({ page }) => {
    await page.getByRole('button', { name: 'Adicionar item' }).click()
    await expect(page.getByText('Novo item')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByText('Novo item')).not.toBeVisible()
  })
})
