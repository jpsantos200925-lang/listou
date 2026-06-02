import { useEffect, useRef, useState } from 'react'
import { sheetInputCls } from '@/shared/styles/inputs'

export default function ItemForm({ open, onClose, onAdd, onEdit, initial }) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [isOnline, setIsOnline] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const nameRef = useRef(null)
  const isEditing = Boolean(initial)

  useEffect(() => {
    if (!open) {
      setName('')
      setQuantity('')
      setIsOnline(false)
      setSubmitting(false)
      return
    }
    setName(initial?.name ?? '')
    setQuantity(initial?.quantity ?? '')
    setIsOnline(initial?.is_online_purchase ?? false)
    setTimeout(() => nameRef.current?.focus(), 80)
  }, [open, initial])

  useEffect(() => {
    if (!open) return
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || submitting) return
    const payload = { name: name.trim(), quantity: quantity.trim() || '1', is_online_purchase: isOnline }
    setSubmitting(true)
    try {
      if (isEditing) {
        await onEdit(initial.id, payload)
        onClose()
      } else {
        await onAdd(payload)
        setName('')
        setQuantity('')
        setTimeout(() => nameRef.current?.focus(), 50)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-[rgba(28,24,20,.45)] backdrop-blur-sm z-100 flex items-end justify-center animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] bg-surface rounded-[20px_20px_0_0] px-[22px] pt-3 pb-[max(28px,env(safe-area-inset-bottom))] animate-sheet-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-3.5" />
        <h3 className="font-syne text-[1.1rem] font-bold tracking-[-0.02em] text-primary mb-[18px] text-left">
          {isEditing ? 'Editar item' : 'Novo item'}
        </h3>

        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <input
            ref={nameRef}
            className={sheetInputCls}
            placeholder="O que adicionar?"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="off"
            enterKeyHint="next"
            maxLength={200}
          />
          <input
            className={sheetInputCls}
            placeholder="Quantidade (ex: 2 kg)"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            autoComplete="off"
            enterKeyHint="done"
            maxLength={50}
          />

          {/* Toggle switch usando Tailwind peer */}
          <label className="flex items-center gap-2.5 cursor-pointer py-1 px-0.5 select-none">
            <input
              type="checkbox"
              checked={isOnline}
              onChange={(e) => setIsOnline(e.target.checked)}
              className="peer sr-only"
            />
            <span className="relative w-9 h-5 shrink-0 rounded-[10px] border border-border bg-surface-3 transition-[background,border-color]
              after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-3.5 after:h-3.5 after:rounded-full after:bg-text-3 after:transition-[transform,background]
              peer-checked:bg-primary-20 peer-checked:border-primary
              peer-checked:after:translate-x-4 peer-checked:after:bg-primary" />
            <span className="text-[13px] text-text-2 font-medium transition-[color] peer-checked:text-primary">
              Compra online
            </span>
          </label>

          <div className="flex gap-2.5 mt-2">
            <button
              type="button"
              className="shrink-0 px-[22px] py-[13px] bg-transparent border border-border rounded-lg text-text-2 font-body text-sm font-medium cursor-pointer transition-all hover:bg-surface-2 hover:text-text-1"
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-[13px] bg-[linear-gradient(135deg,var(--color-gold),var(--color-gold-lt))] border-none rounded-lg text-white font-body text-sm font-semibold tracking-[.04em] cursor-pointer transition-[opacity,transform] hover:opacity-90 hover:-translate-y-px active:translate-y-0 disabled:opacity-50"
            >
              {submitting ? 'Salvando…' : isEditing ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
