import { useState } from 'react'

const MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

function parseMonth(month) {
  const [year, m] = month.split('-').map(Number)
  return { year, m }
}

function formatMonth(month) {
  const { year, m } = parseMonth(month)
  return { name: MONTHS[m - 1], year }
}

function addMonths(month, delta) {
  const { year, m } = parseMonth(month)
  const d = new Date(year, m - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function MonthSelector({ month, onChange, onCopy }) {
  const [copying, setCopying] = useState(false)
  const { name, year } = formatMonth(month)

  async function handleCopy() {
    setCopying(true)
    await onCopy(addMonths(month, -1))
    setCopying(false)
  }

  return (
    <div className="month-selector">
      <div className="month-nav">
        <button
          className="month-nav-btn"
          onClick={() => onChange(addMonths(month, -1))}
          aria-label="Mês anterior"
        >
          ‹
        </button>

        <div className="month-display">
          <span className="month-name">{name}</span>
          <span className="month-year">{year}</span>
        </div>

        <button
          className="month-nav-btn"
          onClick={() => onChange(addMonths(month, 1))}
          aria-label="Próximo mês"
        >
          ›
        </button>
      </div>

      <button className="btn-copy-month" onClick={handleCopy} disabled={copying}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        {copying ? 'Copiando…' : 'Copiar mês anterior'}
      </button>
    </div>
  )
}
