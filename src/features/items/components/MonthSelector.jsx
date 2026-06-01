import { useState } from 'react'
import { formatMonth, addMonths } from '../utils/items.utils'

export default function MonthSelector({ month, onChange, onCopy }) {
  const [copying, setCopying] = useState(false)
  const { name, year } = formatMonth(month)

  async function handleCopy() {
    setCopying(true)
    await onCopy(addMonths(month, -1))
    setCopying(false)
  }

  return (
    <div className="text-center mb-7 animate-[fadeUp_.4s_ease_.1s_both]">
      <div className="flex items-center justify-center gap-5 mb-3">
        <button
          className="flex items-center justify-center w-9 h-9 bg-surface-2 border border-border rounded-full text-text-2 text-base cursor-pointer transition-all shrink-0 hover:bg-surface-3 hover:border-border-lt hover:text-text-1"
          onClick={() => onChange(addMonths(month, -1))}
          aria-label="Mês anterior"
        >
          ‹
        </button>

        <div className="flex flex-col items-center min-w-[180px]">
          <span className="font-display text-[2.4rem] font-medium text-text leading-none tracking-[-0.01em]">
            {name}
          </span>
          <span className="text-xs font-medium tracking-widest uppercase text-text-3 mt-1">
            {year}
          </span>
        </div>

        <button
          className="flex items-center justify-center w-9 h-9 bg-surface-2 border border-border rounded-full text-text-2 text-base cursor-pointer transition-all shrink-0 hover:bg-surface-3 hover:border-border-lt hover:text-text-1"
          onClick={() => onChange(addMonths(month, 1))}
          aria-label="Próximo mês"
        >
          ›
        </button>
      </div>

      <button
        className="inline-flex items-center gap-1.5 py-1.5 px-3.5 bg-transparent border border-border rounded-[20px] text-text-3 font-body text-xs font-normal tracking-[.03em] cursor-pointer transition-all hover:border-gold-dim hover:text-gold disabled:opacity-50 disabled:cursor-default"
        onClick={handleCopy}
        disabled={copying}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        {copying ? 'Copiando…' : 'Copiar mês anterior'}
      </button>
    </div>
  )
}
