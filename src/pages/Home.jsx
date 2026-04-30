import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useItems } from '../hooks/useItems'
import ItemForm from '../components/ItemForm'
import ItemList from '../components/ItemList'
import MonthSelector from '../components/MonthSelector'

function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

export default function Home({ session }) {
  const [month, setMonth] = useState(currentMonth())
  const { items, loading, addItem, toggleItem, deleteItem, copyFromMonth } = useItems(month)

  const checked = items.filter((i) => i.checked).length
  const total = items.length
  const pct = total > 0 ? Math.round((checked / total) * 100) : 0

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-header-brand">
          merca<span>dinho</span>
        </span>
        <button className="btn-logout" onClick={() => supabase.auth.signOut()}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sair
        </button>
      </header>

      <MonthSelector month={month} onChange={setMonth} onCopy={copyFromMonth} />

      {total > 0 && (
        <div className="progress-section">
          <div className="progress-bar-wrap">
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="progress-label">
              <strong>{checked}</strong>/{total}
            </span>
          </div>
        </div>
      )}

      <ItemForm onAdd={addItem} />

      <div className="divider" />

      {loading ? (
        <div className="loading-dots">
          <span /><span /><span />
        </div>
      ) : (
        <ItemList items={items} onToggle={toggleItem} onDelete={deleteItem} />
      )}
    </div>
  )
}
