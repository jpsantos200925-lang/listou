import { useEffect, useRef, useState } from 'react'
import type { Item, List } from '@/types'
import { PriceSearchSection } from '@/features/prices'
import { TrashIcon } from '@/shared/components/Icons'
import { ConfirmDialog } from '@/shared/components/ConfirmDialog'
import styles from './ItemList.module.css'

function CheckIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline className="animate-check-draw [stroke-dasharray:20]" points="20 6 9 17 4 12" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

const SWIPE_REVEAL = 84
const SWIPE_TRIGGER = 50

interface ItemRowProps {
  item: Item
  onToggle: (id: string, checked: boolean) => void
  onDelete: (id: string) => void
  onEditRequest: (item: Item) => void
}

function ItemRow({ item, onToggle, onDelete, onEditRequest }: ItemRowProps) {
  const [removing, setRemoving] = useState(false)
  const [offset, setOffsetState] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const offsetRef = useRef(0)
  const rowRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const startY = useRef(0)
  const lockedAxis = useRef<'x' | 'y' | null>(null)

  function setOffset(val: number) {
    offsetRef.current = val
    setOffsetState(val)
  }

  useEffect(() => {
    const el = rowRef.current
    if (!el) return
    const handleMove = (e: TouchEvent) => {
      if (lockedAxis.current === 'x') e.preventDefault()
    }
    el.addEventListener('touchmove', handleMove, { passive: false })
    return () => el.removeEventListener('touchmove', handleMove)
  }, [])

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0]
    if (!t) return
    startX.current = t.clientX
    startY.current = t.clientY
    lockedAxis.current = null
    setDragging(true)
  }

  function onTouchMove(e: React.TouchEvent) {
    const t = e.touches[0]
    if (!t) return
    const dx = t.clientX - startX.current
    const dy = t.clientY - startY.current
    if (!lockedAxis.current) {
      if (Math.abs(dx) <= 8 && Math.abs(dy) <= 8) return
      lockedAxis.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
    }
    if (lockedAxis.current !== 'x') return
    const base = offsetRef.current < 0 ? offsetRef.current : 0
    setOffset(Math.min(0, Math.max(dx + base, -SWIPE_REVEAL)))
  }

  function onTouchEnd() {
    setDragging(false)
    if (lockedAxis.current === 'x') {
      setOffset(offsetRef.current < -SWIPE_TRIGGER ? -SWIPE_REVEAL : 0)
    }
  }

  function handleDelete() {
    setOffset(0)
    setConfirmOpen(true)
  }

  function handleConfirmDelete() {
    setConfirmOpen(false)
    setRemoving(true)
    setTimeout(() => onDelete(item.id), 220)
  }

  function handleToggle() {
    if (offsetRef.current !== 0) {
      setOffset(0)
      return
    }
    onToggle(item.id, !item.checked)
  }

  function handleEditRequest() {
    setOffset(0)
    onEditRequest(item)
  }

  return (
    <>
    <div className={`${styles.entry} ${removing ? styles.removing : ''}`}>
      <div className={`${styles.swipeWrap} ${offset !== 0 ? styles.swiped : ''}`}>
        <button
          className={styles.swipeAction}
          onClick={handleDelete}
          aria-label="Remover"
          tabIndex={offset === 0 ? -1 : 0}
          aria-hidden={offset === 0}
        >
          <TrashIcon />
        </button>
        <div
          ref={rowRef}
          className={`${styles.itemRow} ${dragging ? styles.dragging : ''} group flex items-center gap-3 py-[13px] px-3.5 bg-item-bg border border-white/6 rounded-lg ${item.checked ? 'opacity-50 border-white/4' : 'hover:bg-item-bg-hover'}`}
          style={{ transform: `translateX(${offset}px)` }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <label
            className="relative shrink-0 w-5 h-5 cursor-pointer"
            onClick={e => {
              if (offsetRef.current !== 0) {
                e.preventDefault()
                setOffset(0)
              }
            }}
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={handleToggle}
              className={styles.checkboxInput}
            />
            <div className={styles.checkboxBox}>{item.checked && <CheckIcon />}</div>
          </label>

          <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
            <span
              className={`text-sm font-normal text-text whitespace-nowrap overflow-hidden text-ellipsis transition-all ${item.checked ? 'line-through text-text-40' : ''}`}
            >
              {item.name}
            </span>
            <span className="shrink-0 text-[10px] font-medium tracking-[.04em] text-label bg-white/6 border border-white/8 px-[7px] py-0.5 rounded-[20px] whitespace-nowrap">
              {item.quantity}
            </span>
          </div>

          <button
            className="bg-transparent border-none cursor-pointer p-[0.35rem] text-[#555] rounded-[5px] flex items-center justify-center transition-[color,background] duration-150 hover:text-[#aaa] hover:bg-white/5 shrink-0"
            onClick={handleEditRequest}
            aria-label="Editar"
          >
            <PencilIcon />
          </button>
          <button
            className="shrink-0 flex items-center justify-center w-7 h-7 bg-transparent border-none rounded-md text-text-3 text-base cursor-pointer opacity-0 pointer-events-none transition-[opacity,background,color] hover:bg-[rgba(160,69,53,.15)] hover:text-red [@media(hover:none)]:opacity-100 [@media(hover:none)]:pointer-events-auto group-hover:opacity-100 group-hover:pointer-events-auto"
            onClick={handleDelete}
            aria-label="Remover"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
      {item.is_online_purchase && <PriceSearchSection itemId={item.id} itemName={item.name} />}
    </div>

      {confirmOpen && (
        <ConfirmDialog
          title={`Remover "${item.name}"?`}
          message="O item será removido desta lista."
          confirmLabel="Remover"
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmOpen(false)}
        />
      )}
    </>
  )
}

interface ItemListProps {
  items: Item[]
  onToggle: (id: string, checked: boolean) => void
  onDelete: (id: string) => void
  onEditRequest: (item: Item) => void
  list?: List | null
}

export default function ItemList({ items, onToggle, onDelete, onEditRequest, list }: ItemListProps) {
  if (!items.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-5 p-12">
        <div className="w-[72px] h-[72px] rounded-[18px] bg-primary-12-item border-[1.5px] border-primary-25 flex items-center justify-center overflow-hidden mb-2 text-[1.8rem]">
          {list?.logo_url ? (
            <img
              src={list.logo_url}
              alt={list.name}
              className="w-full h-full object-cover rounded-[10px]"
            />
          ) : list ? (
            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: list.primary_color }}>
              {list.name.charAt(0).toUpperCase()}
            </span>
          ) : (
            '🧺'
          )}
        </div>
        <p className="text-text">Lista vazia por enquanto…</p>
        <span className="block mt-2.5 text-xs text-text-3 tracking-[.04em]">
          Toque no + para adicionar
        </span>
      </div>
    )
  }

  const pending = items.filter(i => !i.checked)
  const done = items.filter(i => i.checked)

  const sectionHeaderCls = 'flex items-center justify-between mb-2.5 px-0.5'
  const sectionTitleCls = 'text-[11px] font-semibold tracking-[.08em] uppercase text-label'
  const sectionCountCls = 'text-[11px] text-text-3 tracking-[.04em]'

  return (
    <>
      {pending.length > 0 && (
        <>
          <div className={sectionHeaderCls}>
            <span className={sectionTitleCls}>A comprar</span>
            <span className={sectionCountCls}>
              {pending.length} {pending.length === 1 ? 'item' : 'itens'}
            </span>
          </div>
          <div className="flex flex-col gap-4">
            {pending.map(item => (
              <ItemRow
                key={item.id}
                item={item}
                onToggle={onToggle}
                onDelete={onDelete}
                onEditRequest={onEditRequest}
              />
            ))}
          </div>
        </>
      )}

      {done.length > 0 && (
        <>
          <div className={sectionHeaderCls} style={{ marginTop: pending.length ? 20 : 0 }}>
            <span className={sectionTitleCls}>Comprados</span>
            <span className={sectionCountCls}>
              {done.length} {done.length === 1 ? 'item' : 'itens'}
            </span>
          </div>
          <div className="flex flex-col gap-4">
            {done.map(item => (
              <ItemRow
                key={item.id}
                item={item}
                onToggle={onToggle}
                onDelete={onDelete}
                onEditRequest={onEditRequest}
              />
            ))}
          </div>
        </>
      )}
    </>
  )
}
