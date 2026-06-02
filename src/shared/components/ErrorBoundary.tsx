import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  message: string | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, message: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error?.message ?? 'Erro desconhecido' }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="max-w-[480px] mx-auto px-6 w-full h-dvh flex flex-col items-center justify-center gap-5 bg-[#0f0f0f]">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div className="text-center flex flex-col gap-2">
          <p className="text-[0.95rem] font-semibold text-[#f0f0f0]">Algo deu errado</p>
          <p className="text-[0.8rem] text-[#666] leading-relaxed">{this.state.message}</p>
        </div>
        <button
          className="px-5 py-2.5 bg-surface-2 border border-border rounded-lg text-text-2 text-sm font-medium cursor-pointer transition-all hover:border-border-lt hover:text-text-1"
          onClick={() => this.setState({ hasError: false, message: null })}
        >
          Tentar novamente
        </button>
      </div>
    )
  }
}
