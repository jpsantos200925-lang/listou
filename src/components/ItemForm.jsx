import { useState } from 'react'

export default function ItemForm({ onAdd }) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    await onAdd({ name: name.trim(), quantity: quantity.trim() || '1' })
    setName('')
    setQuantity('')
  }

  return (
    <form className="item-form" onSubmit={handleSubmit}>
      <input
        className="item-form-input"
        placeholder="Adicionar item…"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoComplete="off"
      />
      <input
        className="item-form-input item-form-qty"
        placeholder="Qtd"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        autoComplete="off"
      />
      <button className="btn-add" type="submit" aria-label="Adicionar">
        +
      </button>
    </form>
  )
}
