import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Item } from '@/types'
import { signOut } from '@/features/auth'
import { useListBySlug } from '@/features/lists'
import { useItems, ItemForm, ItemList, MonthSelector } from '@/features/items'
import { currentMonth } from '@/features/items/utils/items.utils'
import { ExpenseSection } from '@/features/expenses'

export default function ListDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { list, loading: listLoading, notFound } = useListBySlug(slug)
  const [month, setMonth] = useState(currentMonth())
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)

  const {
    items,
    loading: itemsLoading,
    addItem,
    toggleItem,
    deleteItem,
    editItem,
    copyFromMonth,
  } = useItems(list?.id, month)

  useEffect(() => {
    if (notFound) navigate('/')
  }, [notFound, navigate])

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
      <div className="max-w-[480px] mx-auto px-4 w-full h-dvh flex flex-col overflow-hidden bg-[#0f0f0f]">
        <div className="flex gap-[6px] justify-center p-10">
          <span className="w-1.5 h-1.5 rounded-full bg-gold-dim animate-pulse-dot" />
          <span className="w-1.5 h-1.5 rounded-full bg-gold-dim animate-pulse-dot [animation-delay:.2s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-gold-dim animate-pulse-dot [animation-delay:.4s]" />
        </div>
      </div>
    )
  }

  if (!list) return null

  const checked = items.filter(i => i.checked).length
  const total = items.length
  const pct = total > 0 ? Math.round((checked / total) * 100) : 0

  return (
    <div className="max-w-[480px] mx-auto px-4 w-full h-dvh flex flex-col overflow-hidden animate-fade-in bg-[#0f0f0f]">
      <header className="flex items-center justify-between py-5 pb-4 border-b border-border mb-6">
        <button
          className="bg-transparent border-none cursor-pointer text-[#888] p-1 flex items-center transition-[color] duration-150 hover:text-[#ccc]"
          onClick={() => navigate('/')}
          aria-label="Voltar"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <span className="font-syne font-bold text-[1rem] tracking-[-0.02em] text-[var(--color-title,#f5f5f5)] flex items-center gap-2">
          {list.logo_url ? (
            <img
              src={list.logo_url}
              alt={list.name}
              className="w-[22px] h-[22px] rounded-[5px] object-cover"
            />
          ) : (
            <span
              className="w-6 h-6 rounded-[6px] flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ background: list.primary_color }}
            >
              {list.name.charAt(0).toUpperCase()}
            </span>
          )}
          {list.name}
        </span>

        <button
          className="flex items-center gap-[6px] py-[7px] px-3 bg-surface-2 border border-border rounded-[20px] text-text-2 font-body text-xs font-medium tracking-[.03em] cursor-pointer transition-all hover:border-border-lt hover:text-text-1"
          onClick={signOut}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sair
        </button>
      </header>

      <MonthSelector month={month} onChange={setMonth} onCopy={copyFromMonth} />

      <ExpenseSection listId={list.id} month={month} />

      {total > 0 && (
        <div className="mb-6 animate-[fadeUp_.4s_ease_.15s_both]">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-[3px] bg-surface-3 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-gold-dim),var(--color-gold))] transition-[width] duration-[600ms] ease-[cubic-bezier(.4,0,.2,1)]"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-medium text-text-40 whitespace-nowrap tracking-[.04em]">
              <strong className="text-gold font-semibold">{checked}</strong>/{total}
            </span>
          </div>
        </div>
      )}

      <div className="items-scroll flex-1 overflow-y-auto pr-2 pb-[max(80px,env(safe-area-inset-bottom))]">
        {itemsLoading ? (
          <div className="flex gap-[6px] justify-center p-10">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-dim animate-pulse-dot" />
            <span className="w-1.5 h-1.5 rounded-full bg-gold-dim animate-pulse-dot [animation-delay:.2s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-gold-dim animate-pulse-dot [animation-delay:.4s]" />
          </div>
        ) : (
          <ItemList
            items={items}
            onToggle={toggleItem}
            onDelete={deleteItem}
            onEditRequest={item => {
              setEditingItem(item)
              setFormOpen(true)
            }}
            list={list}
          />
        )}
      </div>

      <button
        className="fixed right-[max(20px,env(safe-area-inset-right))] bottom-[max(24px,env(safe-area-inset-bottom))] w-14 h-14 rounded-full border-none bg-[linear-gradient(135deg,var(--color-gold),var(--color-gold-lt))] text-white flex items-center justify-center cursor-pointer z-50 animate-[fadeUp_.4s_ease_.2s_both] shadow-[0_8px_24px_color-mix(in_srgb,var(--color-primary)_32%,transparent),0_2px_6px_rgba(0,0,0,.08)] transition-[transform,box-shadow] hover:-translate-y-0.5 active:scale-95"
        onClick={() => setFormOpen(true)}
        aria-label="Adicionar item"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <ItemForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingItem(null)
        }}
        onAdd={addItem}
        onEdit={editItem}
        initial={editingItem}
      />
    </div>
  )
}
