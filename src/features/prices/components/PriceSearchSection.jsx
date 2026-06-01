import { usePriceSearch } from '../hooks/usePriceSearch'
import PriceResults from './PriceResults'

export default function PriceSearchSection({ itemId, itemName }) {
  const { results, loading, initialLoading, search } = usePriceSearch(itemId, itemName)
  const hasResults = results.length > 0

  return (
    <div className="px-3.5 pt-2.5 pb-3 bg-primary-5-item border border-primary-12 border-t-0 rounded-b-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-[5px] text-[10px] font-semibold tracking-[.07em] uppercase text-label">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          Compra online
        </span>
        <button
          className="flex items-center gap-[5px] py-[5px] px-2.5 bg-primary-12 border border-primary-25 rounded-[20px] text-primary font-body text-[11px] font-semibold tracking-[.03em] cursor-pointer transition-all hover:not-disabled:bg-primary-20 disabled:cursor-default disabled:opacity-80"
          onClick={search}
          disabled={loading}
          aria-label={hasResults ? 'Atualizar preços' : 'Buscar preços'}
        >
          {loading ? (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                className="animate-spin">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Buscando…
            </>
          ) : hasResults ? (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Atualizar
            </>
          ) : (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Buscar preços
            </>
          )}
        </button>
      </div>

      {!initialLoading && <PriceResults results={results} loading={loading} />}
    </div>
  )
}
