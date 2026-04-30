import { useState } from 'react'

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
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

function ItemRow({ item, onToggle, onDelete }) {
  const [removing, setRemoving] = useState(false)

  async function handleDelete() {
    setRemoving(true)
    setTimeout(() => onDelete(item.id), 220)
  }

  return (
    <li
      className={`item-row${item.checked ? ' is-checked' : ''}${removing ? ' is-removing' : ''}`}
      style={{ animationDelay: `${Math.random() * 60}ms` }}
    >
      <label className="item-checkbox">
        <input
          type="checkbox"
          checked={item.checked}
          onChange={() => onToggle(item.id, !item.checked)}
        />
        <div className="item-checkbox-box">
          {item.checked && <CheckIcon />}
        </div>
      </label>

      <div className="item-body">
        <span className="item-name">{item.name}</span>
        <span className="item-qty">{item.quantity}</span>
      </div>

      <button className="btn-delete" onClick={handleDelete} aria-label="Remover">
        <TrashIcon />
      </button>
    </li>
  )
}

export default function ItemList({ items, onToggle, onDelete }) {
  if (!items.length) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🧺</div>
        <p>Lista vazia por enquanto…</p>
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
              <ItemRow key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} />
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
              <ItemRow key={item.id} item={item} onToggle={onToggle} onDelete={onDelete} />
            ))}
          </ul>
        </>
      )}
    </>
  )
}
