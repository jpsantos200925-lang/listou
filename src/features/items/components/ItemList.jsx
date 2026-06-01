import { useEffect, useRef, useState } from 'react'

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
      stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

const SWIPE_REVEAL = 84
const SWIPE_TRIGGER = 50

function ItemRow({ item, onToggle, onDelete, onEditRequest }) {
  const [removing, setRemoving] = useState(false)
  const [offset, setOffsetState] = useState(0)
  const [dragging, setDragging] = useState(false)

  const offsetRef = useRef(0)
  const rowRef = useRef(null)
  const startX = useRef(0)
  const startY = useRef(0)
  const lockedAxis = useRef(null)

  function setOffset(val) {
    offsetRef.current = val
    setOffsetState(val)
  }

  useEffect(() => {
    const el = rowRef.current
    if (!el) return
    const handleMove = (e) => {
      if (lockedAxis.current === 'x') e.preventDefault()
    }
    el.addEventListener('touchmove', handleMove, { passive: false })
    return () => el.removeEventListener('touchmove', handleMove)
  }, [])

  function onTouchStart(e) {
    const t = e.touches[0]
    startX.current = t.clientX
    startY.current = t.clientY
    lockedAxis.current = null
    setDragging(true)
  }

  function onTouchMove(e) {
    const t = e.touches[0]
    const dx = t.clientX - startX.current
    const dy = t.clientY - startY.current

    if (!lockedAxis.current) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        lockedAxis.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
      } else return
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
    setRemoving(true)
    setTimeout(() => onDelete(item.id), 220)
  }

  function handleToggle() {
    if (offsetRef.current !== 0) { setOffset(0); return }
    onToggle(item.id, !item.checked)
  }

  function handleEditRequest() {
    setOffset(0)
    onEditRequest(item)
  }

  return (
    <li className={`item-swipe-wrap${removing ? ' is-removing' : ''}${offset !== 0 ? ' is-swiped' : ''}`}>
      <button
        className="item-swipe-action"
        onClick={handleDelete}
        aria-label="Remover"
        tabIndex={offset === 0 ? -1 : 0}
        aria-hidden={offset === 0}
      >
        <TrashIcon />
      </button>
      <div
        ref={rowRef}
        className={`item-row${item.checked ? ' is-checked' : ''}${dragging ? ' is-dragging' : ''}`}
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <label className="item-checkbox" onClick={(e) => { if (offsetRef.current !== 0) { e.preventDefault(); setOffset(0) } }}>
          <input type="checkbox" checked={item.checked} onChange={handleToggle} />
          <div className="item-checkbox-box">
            {item.checked && <CheckIcon />}
          </div>
        </label>

        <div className="item-body">
          <span className="item-name">{item.name}</span>
          <span className="item-qty">{item.quantity}</span>
        </div>

        <button className="btn-edit" onClick={handleEditRequest} aria-label="Editar">
          <PencilIcon />
        </button>
        <button className="btn-delete" onClick={handleDelete} aria-label="Remover">
          <TrashIcon />
        </button>
      </div>
    </li>
  )
}

export default function ItemList({ items, onToggle, onDelete, onEditRequest, list }) {
  if (!items.length) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          {list?.logo_url ? (
            <img src={list.logo_url} alt={list.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px' }} />
          ) : list ? (
            <span style={{ fontSize: '1.4rem', fontWeight: 700, color: list.primary_color }}>
              {list.name.charAt(0).toUpperCase()}
            </span>
          ) : '🧺'}
        </div>
        <p>Lista vazia por enquanto…</p>
        <span className="empty-state-hint">Toque no + para adicionar</span>
      </div>
    )
  }

  const pending = items.filter((i) => !i.checked)
  const done    = items.filter((i) => i.checked)

  return (
    <>
      {pending.length > 0 && (
        <>
          <div className="item-list-header">
            <span className="item-list-title">A comprar</span>
            <span className="item-list-count">{pending.length} {pending.length === 1 ? 'item' : 'itens'}</span>
          </div>
          <ul className="item-list">
            {pending.map((item) => (
              <ItemRow key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} onEditRequest={onEditRequest} />
            ))}
          </ul>
        </>
      )}

      {done.length > 0 && (
        <>
          <div className="item-list-header" style={{ marginTop: pending.length ? 20 : 0 }}>
            <span className="item-list-title">Comprados</span>
            <span className="item-list-count">{done.length} {done.length === 1 ? 'item' : 'itens'}</span>
          </div>
          <ul className="item-list">
            {done.map((item) => (
              <ItemRow key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} onEditRequest={onEditRequest} />
            ))}
          </ul>
        </>
      )}
    </>
  )
}
