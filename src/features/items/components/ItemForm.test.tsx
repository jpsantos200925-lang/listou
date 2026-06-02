import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import ItemForm from './ItemForm'

function setup(props?: Partial<React.ComponentProps<typeof ItemForm>>) {
  const defaults = {
    open: true,
    onClose: vi.fn(),
    onAdd: vi.fn().mockResolvedValue(undefined),
    onEdit: vi.fn().mockResolvedValue(undefined),
  }
  const merged = { ...defaults, ...props }
  return { user: userEvent.setup(), ...render(<ItemForm {...merged} />), ...merged }
}

describe('ItemForm — visibilidade', () => {
  it('não exibe nada quando fechado', () => {
    setup({ open: false })
    expect(screen.queryByText('Novo item')).not.toBeInTheDocument()
  })

  it('exibe "Novo item" quando aberto sem initial', () => {
    setup()
    expect(screen.getByText('Novo item')).toBeInTheDocument()
  })

  it('exibe "Editar item" quando tem initial', () => {
    setup({
      initial: {
        id: 'item-1',
        list_id: 'list-1',
        name: 'Leite',
        quantity: '1 L',
        month: '2024-03',
        checked: false,
        is_online_purchase: false,
        created_at: '2024-01-01T00:00:00Z',
      },
    })
    expect(screen.getByText('Editar item')).toBeInTheDocument()
  })
})

describe('ItemForm — pré-preenchimento ao editar', () => {
  it('preenche os campos com os valores do item', () => {
    setup({
      initial: {
        id: 'item-1',
        list_id: 'list-1',
        name: 'Arroz',
        quantity: '2 kg',
        month: '2024-03',
        checked: false,
        is_online_purchase: false,
        created_at: '2024-01-01T00:00:00Z',
      },
    })
    expect(screen.getByDisplayValue('Arroz')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2 kg')).toBeInTheDocument()
  })
})

describe('ItemForm — validação', () => {
  it('exibe erro quando nome está vazio e submit é clicado', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Adicionar' }))
    expect(await screen.findByText('Nome obrigatório')).toBeInTheDocument()
  })

  it('não chama onAdd quando nome está vazio', async () => {
    const { user, onAdd } = setup()
    await user.click(screen.getByRole('button', { name: 'Adicionar' }))
    await waitFor(() => expect(onAdd).not.toHaveBeenCalled())
  })
})

describe('ItemForm — submissão bem-sucedida', () => {
  it('chama onAdd com dados corretos', async () => {
    const { user, onAdd } = setup()
    await user.type(screen.getByPlaceholderText('O que adicionar?'), 'Leite')
    await user.click(screen.getByRole('button', { name: 'Adicionar' }))
    await waitFor(() =>
      expect(onAdd).toHaveBeenCalledWith({
        name: 'Leite',
        quantity: '1',
        is_online_purchase: false,
      })
    )
  })

  it('usa "1" como quantidade padrão quando campo está vazio', async () => {
    const { user, onAdd } = setup()
    await user.type(screen.getByPlaceholderText('O que adicionar?'), 'Pão')
    await user.click(screen.getByRole('button', { name: 'Adicionar' }))
    await waitFor(() =>
      expect(onAdd).toHaveBeenCalledWith(
        expect.objectContaining({ quantity: '1' })
      )
    )
  })

  it('passa is_online_purchase=true quando toggle está marcado', async () => {
    const { user, onAdd } = setup()
    await user.type(screen.getByPlaceholderText('O que adicionar?'), 'Notebook')
    await user.click(screen.getByLabelText('Compra online'))
    await user.click(screen.getByRole('button', { name: 'Adicionar' }))
    await waitFor(() =>
      expect(onAdd).toHaveBeenCalledWith(
        expect.objectContaining({ is_online_purchase: true })
      )
    )
  })

  it('chama onEdit com id e dados ao editar item existente', async () => {
    const initial = {
      id: 'item-42',
      list_id: 'list-1',
      name: 'Arroz',
      quantity: '1',
      month: '2024-03',
      checked: false,
      is_online_purchase: false,
      created_at: '2024-01-01T00:00:00Z',
    }
    const { user, onEdit } = setup({ initial })
    const nameInput = screen.getByDisplayValue('Arroz')
    await user.clear(nameInput)
    await user.type(nameInput, 'Arroz Integral')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))
    await waitFor(() =>
      expect(onEdit).toHaveBeenCalledWith('item-42', expect.objectContaining({ name: 'Arroz Integral' }))
    )
  })
})

describe('ItemForm — interações de teclado', () => {
  it('chama onClose ao pressionar Escape', async () => {
    const { user, onClose } = setup()
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })
})

describe('ItemForm — botão cancelar', () => {
  it('chama onClose ao clicar em Cancelar', async () => {
    const { user, onClose } = setup()
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalled()
  })
})
