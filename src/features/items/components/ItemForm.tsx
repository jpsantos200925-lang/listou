import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Item } from '@/types'
import { itemSchema, type ItemFormData } from '@/schemas/item.schema'
import { sheetInputCls } from '@/shared/styles/inputs'

interface ItemFormProps {
  open: boolean
  onClose: () => void
  onAdd: (payload: ItemFormData) => Promise<unknown>
  onEdit: (id: string, payload: ItemFormData) => Promise<unknown>
  initial?: Item | null
}

export default function ItemForm({ open, onClose, onAdd, onEdit, initial }: ItemFormProps) {
  const isEditing = Boolean(initial)

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: { name: '', quantity: '', is_online_purchase: false },
  })

  useEffect(() => {
    if (!open) {
      reset()
      return
    }
    reset({
      name: initial?.name ?? '',
      quantity: initial?.quantity ?? '',
      is_online_purchase: initial?.is_online_purchase ?? false,
    })
    setTimeout(() => setFocus('name'), 80)
  }, [open, initial, reset, setFocus])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  async function onSubmit(data: ItemFormData) {
    const payload: ItemFormData = {
      name: data.name.trim(),
      quantity: data.quantity.trim() || '1',
      is_online_purchase: data.is_online_purchase,
    }
    try {
      if (isEditing && initial) {
        await onEdit(initial.id, payload)
        onClose()
      } else {
        await onAdd(payload)
        reset({ name: '', quantity: '', is_online_purchase: false })
        setTimeout(() => setFocus('name'), 50)
      }
    } catch {
      // erro já reportado via toast no hook
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

        <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-1">
            <input
              className={`${sheetInputCls} ${errors.name ? 'border-red-500/60' : ''}`}
              placeholder="O que adicionar?"
              autoComplete="off"
              enterKeyHint="next"
              maxLength={200}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-[11px] text-red-400 pl-1">{errors.name.message}</p>
            )}
          </div>

          <input
            className={sheetInputCls}
            placeholder="Quantidade (ex: 2 kg)"
            autoComplete="off"
            enterKeyHint="done"
            maxLength={50}
            {...register('quantity')}
          />

          {/* Toggle switch usando Tailwind peer */}
          <label className="flex items-center gap-2.5 cursor-pointer py-1 px-0.5 select-none">
            <input
              type="checkbox"
              className="peer sr-only"
              {...register('is_online_purchase')}
            />
            <span
              className="relative w-9 h-5 shrink-0 rounded-[10px] border border-border bg-surface-3 transition-[background,border-color]
              after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-3.5 after:h-3.5 after:rounded-full after:bg-text-3 after:transition-[transform,background]
              peer-checked:bg-primary-20 peer-checked:border-primary
              peer-checked:after:translate-x-4 peer-checked:after:bg-primary"
            />
            <span className="text-[13px] text-text-2 font-medium transition-[color] peer-checked:text-primary">
              Compra online
            </span>
          </label>

          <div className="flex gap-2.5 mt-2">
            <button
              type="button"
              className="shrink-0 px-[22px] py-[13px] bg-transparent border border-border rounded-lg text-text-2 font-body text-sm font-medium cursor-pointer transition-all hover:bg-surface-2 hover:text-text-1"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-[13px] bg-[linear-gradient(135deg,var(--color-gold),var(--color-gold-lt))] border-none rounded-lg text-white font-body text-sm font-semibold tracking-[.04em] cursor-pointer transition-[opacity,transform] hover:opacity-90 hover:-translate-y-px active:translate-y-0 disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando…' : isEditing ? 'Salvar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
