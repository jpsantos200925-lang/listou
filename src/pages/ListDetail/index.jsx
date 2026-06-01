import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { signOut } from '@/features/auth'
import { useListBySlug } from '@/features/lists'
import { useItems, ItemForm, ItemList, MonthSelector } from '@/features/items'
import { currentMonth } from '@/features/items/utils/items.utils'

export default function ListDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { list, loading: listLoading, notFound } = useListBySlug(slug)
  const [month, setMonth] = useState(currentMonth())
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  const { items, loading: itemsLoading, addItem, toggleItem, deleteItem, editItem, copyFromMonth } = useItems(list?.id, month)

  useEffect(() => {
    if (notFound) navigate('/')
  }, [notFound, navigate])

  // Aplica tema da lista via CSS custom properties
  useEffect(() => {
    if (!list) return
    const root = document.documentElement
    root.style.setProperty('--color-primary', list.primary_color)
    root.style.setProperty('--color-secondary', list.secondary_color)
    root.style.setProperty('--color-bg', list.bg_color)
    root.style.setProperty('--color-text', list.font_color || '#f0f0f0')
    root.style.setProperty('--color-title', list.title_color || '#f5f5f5')
    root.style.setProperty('--color-label', list.label_color || '#888888')
    root.style.setProperty('--color-item-bg', list.item_bg_color || '#1e1e1e')
    return () => {
      root.style.removeProperty('--color-primary')
      root.style.removeProperty('--color-secondary')
      root.style.removeProperty('--color-bg')
      root.style.removeProperty('--color-text')
      root.style.removeProperty('--color-title')
      root.style.removeProperty('--color-label')
      root.style.removeProperty('--color-item-bg')
    }
  }, [list])

  if (listLoading) {
    return (
      <div className="app">
        <div className="loading-dots"><span /><span /><span /></div>
      </div>
    )
  }

  if (!list) return null

  const checked = items.filter(i => i.checked).length
  const total = items.length
  const pct = total > 0 ? Math.round((checked / total) * 100) : 0

  return (
    <div className="app">
      <header className="app-header">
        <button className="btn-back" onClick={() => navigate('/')} aria-label="Voltar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="app-header-brand list-header-brand">
          {list.logo_url ? (
            <img src={list.logo_url} alt={list.name} className="header-logo" />
          ) : (
            <span className="header-logo-placeholder" style={{ background: list.primary_color }}>
              {list.name.charAt(0).toUpperCase()}
            </span>
          )}
          {list.name}
        </span>
        <button className="btn-logout" onClick={signOut}>
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

      <div className="items-scroll">
        {itemsLoading ? (
          <div className="loading-dots"><span /><span /><span /></div>
        ) : (
          <ItemList
            items={items}
            onToggle={toggleItem}
            onDelete={deleteItem}
            onEditRequest={(item) => { setEditingItem(item); setFormOpen(true) }}
            list={list}
          />
        )}
      </div>

      <button className="fab" onClick={() => setFormOpen(true)} aria-label="Adicionar item">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <ItemForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingItem(null) }}
        onAdd={addItem}
        onEdit={editItem}
        initial={editingItem}
      />
    </div>
  )
}
