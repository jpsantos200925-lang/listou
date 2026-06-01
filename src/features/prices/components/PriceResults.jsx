const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%23444' stroke-width='1.5' stroke-linecap='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21 15 16 10 5 21'/%3E%3C/svg%3E"

function formatCurrency(amount) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

export default function PriceResults({ results, loading }) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 py-2">
        <div className="flex gap-1.5 justify-center">
          <span className="w-1.5 h-1.5 rounded-full bg-gold-dim animate-pulse-dot" />
          <span className="w-1.5 h-1.5 rounded-full bg-gold-dim animate-pulse-dot [animation-delay:.2s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-gold-dim animate-pulse-dot [animation-delay:.4s]" />
        </div>
        <span className="text-[11px] text-label tracking-[.03em]">Buscando melhores preços…</span>
      </div>
    )
  }

  if (!results.length) return null

  return (
    <ul className="flex flex-col gap-1 animate-fade-up-sm">
      {results.map((r) => (
        <li key={r.id} className="rounded-md overflow-hidden bg-primary-4-item border border-primary-10 transition-[border-color] hover:border-primary-30">
          <a
            href={r.product_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 py-2 px-2.5 no-underline text-inherit"
          >
            <img
              src={r.image_url || PLACEHOLDER}
              alt={r.product_name}
              className="w-9 h-9 object-contain rounded-[4px] bg-white/4 shrink-0"
              onError={(e) => { e.currentTarget.src = PLACEHOLDER }}
            />
            <div className="flex-1 flex flex-col gap-0.5 min-w-0">
              <span className="text-[11px] text-text whitespace-nowrap overflow-hidden text-ellipsis leading-[1.3]">
                {r.product_name}
              </span>
              <span className="text-[9px] text-label tracking-[.03em]">{formatDate(r.found_at)}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[13px] font-bold text-primary whitespace-nowrap">
                {formatCurrency(r.price)}
              </span>
              <svg className="text-label opacity-60 transition-opacity group-hover:opacity-100" width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </div>
          </a>
        </li>
      ))}
    </ul>
  )
}
