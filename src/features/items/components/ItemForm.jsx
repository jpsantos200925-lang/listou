import { useEffect, useRef, useState } from 'react'

export default function ItemForm({ open, onClose, onAdd, onEdit, initial }) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const nameRef = useRef(null)
  const isEditing = Boolean(initial)

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? '')
      setQuantity(initial?.quantity ?? '')
      setTimeout(() => nameRef.current?.focus(), 80)
    } else {
      setName('')
      setQuantity('')
    }
  }, [open, initial])

  useEffect(() => {
    if (!open) return
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    const payload = { name: name.trim(), quantity: quantity.trim() || '1' }
    if (isEditing) {
      await onEdit(initial.id, payload)
      onClose()
    } else {
      await onAdd(payload)
      setName('')
      setQuantity('')
      setTimeout(() => nameRef.current?.focus(), 50)
    }
  }

  if (!open) return null

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <h3 className="sheet-title">{isEditing ? 'Editar item' : 'Novo item'}</h3>
        <form className="sheet-form" onSubmit={handleSubmit}>
          <input
            ref={nameRef}
            className="item-form-input"
            placeholder="O que adicionar?"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="off"
            enterKeyHint="next"
          />
          <input
            className="item-form-input"
            placeholder="Quantidade (ex: 2 kg)"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            autoComplete="off"
            enterKeyHint="done"
          />
          <div className="sheet-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-primary sheet-submit">
              {isEditing ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
