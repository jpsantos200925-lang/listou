import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Login from './index'

vi.mock('@/features/auth', () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
  useAuth: vi.fn(() => ({ session: null, loading: false })),
}))

import { signIn } from '@/features/auth'
const mockSignIn = vi.mocked(signIn)

beforeEach(() => {
  mockSignIn.mockReset()
})

function setup() {
  return { user: userEvent.setup(), ...render(<Login />) }
}

describe('Login — renderização', () => {
  it('exibe o título Listou', () => {
    setup()
    expect(screen.getByText('Listou')).toBeInTheDocument()
  })

  it('exibe campos de e-mail e senha', () => {
    setup()
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
  })

  it('exibe botão Entrar', () => {
    setup()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })
})

describe('Login — validação de campos', () => {
  it('exibe erro de e-mail inválido quando submetido vazio', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByText('E-mail inválido')).toBeInTheDocument()
  })

  it('exibe erro de senha obrigatória quando submetido vazio', async () => {
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByText('Senha obrigatória')).toBeInTheDocument()
  })

  it('exibe erro de e-mail quando formato é inválido', async () => {
    const { user } = setup()
    await user.type(screen.getByLabelText(/e-mail/i), 'isso-nao-e-email')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByText('E-mail inválido')).toBeInTheDocument()
  })

  it('não exibe erros de validação antes de submeter', () => {
    setup()
    expect(screen.queryByText('E-mail inválido')).not.toBeInTheDocument()
    expect(screen.queryByText('Senha obrigatória')).not.toBeInTheDocument()
  })
})

describe('Login — submissão bem-sucedida', () => {
  it('chama signIn com email e senha corretos', async () => {
    mockSignIn.mockResolvedValueOnce(undefined)
    const { user } = setup()

    await user.type(screen.getByLabelText(/e-mail/i), 'user@example.com')
    await user.type(screen.getByLabelText(/senha/i), 'senha123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() =>
      expect(mockSignIn).toHaveBeenCalledWith('user@example.com', 'senha123')
    )
  })
})

describe('Login — erro de servidor', () => {
  it('exibe mensagem de erro quando signIn falha', async () => {
    mockSignIn.mockRejectedValueOnce(new Error('Invalid credentials'))
    const { user } = setup()

    await user.type(screen.getByLabelText(/e-mail/i), 'user@example.com')
    await user.type(screen.getByLabelText(/senha/i), 'senha123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('E-mail ou senha inválidos.')).toBeInTheDocument()
  })

  it('não exibe erro de servidor antes de submeter', () => {
    setup()
    expect(screen.queryByText('E-mail ou senha inválidos.')).not.toBeInTheDocument()
  })
})

describe('Login — estado de loading', () => {
  it('desabilita o botão enquanto submete', async () => {
    let resolve: () => void
    mockSignIn.mockReturnValueOnce(
      new Promise<void>(r => { resolve = r })
    )
    const { user } = setup()

    await user.type(screen.getByLabelText(/e-mail/i), 'user@example.com')
    await user.type(screen.getByLabelText(/senha/i), 'senha123')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /entrando/i })).toBeDisabled()
    )
    await act(async () => { resolve!() })
  })
})
